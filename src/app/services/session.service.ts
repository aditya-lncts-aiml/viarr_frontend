import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private sessionTimeout: any;
  private authService!: AuthService;

  constructor(private injector: Injector, private router: Router) {}

  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }

  startSessionTimer(): void {
    this.clearSessionTimer();
    const token = this.getAuthService().getToken();
    if (token) {
      
      const decoded: any = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const timeout = expiryTime - now - 10000;

      if (timeout > 0) {
        this.sessionTimeout = setTimeout(() => {
          this.logout('Session expired. Please log in again.');
        }, timeout);
      } else {
        this.logout('Session expired. Please log in again.');
      }
    }
  }

  clearSessionTimer(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }

  logout(message: string = 'You have been logged out.'): void {
    this.clearSessionTimer();
    this.getAuthService().clearToken();
    alert(message);
    this.router.navigate(['/login']);
  }
}
