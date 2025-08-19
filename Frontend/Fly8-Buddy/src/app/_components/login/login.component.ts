// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent {

// }

import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../src/app/_models/user.model';
import { SharedDataService } from '../../../../src/app/_services/shared-data.service';
import { UserDataService } from '../../../../src/app/_services/user-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  isModalOpen = true;
  user = {email:'', password:'', rememberMe:'' };
  
  @Output() closeModalEvent = new EventEmitter<void>();

  constructor(private router: Router, 
              private userService: UserDataService, 
              private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    // Modal is initially open
    this.isModalOpen = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    // Close modal when clicking outside the modal content
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeModal();
    }
    event.stopPropagation();
  }

  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
    this.closeModalEvent.emit();
  }

  onSubmit() {  
    const user = new User();
    user.email = this.user.email;
    user.password = this.user.password;   
    this.userService.checkLogin(user).subscribe({
      next: (response: any) => {       
        if (response.token) {
          alert(response.message);
          this.sharedDataService.LoggedIn(true);
          this.userService.setToken(response.token);
          this.closeModal();
          this.router.navigate(['./flight']);
        }
      },
      error: (err: any) => alert(err)
    });
  }
}
