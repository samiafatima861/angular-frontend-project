const Flight = require('./flightModel');
const FlightDetail = require('./flightDetail');

class FlightManager {
    calculatePrice(source, destination, numberOfAdults, numberOfChildren, dateOfTravel) {
        try {
            // Validate inputs
            if (!source || !destination) {
                return "Source and destination are required";
            }

            if (!numberOfAdults && !numberOfChildren) {
                return "At least one passenger is required";
            }

            // Ensure we have valid numbers for passengers
            const adults = parseInt(numberOfAdults) || 0;
            const children = parseInt(numberOfChildren) || 0;
            
            if (adults + children <= 0) {
                return "At least one passenger is required";
            }

            // Format date if provided
            let formattedDate = null;
            if (dateOfTravel) {
                try {
                    // Handle different date formats
                    const date = new Date(dateOfTravel);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                    } else {
                        return "Invalid date format";
                    }
                } catch (error) {
                    console.error("Date parsing error:", error);
                    return "Invalid date format";
                }
            }

            const flightDetail = new FlightDetail();
            let basePrice = flightDetail.getBasePrice(source, destination, formattedDate);
            
            if (typeof basePrice === 'number') {
                // Calculate total price based on passengers
                const totalPassengers = adults + children;
                
                // Apply child discount (20% off for children)
                const adultTotal = adults * basePrice;
                const childTotal = children * basePrice * 0.8; // 20% discount for children
                
                const totalPrice = adultTotal + childTotal;
                return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
            } else if (typeof basePrice === 'string') {
                return basePrice; // Return error message
            } else {
                return "Unable to calculate price";
            }
        } catch (error) {
            console.error("Error in calculatePrice:", error);
            return "An error occurred while calculating the price";
        }
    }
}

module.exports = FlightManager;