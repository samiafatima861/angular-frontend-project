// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-flight-detail',
//   standalone: true,
//   imports: [],
//   templateUrl: './flight-detail.component.html',
//   styleUrl: './flight-detail.component.css'
// })
// export class FlightDetailComponent {

// }
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Booking, CustomerDetails } from '../../../../src/app/_models/booking';
import { Flight } from '../../../../src/app/_models/flight.model';
import { FlightDataService } from '../../../../src/app/_services/flight-data.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.css']
})
export class FlightDetailComponent {
  @Input() flightDetails: Flight | undefined; // Receive flight details from parent component
  showPassengerDetailsForm = false; // Initially hide the form
  showCustomerDetailsModal = false; // Initially hide the customer details modal
  passengers: any[] = []; // Array to store passenger details
  showGeneratePdfButton: boolean = false;
  booking!: Booking;
  bookingConfirmed = false;
  bookingReference = '';
  
  // Customer details
  customer: CustomerDetails = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: ''
  };

  constructor(private flightService: FlightDataService) {}

  openPassengerDetailsForm() {
    // Generate input boxes for each passenger
    if (this.flightDetails) { 
      let numberOfPassengers = this.flightDetails.numberOfAdults + this.flightDetails.numberOfChildren;
      this.passengers = []; // Clear existing passengers
      for (let i = 0; i < numberOfPassengers; i++) {
        this.passengers.push({ 
          name: '',
          age: '',
          gender: '',
          seatPreference: 'No Preference',
          mealPreference: 'Regular'
        });
      }

      this.showPassengerDetailsForm = true; // Display the passenger details form
    } else {
      console.error('Flight details are undefined');
    }
  }

  submitPassengerDetails() {
    // Validate passenger details
    if (!this.validatePassengerDetails()) {
      return;
    }
    
    // Show customer details modal after passenger details are submitted
    this.showCustomerDetailsModal = true;
  }

  validatePassengerDetails() {
    for (let i = 0; i < this.passengers.length; i++) {
      if (!this.passengers[i].name || !this.passengers[i].age) {
        alert(`Please fill in all required fields for Passenger ${i + 1}`);
        return false;
      }
    }
    return true;
  }

  submitCustomerDetails() {
    // Validate customer details
    if (!this.validateCustomerDetails()) {
      return;
    }
    
    if (this.flightDetails) {
      // Create booking with both passenger and customer details
      this.booking = new Booking(
        this.customer.email,
        this.flightDetails.price ?? 0,
        {
          source: this.flightDetails.source!,
          sourceCity: this.flightDetails.sourceCity,
          sourceCountry: this.flightDetails.sourceCountry,
          destination: this.flightDetails.destination!,
          destinationCity: this.flightDetails.destinationCity,
          destinationCountry: this.flightDetails.destinationCountry,
          date: this.flightDetails.dateOfTravel!,
          returnDate: this.flightDetails.returnDate,
          tripType: (this.flightDetails.tripType || 'one-way') as 'one-way' | 'round-trip' | 'multi-city',
          travelClass: this.flightDetails.travelClass
        },
        this.passengers
      );
      
      // Add customer details to booking
      this.booking.customerDetails = this.customer;
      this.bookingReference = 'FLY8-' + Math.floor(100000 + Math.random() * 900000);
      this.booking.bookingReference = this.bookingReference;
      
      console.log('Booking details:', this.booking);
      
      // If there are segments, add them to the booking
      if (this.flightDetails.segments && this.flightDetails.segments.length > 0) {
        this.booking.segments = this.flightDetails.segments.map(segment => ({
          source: segment.source!,
          sourceCity: segment.sourceCity,
          sourceCountry: segment.sourceCountry,
          destination: segment.destination!,
          destinationCity: segment.destinationCity,
          destinationCountry: segment.destinationCountry,
          date: segment.dateOfTravel!
        }));
      }
      
      this.flightService.createBooking(this.booking).subscribe({
        next: (response: any) => {
          this.bookingConfirmed = true;
          this.showGeneratePdfButton = true;
          this.showCustomerDetailsModal = false;
        },
        error: err => {
          console.error('Error creating booking:', err);
          alert('There was an error creating your booking. Please try again.');
        }
      });
    } else {
      console.error('Flight details are undefined');
    }
  }

  validateCustomerDetails() {
    if (!this.customer.firstName || !this.customer.lastName || !this.customer.email || !this.customer.phone) {
      alert('Please fill in all required customer details');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customer.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(this.customer.phone.replace(/[^0-9]/g, ''))) {
      alert('Please enter a valid phone number');
      return false;
    }
    
    return true;
  }

  closeCustomerModal() {
    this.showCustomerDetailsModal = false;
  }

  canGeneratePDF(): boolean {
    return this.bookingConfirmed && !!this.booking;
  }

  generatePDF() {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add airline logo and header
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('Fly8-Buddy Airlines', 105, 20, { align: 'center' });
    
    // Add boarding pass title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('BOARDING PASS', 105, 30, { align: 'center' });
    
    // Add booking reference
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${this.bookingReference}`, 105, 40, { align: 'center' });
    
    // Add flight details
    doc.setFontSize(14);
    doc.text('Flight Details', 20, 55);
    
    doc.setFontSize(12);
    // Format source with city and country if available
    const sourceText = this.booking.flightDetails.sourceCity && this.booking.flightDetails.sourceCountry
      ? `From: ${this.booking.flightDetails.source} - ${this.booking.flightDetails.sourceCity}, ${this.booking.flightDetails.sourceCountry}`
      : `From: ${this.booking.flightDetails.source}`;
    
    // Format destination with city and country if available
    const destinationText = this.booking.flightDetails.destinationCity && this.booking.flightDetails.destinationCountry
      ? `To: ${this.booking.flightDetails.destination} - ${this.booking.flightDetails.destinationCity}, ${this.booking.flightDetails.destinationCountry}`
      : `To: ${this.booking.flightDetails.destination}`;
    
    doc.text(sourceText, 20, 65);
    doc.text(destinationText, 20, 75);
    doc.text(`Date: ${new Date(this.booking.flightDetails.date).toLocaleDateString()}`, 20, 85);
    
    let currentY = 95;
    
    if (this.booking.flightDetails.returnDate) {
      doc.text(`Return Date: ${new Date(this.booking.flightDetails.returnDate).toLocaleDateString()}`, 20, currentY);
      currentY += 10;
    }
    
    // Add travel class
    if (this.flightDetails && this.flightDetails.travelClass) {
      doc.text(`Travel Class: ${this.flightDetails.travelClass}`, 20, currentY);
      currentY += 10;
    }
    
    doc.text(`Total Price: $${this.booking.totalPrice.toFixed(2)}`, 20, currentY);
    currentY += 10;
    
    // Add multi-city segments if available
    if (this.flightDetails && this.flightDetails.segments && this.flightDetails.segments.length > 0) {
      currentY += 10;
      doc.setFontSize(14);
      doc.text('Flight Segments', 20, currentY);
      currentY += 10;
      
      doc.setFontSize(12);
      this.flightDetails.segments.forEach((segment, index) => {
        const segmentSourceText = segment.sourceCity && segment.sourceCountry
          ? `${segment.source} - ${segment.sourceCity}, ${segment.sourceCountry}`
          : `${segment.source}`;
          
        const segmentDestText = segment.destinationCity && segment.destinationCountry
          ? `${segment.destination} - ${segment.destinationCity}, ${segment.destinationCountry}`
          : `${segment.destination}`;
          
        doc.text(`Flight ${index + 1}: ${segmentSourceText} → ${segmentDestText}`, 20, currentY);
        currentY += 10;
        
        if (segment.dateOfTravel) {
          doc.text(`Date: ${new Date(segment.dateOfTravel).toLocaleDateString()}`, 30, currentY);
          currentY += 10;
        }
      });
    }
    
    // Add customer details
    currentY += 10;
    doc.setFontSize(14);
    doc.text('Customer Details', 20, currentY);
    currentY += 10;
    
    doc.setFontSize(12);
    doc.text(`Name: ${this.customer.firstName} ${this.customer.lastName}`, 20, currentY);
    currentY += 10;
    doc.text(`Email: ${this.customer.email}`, 20, currentY);
    currentY += 10;
    doc.text(`Phone: ${this.customer.phone}`, 20, currentY);
    currentY += 10;
    
    if (this.customer.address) {
      doc.text(`Address: ${this.customer.address}`, 20, currentY);
      currentY += 10;
    }
    
    // Add passenger details table
    currentY += 10;
    doc.setFontSize(14);
    doc.text('Passenger Details', 20, currentY);
    currentY += 10;
    
    // Create passenger table data
    const tableColumn = ["Name", "Age", "Gender", "Seat Pref.", "Meal Pref."];
    const tableRows = this.passengers.map(passenger => [
      passenger.name,
      passenger.age,
      passenger.gender || '-',
      passenger.seatPreference || '-',
      passenger.mealPreference || '-'
    ]);
    
    // Add the table
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] }
    });
    
    // Add barcode-like element at the bottom
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setDrawColor(0);
    doc.setFillColor('0');
    
    // Generate random barcode pattern
    const barcodeWidth = 100;
    const barcodeX = 105 - (barcodeWidth / 2);
    const barcodeY = finalY;
    
    for (let i = 0; i < 30; i++) {
      const barHeight = 5 + Math.random() * 15;
      const barWidth = 2;
      const barX = barcodeX + (i * 3);
      doc.rect(barX, barcodeY, barWidth, barHeight, 'F');
    }
    
    // Add boarding pass number below barcode
    doc.setFontSize(10);
    doc.text(`BP${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`, 105, finalY + 25, { align: 'center' });
    
    // Save the PDF
    doc.save(`Fly8Buddy_Boarding_Pass_${this.bookingReference}.pdf`);
  }
}