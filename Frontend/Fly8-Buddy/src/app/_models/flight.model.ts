export class Flight {
  private _source?: string;
  private _sourceCity?: string;
  private _sourceCountry?: string;
  private _destination?: string;
  private _destinationCity?: string;
  private _destinationCountry?: string;
  private _dateOfTravel?: Date;
  private _returnDate?: Date;
  private _tripType: string = 'one-way';
  private _numberOfAdults: number; // Required parameter
  private _numberOfChildren: number; // Required parameter
  private _travelClass?: string;
  private _price?: number;
  private _segments: FlightSegment[] = [];

  constructor();
  constructor(
    source?: string,
    destination?: string,
    dateOfTravel?: Date,
    numberOfAdults: number = 1, // Default value to 1
    numberOfChildren: number = 0, // Default value to 0
    travelClass: string = 'Economy', // Default value to Economy
    price?: number,
    returnDate?: Date,
    tripType: string = 'round-trip',
    sourceCity?: string,
    sourceCountry?: string,
    destinationCity?: string,
    destinationCountry?: string
  ) {
    this._source = source;
    this._destination = destination;
    this._dateOfTravel = dateOfTravel;
    this._numberOfAdults = numberOfAdults;
    this._numberOfChildren = numberOfChildren;
    this._travelClass = travelClass;
    this._price = price;
    this._returnDate = returnDate;
    this._tripType = tripType;
    this._sourceCity = sourceCity;
    this._sourceCountry = sourceCountry;
    this._destinationCity = destinationCity;
    this._destinationCountry = destinationCountry;
  }

  get source(): string | undefined {
    return this._source;
  }
  set source(value: string) {
    this._source = value;
  }

  get sourceCity(): string | undefined {
    return this._sourceCity;
  }
  set sourceCity(value: string) {
    this._sourceCity = value;
  }

  get sourceCountry(): string | undefined {
    return this._sourceCountry;
  }
  set sourceCountry(value: string) {
    this._sourceCountry = value;
  }

  get destination(): string | undefined {
    return this._destination;
  }
  set destination(value: string) {
    this._destination = value;
  }

  get destinationCity(): string | undefined {
    return this._destinationCity;
  }
  set destinationCity(value: string) {
    this._destinationCity = value;
  }

  get destinationCountry(): string | undefined {
    return this._destinationCountry;
  }
  set destinationCountry(value: string) {
    this._destinationCountry = value;
  }

  get dateOfTravel(): Date | undefined {
    return this._dateOfTravel;
  }
  set dateOfTravel(value: Date) {
    this._dateOfTravel = value;
  }

  get returnDate(): Date | undefined {
    return this._returnDate;
  }
  set returnDate(value: Date) {
    this._returnDate = value;
  }

  get tripType(): string {
    return this._tripType;
  }
  set tripType(value: string) {
    this._tripType = value;
  }

  get numberOfAdults(): number {
    return this._numberOfAdults;
  }
  set numberOfAdults(value: number) {
    this._numberOfAdults = value;
  }

  get numberOfChildren(): number {
    return this._numberOfChildren;
  }
  set numberOfChildren(value: number) {
    this._numberOfChildren = value;
  }

  get travelClass(): string | undefined {
    return this._travelClass;
  }
  set travelClass(value: string) {
    this._travelClass = value;
  }

  get price(): number | undefined {
    return this._price;
  }
  set price(value: number) {
    this._price = value;
  }

  get segments(): FlightSegment[] {
    return this._segments;
  }
  set segments(value: FlightSegment[]) {
    this._segments = value;
  }

  addSegment(segment: FlightSegment): void {
    this._segments.push(segment);
  }

  clearSegments(): void {
    this._segments = [];
  }

  // Helper method to get formatted source location
  getFormattedSourceLocation(): string {
    if (this._sourceCity && this._sourceCountry) {
      return `${this._sourceCity}, ${this._sourceCountry} (${this._source})`;
    } else if (this._source) {
      return this._source;
    }
    return '';
  }

  // Helper method to get formatted destination location
  getFormattedDestinationLocation(): string {
    if (this._destinationCity && this._destinationCountry) {
      return `${this._destinationCity}, ${this._destinationCountry} (${this._destination})`;
    } else if (this._destination) {
      return this._destination;
    }
    return '';
  }
}

export class FlightSegment {
  private _source?: string;
  private _sourceCity?: string;
  private _sourceCountry?: string;
  private _destination?: string;
  private _destinationCity?: string;
  private _destinationCountry?: string;
  private _dateOfTravel?: Date;

  constructor(
    source?: string,
    destination?: string,
    dateOfTravel?: Date,
    sourceCity?: string,
    sourceCountry?: string,
    destinationCity?: string,
    destinationCountry?: string
  ) {
    this._source = source;
    this._destination = destination;
    this._dateOfTravel = dateOfTravel;
    this._sourceCity = sourceCity;
    this._sourceCountry = sourceCountry;
    this._destinationCity = destinationCity;
    this._destinationCountry = destinationCountry;
  }

  get source(): string | undefined {
    return this._source;
  }
  set source(value: string) {
    this._source = value;
  }

  get sourceCity(): string | undefined {
    return this._sourceCity;
  }
  set sourceCity(value: string) {
    this._sourceCity = value;
  }

  get sourceCountry(): string | undefined {
    return this._sourceCountry;
  }
  set sourceCountry(value: string) {
    this._sourceCountry = value;
  }

  get destination(): string | undefined {
    return this._destination;
  }
  set destination(value: string) {
    this._destination = value;
  }

  get destinationCity(): string | undefined {
    return this._destinationCity;
  }
  set destinationCity(value: string) {
    this._destinationCity = value;
  }

  get destinationCountry(): string | undefined {
    return this._destinationCountry;
  }
  set destinationCountry(value: string) {
    this._destinationCountry = value;
  }

  get dateOfTravel(): Date | undefined {
    return this._dateOfTravel;
  }
  set dateOfTravel(value: Date) {
    this._dateOfTravel = value;
  }

  // Helper method to get formatted source location
  getFormattedSourceLocation(): string {
    if (this._sourceCity && this._sourceCountry) {
      return `${this._sourceCity}, ${this._sourceCountry} (${this._source})`;
    } else if (this._source) {
      return this._source;
    }
    return '';
  }

  // Helper method to get formatted destination location
  getFormattedDestinationLocation(): string {
    if (this._destinationCity && this._destinationCountry) {
      return `${this._destinationCity}, ${this._destinationCountry} (${this._destination})`;
    } else if (this._destination) {
      return this._destination;
    }
    return '';
  }
}