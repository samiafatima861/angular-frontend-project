// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-flights',
//   standalone: true,
//   imports: [],
//   templateUrl: './flights.component.html',
//   styleUrl: './flights.component.css'
// })
// export class FlightsComponent {

// }

import { Component, OnInit } from '@angular/core';
import { Flight, FlightSegment } from '../../_models/flight.model';
import { FlightDataService } from '../../_services/flight-data.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';

// Define interfaces for location data
export interface LocationData {
  code: string;
  city: string;
  country: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
  countryCode: string;
}

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit {
  flight: Flight = new Flight();
  flightAvailable: boolean = false;
  sources: LocationData[] = [];
  destinations: LocationData[] = [];
  activeTab: string = 'round-trip';
  popularDestinations: any[] = [];
  iataCodes: any[] = [];
  multiCitySegments: FlightSegment[] = [new FlightSegment()];
  
  // New properties for country and city selection
  countries: Country[] = [];
  cities: City[] = [];
  filteredSourceCities: City[] = [];
  filteredDestinationCities: City[] = [];
  
  // Selected countries
  selectedSourceCountry: string = '';
  selectedDestinationCountry: string = '';
  
  // For multi-city segments
  segmentSourceCountries: string[] = [];
  segmentDestinationCountries: string[] = [];
  segmentFilteredSourceCities: City[][] = [];
  segmentFilteredDestinationCities: City[][] = [];
  
  constructor(private flightDataService: FlightDataService, private dbService: NgxIndexedDBService) {
    this.flight.numberOfAdults = 1;
    this.flight.numberOfChildren = 0;
    this.flight.travelClass = 'Economy';
    this.flight.tripType = 'round-trip';
  }

  ngOnInit(): void {
    this.loadCountriesAndCities();
    this.initializeMultiCitySegments();
    
    this.flightDataService.getFlightDetails().subscribe(
      (data) => {
        // Create a map to store unique locations with their city and country info
        const locationsMap = new Map<string, LocationData>();
        
        data.forEach(item => {
          if (item.source && !locationsMap.has(item.source)) {
            locationsMap.set(item.source, {
              code: item.source,
              city: item.sourceCity || this.getDefaultCity(item.source),
              country: item.sourceCountry || this.getDefaultCountry(item.source)
            });
          }
          
          if (item.destination && !locationsMap.has(item.destination)) {
            locationsMap.set(item.destination, {
              code: item.destination,
              city: item.destinationCity || this.getDefaultCity(item.destination),
              country: item.destinationCountry || this.getDefaultCountry(item.destination)
            });
          }
        });
        
        // Convert the map values to arrays for sources and destinations
        this.sources = Array.from(locationsMap.values());
        this.destinations = Array.from(locationsMap.values());
      },
      (error) => {
        console.error('Error fetching flight details:', error);
        // Fallback to default data if API fails
        this.loadDefaultLocations();
      }
    );
    
    // Load popular destinations and IATA codes
    this.loadPopularDestinations();
    this.loadIATACodes();
  }

  // Helper method to get default city name based on IATA code
  getDefaultCity(iataCode: string): string {
    const location = this.getLocationFromIATA(iataCode);
    return location ? location.city : iataCode;
  }

  // Helper method to get default country name based on IATA code
  getDefaultCountry(iataCode: string): string {
    const location = this.getLocationFromIATA(iataCode);
    return location ? location.country : 'Unknown';
  }

  // Helper method to find location data from IATA code
  getLocationFromIATA(iataCode: string): any {
    // First check in popular destinations
    const popularDest = this.popularDestinations.find(dest => dest.code === iataCode);
    if (popularDest) {
      return popularDest;
    }
    
    // If not found, return null (will be populated later)
    return null;
  }

  // Load comprehensive list of countries and cities
  loadCountriesAndCities(): void {
    // Sample data - in a real app, this would come from an API
    this.countries = [
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'JP', name: 'Japan' },
      { code: 'CN', name: 'China' },
      { code: 'AU', name: 'Australia' },
      { code: 'CA', name: 'Canada' },
      { code: 'IN', name: 'India' },
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'SG', name: 'Singapore' },
      { code: 'TH', name: 'Thailand' },
      { code: 'MY', name: 'Malaysia' }
    ];
    
    this.cities = [
      // United States
      { code: 'JFK', name: 'New York', countryCode: 'US' },
      { code: 'LAX', name: 'Los Angeles', countryCode: 'US' },
      { code: 'ORD', name: 'Chicago', countryCode: 'US' },
      { code: 'MIA', name: 'Miami', countryCode: 'US' },
      { code: 'SFO', name: 'San Francisco', countryCode: 'US' },
      { code: 'LAS', name: 'Las Vegas', countryCode: 'US' },
      { code: 'DFW', name: 'Dallas', countryCode: 'US' },
      
      // United Kingdom
      { code: 'LHR', name: 'London', countryCode: 'GB' },
      { code: 'MAN', name: 'Manchester', countryCode: 'GB' },
      { code: 'EDI', name: 'Edinburgh', countryCode: 'GB' },
      { code: 'BHX', name: 'Birmingham', countryCode: 'GB' },
      
      // France
      { code: 'CDG', name: 'Paris', countryCode: 'FR' },
      { code: 'NCE', name: 'Nice', countryCode: 'FR' },
      { code: 'LYS', name: 'Lyon', countryCode: 'FR' },
      
      // Germany
      { code: 'FRA', name: 'Frankfurt', countryCode: 'DE' },
      { code: 'MUC', name: 'Munich', countryCode: 'DE' },
      { code: 'TXL', name: 'Berlin', countryCode: 'DE' },
      
      // Italy
      { code: 'FCO', name: 'Rome', countryCode: 'IT' },
      { code: 'MXP', name: 'Milan', countryCode: 'IT' },
      { code: 'VCE', name: 'Venice', countryCode: 'IT' },
      
      // Spain
      { code: 'MAD', name: 'Madrid', countryCode: 'ES' },
      { code: 'BCN', name: 'Barcelona', countryCode: 'ES' },
      
      // Japan
      { code: 'NRT', name: 'Tokyo', countryCode: 'JP' },
      { code: 'KIX', name: 'Osaka', countryCode: 'JP' },
      
      // China
      { code: 'PEK', name: 'Beijing', countryCode: 'CN' },
      { code: 'PVG', name: 'Shanghai', countryCode: 'CN' },
      { code: 'CAN', name: 'Guangzhou', countryCode: 'CN' },
      
      // Australia
      { code: 'SYD', name: 'Sydney', countryCode: 'AU' },
      { code: 'MEL', name: 'Melbourne', countryCode: 'AU' },
      
      // Canada
      { code: 'YYZ', name: 'Toronto', countryCode: 'CA' },
      { code: 'YVR', name: 'Vancouver', countryCode: 'CA' },
      
      // India
      { code: 'DEL', name: 'Delhi', countryCode: 'IN' },
      { code: 'BOM', name: 'Mumbai', countryCode: 'IN' },
      
      // UAE
      { code: 'DXB', name: 'Dubai', countryCode: 'AE' },
      { code: 'AUH', name: 'Abu Dhabi', countryCode: 'AE' },
      
      // Singapore
      { code: 'SIN', name: 'Singapore', countryCode: 'SG' },
      
      // Thailand
      { code: 'BKK', name: 'Bangkok', countryCode: 'TH' },
      { code: 'HKT', name: 'Phuket', countryCode: 'TH' },
      
      // Malaysia
      { code: 'KUL', name: 'Kuala Lumpur', countryCode: 'MY' }
    ];
  }

  // Fallback method to load default locations if API fails
  loadDefaultLocations() {
    this.sources = [
      { code: 'JFK', city: 'New York', country: 'United States' },
      { code: 'LHR', city: 'London', country: 'United Kingdom' },
      { code: 'CDG', city: 'Paris', country: 'France' },
      { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
      { code: 'SIN', city: 'Singapore', country: 'Singapore' }
    ];
    
    this.destinations = [
      { code: 'JFK', city: 'New York', country: 'United States' },
      { code: 'LHR', city: 'London', country: 'United Kingdom' },
      { code: 'CDG', city: 'Paris', country: 'France' },
      { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
      { code: 'SIN', city: 'Singapore', country: 'Singapore' }
    ];
  }

  loadPopularDestinations() {
    // Simulated data - in a real app, this would come from the service
    this.popularDestinations = [
      { code: 'JFK', city: 'New York', country: 'United States', price: 299 },
      { code: 'LHR', city: 'London', country: 'United Kingdom', price: 349 },
      { code: 'CDG', city: 'Paris', country: 'France', price: 329 },
      { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', price: 499 },
      { code: 'SIN', city: 'Singapore', country: 'Singapore', price: 599 },
      { code: 'HND', city: 'Tokyo', country: 'Japan', price: 699 },
      { code: 'SYD', city: 'Sydney', country: 'Australia', price: 899 },
      { code: 'LAX', city: 'Los Angeles', country: 'United States', price: 399 }
    ];
  }

  loadIATACodes() {
    // Simulated data - in a real app, this would come from the service
    this.iataCodes = [
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport' },
      { code: 'PEK', name: 'Beijing Capital International Airport' },
      { code: 'LHR', name: 'London Heathrow Airport' },
      { code: 'ORD', name: 'O\'Hare International Airport' },
      { code: 'HND', name: 'Tokyo Haneda Airport' },
      { code: 'LAX', name: 'Los Angeles International Airport' },
      { code: 'CDG', name: 'Paris Charles de Gaulle Airport' },
      { code: 'DFW', name: 'Dallas/Fort Worth International Airport' },
      { code: 'FRA', name: 'Frankfurt Airport' },
      { code: 'IST', name: 'Istanbul Airport' },
      { code: 'AMS', name: 'Amsterdam Airport Schiphol' },
      { code: 'CAN', name: 'Guangzhou Baiyun International Airport' },
      { code: 'ICN', name: 'Seoul Incheon International Airport' },
      { code: 'DEL', name: 'Indira Gandhi International Airport' },
      { code: 'BKK', name: 'Suvarnabhumi Airport' }
    ];
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    
    // Reset selections when changing tabs
    this.selectedSourceCountry = '';
    this.selectedDestinationCountry = '';
    this.filteredSourceCities = [];
    this.filteredDestinationCities = [];
    
    // Reset flight object
    this.flight = new Flight();
    
    if (tabId === 'multi-city') {
      this.initializeMultiCitySegments();
    }
  }

  incrementAdults() {
    if (this.flight.numberOfAdults < 9) {
      this.flight.numberOfAdults++;
    }
  }

  decrementAdults() {
    if (this.flight.numberOfAdults > 1) {
      this.flight.numberOfAdults--;
    }
  }

  incrementChildren() {
    if (this.flight.numberOfChildren < 9) {
      this.flight.numberOfChildren++;
    }
  }

  decrementChildren() {
    if (this.flight.numberOfChildren > 0) {
      this.flight.numberOfChildren--;
    }
  }

  addFlightSegment(): void {
    const newSegment = new FlightSegment();
    this.multiCitySegments.push(newSegment);
    
    // Add corresponding entries in the arrays
    this.segmentSourceCountries.push('');
    this.segmentDestinationCountries.push('');
    this.segmentFilteredSourceCities.push([]);
    this.segmentFilteredDestinationCities.push([]);
  }

  removeFlightSegment(index: number): void {
    if (this.multiCitySegments.length > 1) {
      this.multiCitySegments.splice(index, 1);
      
      // Remove corresponding entries from the arrays
      this.segmentSourceCountries.splice(index, 1);
      this.segmentDestinationCountries.splice(index, 1);
      this.segmentFilteredSourceCities.splice(index, 1);
      this.segmentFilteredDestinationCities.splice(index, 1);
    }
  }

  onSubmit(): void {
    // Validate that both source and destination are selected
    if (!this.flight.source || !this.flight.destination) {
      alert('Please select both source and destination');
      return;
    }
    
    // Ensure source and destination location data is set
    if (this.flight.source && !this.flight.sourceCity) {
      const sourceLocation = this.sources.find(s => s.code === this.flight.source);
      if (sourceLocation) {
        this.flight.sourceCity = sourceLocation.city;
        this.flight.sourceCountry = sourceLocation.country;
      }
    }
    
    if (this.flight.destination && !this.flight.destinationCity) {
      const destLocation = this.destinations.find(d => d.code === this.flight.destination);
      if (destLocation) {
        this.flight.destinationCity = destLocation.city;
        this.flight.destinationCountry = destLocation.country;
      }
    }
    
    // For multi-city, ensure all segments have location data
    if (this.activeTab === 'multi-city') {
      this.multiCitySegments.forEach(segment => {
        if (segment.source && !segment.sourceCity) {
          const sourceLocation = this.sources.find(s => s.code === segment.source);
          if (sourceLocation) {
            segment.sourceCity = sourceLocation.city;
            segment.sourceCountry = sourceLocation.country;
          }
        }
        
        if (segment.destination && !segment.destinationCity) {
          const destLocation = this.destinations.find(d => d.code === segment.destination);
          if (destLocation) {
            segment.destinationCity = destLocation.city;
            segment.destinationCountry = destLocation.country;
          }
        }
      });
      
      // Update flight segments
      this.flight.clearSegments();
      this.multiCitySegments.forEach(segment => {
        this.flight.addSegment(segment);
      });
    }
    
    // Set trip type based on active tab
    this.flight.tripType = this.activeTab;
    
    // Handle different trip types
    if (this.activeTab === 'round-trip') {
      if (!this.flight.returnDate) {
        alert('Please select a return date for round-trip flights');
        return;
      }
      
      this.flightDataService.getRoundTripFlightPrice(this.flight).subscribe({
        next: (response) => {
          this.flight.price = response.totalPrice;
          this.flightAvailable = true;
          
          // Store flight in IndexedDB
          this.dbService.add('routes', {
            route: `${this.flight.source}-${this.flight.destination}`,
            price: this.flight.price
          }).subscribe(
            () => console.log('Flight added to IndexedDB'),
            error => console.error('Error adding flight to IndexedDB:', error)
          );
        },
        error: (error) => {
          console.error('Error fetching flight price:', error);
          this.flightAvailable = false;
          
          // Display a more informative error message
          if (error.status === 404) {
            if (error.error && error.error.error) {
              alert(`No flights available: ${error.error.error}`);
            } else {
              alert('No flights available for the selected route and dates');
            }
          } else if (error.status === 400) {
            if (error.error && error.error.error) {
              alert(`Invalid request: ${error.error.error}`);
            } else {
              alert('Invalid request. Please check your flight details.');
            }
          } else if (error.status === 0) {
            alert('Cannot connect to the server. Please check your internet connection or try again later.');
          } else {
            alert('An error occurred while fetching flight price. Please try again later.');
          }
        }
      });
    } else if (this.activeTab === 'one-way') {
      this.flightDataService.getFlightPrice(this.flight).subscribe({
        next: (response) => {
          this.flight.price = response.totalPrice;
          this.flightAvailable = true;
          
          // Store flight in IndexedDB
          this.dbService.add('routes', {
            route: `${this.flight.source}-${this.flight.destination}`,
            price: this.flight.price
          }).subscribe(
            () => console.log('Flight added to IndexedDB'),
            error => console.error('Error adding flight to IndexedDB:', error)
          );
        },
        error: (error) => {
          console.error('Error fetching flight price:', error);
          this.flightAvailable = false;
          
          // Display a more informative error message
          if (error.status === 404) {
            if (error.error && error.error.error) {
              alert(`No flights available: ${error.error.error}`);
            } else {
              alert('No flights available for the selected route and date');
            }
          } else if (error.status === 400) {
            if (error.error && error.error.error) {
              alert(`Invalid request: ${error.error.error}`);
            } else {
              alert('Invalid request. Please check your flight details.');
            }
          } else if (error.status === 0) {
            alert('Cannot connect to the server. Please check your internet connection or try again later.');
          } else {
            alert('An error occurred while fetching flight price. Please try again later.');
          }
        }
      });
    } else if (this.activeTab === 'multi-city') {
      // Validate all segments have source, destination and date
      for (let i = 0; i < this.multiCitySegments.length; i++) {
        const segment = this.multiCitySegments[i];
        if (!segment.source || !segment.destination || !segment.dateOfTravel) {
          alert(`Please fill in all details for Flight ${i + 1}`);
          return;
        }
      }
      
      this.flightDataService.getMultiCityFlightPrice(this.flight).subscribe({
        next: (response) => {
          this.flight.price = response.totalPrice;
          this.flightAvailable = true;
          
          // Store flight in IndexedDB
          this.dbService.add('routes', {
            route: 'multi-city',
            price: this.flight.price
          }).subscribe(
            () => console.log('Flight added to IndexedDB'),
            error => console.error('Error adding flight to IndexedDB:', error)
          );
        },
        error: (error) => {
          console.error('Error fetching flight price:', error);
          this.flightAvailable = false;
          
          // Display a more informative error message
          if (error.status === 404) {
            if (error.error && error.error.error) {
              alert(`No flights available: ${error.error.error}`);
            } else {
              alert('No flights available for the selected routes and dates');
            }
          } else if (error.status === 400) {
            if (error.error && error.error.error) {
              alert(`Invalid request: ${error.error.error}`);
            } else {
              alert('Invalid request. Please check your flight details.');
            }
          } else if (error.status === 0) {
            alert('Cannot connect to the server. Please check your internet connection or try again later.');
          } else {
            alert('An error occurred while fetching flight price. Please try again later.');
          }
        }
      });
    }
  }

  // Filter cities based on selected country
  onSourceCountryChange(): void {
    this.filteredSourceCities = this.cities.filter(city => city.countryCode === this.selectedSourceCountry);
    // Reset the selected city if the country changes
    this.flight.source = '';
    this.flight.sourceCity = '';
    this.flight.sourceCountry = '';
  }

  onDestinationCountryChange(): void {
    this.filteredDestinationCities = this.cities.filter(city => city.countryCode === this.selectedDestinationCountry);
    // Reset the selected city if the country changes
    this.flight.destination = '';
    this.flight.destinationCity = '';
    this.flight.destinationCountry = '';
  }

  // For multi-city segments
  initializeMultiCitySegments(): void {
    // Initialize arrays for multi-city segments
    this.segmentSourceCountries = this.multiCitySegments.map(() => '');
    this.segmentDestinationCountries = this.multiCitySegments.map(() => '');
    this.segmentFilteredSourceCities = this.multiCitySegments.map(() => []);
    this.segmentFilteredDestinationCities = this.multiCitySegments.map(() => []);
  }

  onSegmentSourceCountryChange(index: number): void {
    this.segmentFilteredSourceCities[index] = this.cities.filter(
      city => city.countryCode === this.segmentSourceCountries[index]
    );
    // Reset the selected city if the country changes
    this.multiCitySegments[index].source = '';
    this.multiCitySegments[index].sourceCity = '';
    this.multiCitySegments[index].sourceCountry = '';
  }

  onSegmentDestinationCountryChange(index: number): void {
    this.segmentFilteredDestinationCities[index] = this.cities.filter(
      city => city.countryCode === this.segmentDestinationCountries[index]
    );
    // Reset the selected city if the country changes
    this.multiCitySegments[index].destination = '';
    this.multiCitySegments[index].destinationCity = '';
    this.multiCitySegments[index].destinationCountry = '';
  }

  onSourceCitySelected(iataCode: string | undefined): void {
    if (!iataCode) return;
    
    // Find the city in our filtered cities
    const selectedCity = this.filteredSourceCities.find(city => city.code === iataCode);
    if (selectedCity) {
      this.flight.sourceCity = selectedCity.name;
      this.flight.sourceCountry = this.countries.find(country => country.code === selectedCity.countryCode)?.name || '';
    }
  }

  onDestinationCitySelected(iataCode: string | undefined): void {
    if (!iataCode) return;
    
    // Find the city in our filtered cities
    const selectedCity = this.filteredDestinationCities.find(city => city.code === iataCode);
    if (selectedCity) {
      this.flight.destinationCity = selectedCity.name;
      this.flight.destinationCountry = this.countries.find(country => country.code === selectedCity.countryCode)?.name || '';
    }
  }

  // For multi-city segments
  onSegmentSourceCitySelected(index: number, iataCode: string | undefined): void {
    if (!iataCode) return;
    
    // Find the city in our filtered cities
    const selectedCity = this.segmentFilteredSourceCities[index]?.find(city => city.code === iataCode);
    if (selectedCity) {
      this.multiCitySegments[index].sourceCity = selectedCity.name;
      this.multiCitySegments[index].sourceCountry = this.countries.find(country => country.code === selectedCity.countryCode)?.name || '';
    }
  }

  onSegmentDestinationCitySelected(index: number, iataCode: string | undefined): void {
    if (!iataCode) return;
    
    // Find the city in our filtered cities
    const selectedCity = this.segmentFilteredDestinationCities[index]?.find(city => city.code === iataCode);
    if (selectedCity) {
      this.multiCitySegments[index].destinationCity = selectedCity.name;
      this.multiCitySegments[index].destinationCountry = this.countries.find(country => country.code === selectedCity.countryCode)?.name || '';
    }
  }
}
