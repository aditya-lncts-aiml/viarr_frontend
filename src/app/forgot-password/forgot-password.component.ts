import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // other modules...
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.error = '';
    this.message = '';
  
    this.http.post('http://localhost:8585/auth/forgot-password', { email: this.email }, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          console.log('Response:', res);
          this.message = 'Password reset link sent to your email.';
        },
        error: (err) => {
          console.error('Forgot password error:', err);
          this.error = err.error?.message || 'Error sending reset link. Please try again.';
        }
      });
  }
  
  
}
