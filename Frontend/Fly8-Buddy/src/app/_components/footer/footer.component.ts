import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  // standalone: true,
  // imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear: number;

  constructor() {
    // Get the current year to display in the footer
    this.currentYear = new Date().getFullYear();
  }
}
