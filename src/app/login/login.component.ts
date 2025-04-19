import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;
  loginFailed = false;
  isLoading = false;
  showSuccessMessage = false;

  constructor(
    private sessionService: SessionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Check for registration success state
    const navigation = this.router.getCurrentNavigation();
    this.showSuccessMessage = navigation?.extras?.state?.['registrationSuccess'] || false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.loginFailed = false;

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.handleSuccessfulLogin(response);
        },
        error: (err) => {
          this.handleLoginError(err);
        }
      });
  }

  private handleSuccessfulLogin(response: any): void {
    this.authService.storeToken(response.token);
    this.sessionService.startSessionTimer();

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.router.navigate(['/dashboard'], {
          state: { firstName: user.firstName }
        });
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
        this.authService.logout();
        this.router.navigate(['/login'], {
          state: { sessionError: true }
        });
      }
    });
  }

  private handleLoginError(err: any): void {
    this.loginFailed = true;
    console.error('Login error:', err);
    
    if (err.status === 401) {
      this.errorMessage = 'Invalid username or password';
    } else if (err.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your connection.';
    } else {
      console.log(err.status);
      
      this.errorMessage = 'An unexpected error occurred. Please try again later.';
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}