import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  passwordFocused = false;
  usernameAvailable: boolean | null = null;
  isLoading = false;
  emailAvailable: boolean | null = null;
  emailFocused = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (verifiedEmail) {
      this.registerForm.get('email')?.setValue(verifiedEmail);
      this.registerForm.get('email')?.disable();
    }
  
    const savedForm = localStorage.getItem('registerForm');
    if (savedForm) {
      this.registerForm.patchValue(JSON.parse(savedForm));
    }
  
    this.registerForm.get('username')?.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(username => this.checkUsername(username));
  }
  

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkUsername(username: string) {
    if (!username) {
      this.usernameAvailable = null;
      return;
    }

    this.authService.checkUsernameAvailability(username).subscribe({
      next: (isAvailable) => {
        this.usernameAvailable = isAvailable;
      },
      error: () => {
        this.usernameAvailable = null;
      }
    });
  }
  checkEmailAvailability() {
    const email = this.registerForm.get('email')?.value;
    if (email) {
      this.http.get<boolean>(`http://localhost:8585/auth/check-email?email=${email}`)
        .subscribe(
          (available) => this.emailAvailable = available,
          (error) => this.emailAvailable = true
        );
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.getRawValue();
      const verifiedEmail = localStorage.getItem('verifiedEmail');
  
      // ✅ If the user has not verified their email yet
      if (!verifiedEmail) {
        // Save current form state so it can be resumed after verification
        localStorage.setItem('registerForm', JSON.stringify(formValue));
  
        // ✅ Redirect to email-verification only when email is filled
        if (formValue.email) {
          this.router.navigate(['/email-verification'], {
            queryParams: { email: formValue.email }
          });
        } else {
          alert('Please enter your email before continuing.');
        }
  
        return; // Stop form submission here until verification is done
      }
  
      // ✅ Continue with registration only if email is verified
      this.isLoading = true;
  
      this.authService.register({
        ...formValue,
        email: verifiedEmail // Use verified email instead of raw form value
      }).subscribe({
        next: (response: any) => {
          if (response.token) {
            this.router.navigate(['/dashboard']);
          } else if (response.message) {
            alert(response.message);
            this.router.navigate(['/login'], {
              state: { registrationSuccess: true }
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Registration failed. Please try again.';
          alert(errorMessage);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  
    } else {
      this.registerForm.markAllAsTouched();
      alert('Please fill out all fields correctly.');
    }
  }
  
}
