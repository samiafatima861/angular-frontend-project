const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');

//const Flight = require('./Models/flightModel');
const FlightDetails = require('./Models/flightDetail');
const FlightManager = require('./Models/FlightManager')
//const Booking = require('./Models/Booking');

const app = express();

app.use(cors());


app.use(bodyParser.json());
class User{
  firstName;
  lastName;
  email;
  password;
  address1;
  address2;
  city;
  state;
  zip;

  constructor(firstName, lastName, email, password, address1,
    address2,
    city,
    state,
    zip){
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.address1 = address1;
    this.address2 = address2;
    this.city = city;
    this.state = state;
    this.zip = zip
  }
}
const users = [];

app.post('/createUser', (req, res) => {
  const { firstName, lastName, email, password, address1, address2, city, state, zip } = req.body;

  // Create a new user with the provided data
  //const user = user.find((user) => user.username === username && user.password === password);
  const newUser = new User(firstName,lastName,email,password, address1, address2, city,state,zip);
  users.push(newUser);
  res.status(200).json({ message: 'User registered successfully' });
 });

app.post('/login', (req, res) => {
  const { _email, _password } = req.body;
  //console.log("login" + _email)

  // Find the user with the provided credentials
  const user = users.find((user) => user.email === _email && user.password === _password);
  console.log(user)
  if (user) {
    console.log(user)
    // Create a payload object with user data    
      const payload = {
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        role: 'user',
    };
    const token = jwt.sign(payload,'123');
    res.status(200).json({ message: 'Login successful', token:token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    req.user = null; // No user authenticated
    return next(); // Continue without authentication
  }
  
  try {
    const decoded = jwt.verify(token, '123');
    req.user = decoded;
  } catch (ex) {
    req.user = null; // Invalid token
  }
  
  next();
};

// Apply authentication middleware to all routes
app.use(authenticateToken);

// Public endpoints (accessible without authentication)
app.get('/popular-destinations', (req, res) => {
  try {
    let flightDetails = new FlightDetails();
    const popularRoutes = flightDetails.routePrices
      .filter(route => route.route !== 'default')
      .map(route => {
        const [source, destination] = route.route.split('-');
        return {
          code: destination,
          city: `Destination City (${destination})`,
          country: 'Destination Country',
          price: route.price
        };
      })
      .slice(0, 5); // Return top 5 destinations
      
    res.json(popularRoutes);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/iata-codes', (req, res) => {
  try {
    let flightDetails = new FlightDetails();
    const iataCodes = flightDetails.routePrices
      .filter(route => route.route !== 'default')
      .flatMap(route => {
        const [source, destination] = route.route.split('-');
        return [
          { code: source, name: `${source} International Airport` },
          { code: destination, name: `${destination} International Airport` }
        ];
      })
      .filter((code, index, self) => 
        index === self.findIndex(c => c.code === code.code)
      ); // Remove duplicates
      
    res.json(iataCodes);
  } catch (error) {
    console.error('Error fetching IATA codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to provide flight source and destination data
app.get('/flights', (req, res) => {
  try {
    let flightDetails = new FlightDetails();
    res.json(flightDetails.routePrices);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint to handle user input for flight price
app.post('/flights', (req, res) => {
  try {
    const {
      source,
      destination,
      dateOfTravel,
      numberOfAdults,
      numberOfChildren,
      travelClass
    } = req.body;

    // Validate required fields
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }
    
    if (!dateOfTravel) {
      return res.status(400).json({ error: 'Date of travel is required' });
    }
    
    if (!numberOfAdults && !numberOfChildren) {
      return res.status(400).json({ error: 'At least one passenger is required' });
    }

    let flightManager = new FlightManager();
    const totalPrice = flightManager.calculatePrice(source, destination, numberOfAdults, numberOfChildren, dateOfTravel);    
    
    if (typeof totalPrice === 'number') {
      res.status(200).json({ totalPrice: totalPrice });
    } else {
      res.status(404).json({ error: totalPrice });
    }   
  } catch (error) {
    console.error('Error calculating flight price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for round-trip flight price
app.post('/roundTripFlightPrice', (req, res) => {
  try {
    const { source, destination, dateOfTravel, returnDate, numberOfAdults, numberOfChildren, travelClass } = req.body;
    
    if (!source || !destination || !dateOfTravel || !returnDate) {
      return res.status(400).json({ error: 'Missing required fields for round-trip flight' });
    }
    
    // Create FlightManager instance
    const flightManager = new FlightManager();
    
    // Calculate outbound flight price
    const outboundPrice = flightManager.calculatePrice(source, destination, numberOfAdults, numberOfChildren, dateOfTravel);
    
    if (typeof outboundPrice !== 'number') {
      return res.status(404).json({ error: outboundPrice });
    }
    
    // Calculate return flight price (may have different pricing)
    const returnPrice = flightManager.calculatePrice(destination, source, numberOfAdults, numberOfChildren, returnDate);
    
    if (typeof returnPrice !== 'number') {
      return res.status(404).json({ error: returnPrice });
    }
    
    // Apply a small discount for round-trip (5%)
    const totalBeforeDiscount = outboundPrice + returnPrice;
    const discount = totalBeforeDiscount * 0.05;
    const totalPrice = totalBeforeDiscount - discount;
    
    return res.json({ totalPrice: Math.round(totalPrice * 100) / 100 });
  } catch (error) {
    console.error('Error calculating round-trip flight price:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for multi-city flight price
app.post('/multiCityFlightPrice', (req, res) => {
  try {
    const { segments, numberOfAdults, numberOfChildren, travelClass } = req.body;
    
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid segments for multi-city flight' });
    }
    
    // Create FlightManager instance
    const flightManager = new FlightManager();
    
    // Calculate price for each segment
    let totalPrice = 0;
    let errorMessage = null;
    
    for (const segment of segments) {
      const { source, destination, dateOfTravel } = segment;
      
      if (!source || !destination || !dateOfTravel) {
        return res.status(400).json({ error: 'Missing required fields in one or more segments' });
      }
      
      const segmentPrice = flightManager.calculatePrice(source, destination, numberOfAdults, numberOfChildren, dateOfTravel);
      
      if (typeof segmentPrice !== 'number') {
        errorMessage = `${segmentPrice} (Segment: ${source} to ${destination})`;
        break;
      }
      
      totalPrice += segmentPrice;
    }
    
    if (errorMessage) {
      return res.status(404).json({ error: errorMessage });
    }
    
    // Apply a small discount for multi-city bookings (3% per segment after the first)
    if (segments.length > 1) {
      const discount = totalPrice * (0.03 * (segments.length - 1));
      totalPrice -= discount;
    }
    
    return res.json({ totalPrice: Math.round(totalPrice * 100) / 100 });
  } catch (error) {
    console.error('Error calculating multi-city flight price:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected endpoints (requiring authentication)
app.post('/createBooking', (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Load existing data from the file, if any
    let existingData = [];
    try {
      const data = fs.readFileSync('data.json');
      existingData = JSON.parse(data);
    } catch (err) {
      // File doesn't exist or couldn't be read; an empty array will be used
      console.log('No existing booking data found, creating new file');
    }

    // Add user information to booking
    const bookingData = {
      ...req.body,
      userId: req.user.email,
      bookingDate: new Date().toISOString()
    };

    // Push the new data into the existing array
    existingData.push(bookingData);

    // Write the updated data back to the file
    fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));

    res.send({ message: 'Booking created successfully!', bookingReference: `FLY8-${Date.now()}-${Math.floor(Math.random() * 1000)}` });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
  
