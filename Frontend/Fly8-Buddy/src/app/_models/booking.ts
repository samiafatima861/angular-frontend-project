// export class Booking {
// }
export interface Passenger {   
    name: string;
    age: number;
    gender?: string;
    seatPreference?: string;
    mealPreference?: string;
}  

export interface FlightDetails {
    source: string;
    destination: string;
    date: Date;
    returnDate?: Date;
    sourceCity?: string;
    sourceCountry?: string;
    destinationCity?: string;
    destinationCountry?: string;
    tripType?: 'one-way' | 'round-trip' | 'multi-city';
    travelClass?: string;
}

export interface FlightSegment {
    source: string;
    sourceCity?: string;
    sourceCountry?: string;
    destination: string;
    destinationCity?: string;
    destinationCountry?: string;
    date: Date;
}

export interface CustomerDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    specialRequests?: string;
}

export class Booking {
    customerEmail: string;
    totalPrice: number;   
    flightDetails: FlightDetails;
    passengers: Passenger[];
    customerDetails?: CustomerDetails;
    bookingReference?: string;
    bookingDate?: Date;
    segments?: FlightSegment[];
    
    constructor(customerEmail: string, totalPrice: number, flightDetails: FlightDetails, passengers: Passenger[]) {
        this.customerEmail = customerEmail;
        this.totalPrice = totalPrice;    
        this.flightDetails = flightDetails;   
        this.passengers = passengers;
        this.bookingDate = new Date();
    }
}