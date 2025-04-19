import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token!: string;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  successMessage = '';
  form!: FormGroup;
  error = '';
  message = '';
  email: string = '';
  passwordFocused = false;


  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or expired reset token.';
    }
  
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
  this.error = '';
  this.message = '';

  const newPassword = this.form.value.newPassword;
  const confirmPassword = this.form.value.confirmPassword;

  if (newPassword !== confirmPassword) {
    this.error = "Passwords do not match.";
    return;
  }

  this.http.post('http://localhost:8585/auth/reset-password', {
    token: this.token,
    newPassword: newPassword
  }).subscribe({
    next: () => {
      this.message = 'Your password has been successfully reset.';
      this.error = '';
      setTimeout(() => this.router.navigate(['/login']), 3000); // redirect after 3s
    },
    error: (err) => {
      console.error('Reset password error:', err);
      this.error = err.error?.message || 'Error resetting password. Please try again.';
    }
  });
}

  
}
