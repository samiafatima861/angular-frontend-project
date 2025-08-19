import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Flight, FlightSegment } from '../_models/flight.model';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Booking } from '../_models/booking';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class FlightDataService {
  private url = "http://localhost:3000";
  
  constructor(private http: HttpClient) { }
  
  // Create headers for authentication
  private createHeaders(): HttpHeaders {
    // Get token from local storage
    const token = localStorage.getItem('auth_token');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token || '' // Include token if available
    });
  }
  
  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 404) {
        errorMessage = 'No flights available for the selected route and date.';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  
  getFlightDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/flights`, { headers: this.createHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  
  getFlightPrice(formData: Flight): Observable<{totalPrice: number}> {    
    return this.http.post<{totalPrice: number}>(`${this.url}/flights`, formData, { headers: this.createHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getRoundTripFlightPrice(formData: Flight): Observable<{totalPrice: number}> {    
    const payload = {
      source: formData.source,
      destination: formData.destination,
      dateOfTravel: formData.dateOfTravel,
      returnDate: formData.returnDate,
      numberOfAdults: formData.numberOfAdults,
      numberOfChildren: formData.numberOfChildren,
      travelClass: formData.travelClass
    };
    
    return this.http.post<{totalPrice: number}>(`${this.url}/roundTripFlightPrice`, payload, { headers: this.createHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getMultiCityFlightPrice(formData: Flight): Observable<{totalPrice: number}> {
    // Map flight segments to the format expected by the API
    const segments = formData.segments.map(segment => ({
      source: segment.source,
      destination: segment.destination,
      dateOfTravel: segment.dateOfTravel
    }));
    
    const payload = {
      segments,
      numberOfAdults: formData.numberOfAdults,
      numberOfChildren: formData.numberOfChildren,
      travelClass: formData.travelClass
    };
    
    return this.http.post<{totalPrice: number}>(`${this.url}/multiCityFlightPrice`, payload, { headers: this.createHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createBooking(booking: Booking): Observable<any> {
    return this.http.post(`${this.url}/createBooking`, booking, { headers: this.createHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Helper methods for flight data
  getPopularDestinations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/popular-destinations`, { headers: this.createHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  getIATACodes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/iata-codes`, { headers: this.createHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
}
