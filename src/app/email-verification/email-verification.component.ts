import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../services/email.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {
  email = '';
  otp = '';
  generatedOtp = '';
  otpSent = false;
  canResendOtp = true;
  resendTimer = 30;
  loading = false;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        alert('No email found, redirecting to register page.');
        this.router.navigate(['/register']);
      } else {
        this.sendOtp();
      }
    });
  }

  startResendTimer() {
    this.canResendOtp = false;
    this.resendTimer = 30;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
        this.canResendOtp = true;
      }
    }, 1000);
  }

  sendOtp() {
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.loading = true;

    this.emailService.sendOtpEmail(this.email, this.generatedOtp, new Date().toLocaleTimeString())
      .then(() => {
        alert('OTP sent to your email!');
        this.otpSent = true;
        this.startResendTimer();
      })
      .catch(error => {
        console.error('Error sending OTP', error);
        alert('Failed to send OTP. Please try again.');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  resendOtp() {
    if (this.canResendOtp) {
      this.sendOtp();
    }
  }

  verifyOtp() {
    if (this.otp === this.generatedOtp) {
      localStorage.setItem('verifiedEmail', this.email);

      const formData = localStorage.getItem('registerForm');
      if (formData) {
        const userData = JSON.parse(formData);
        this.authService.register({ ...userData, email: this.email }).subscribe({
          next: (res: any) => {
            alert('Registration successful!');
            localStorage.removeItem('verifiedEmail');
            localStorage.removeItem('registerForm');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            alert('Registration failed. Please try again.');
            console.error(err);
            this.router.navigate(['/register']);
          }
        });
      } else {
        alert('No registration data found.');
        this.router.navigate(['/register']);
      }
    } else {
      alert('Invalid OTP!');
    }
  }
}
