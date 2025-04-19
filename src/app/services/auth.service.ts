import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../models/login-response.interface';
import { Router } from '@angular/router';
import { SessionService } from './session.service';
import emailjs from 'emailjs-com';
import { catchError, of } from 'rxjs';
import { EMPTY } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  
  private apiUrl = 'http://localhost:8585/auth';
  private readonly TOKEN_KEY = 'jwtToken';

  private sessionService!: SessionService;

  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector
  ) {}

  private getSessionService(): SessionService {
    if (!this.sessionService) {
      this.sessionService = this.injector.get(SessionService);
    }
    return this.sessionService;
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => {
        if (response?.token) {
          this.storeToken(response.token);
          this.getSessionService().startSessionTimer();
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username`, {
      params: { username },
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          this.storeToken(response.token);
          this.getSessionService().startSessionTimer();
        }
      })
    );
  }

  getCurrentUser(): Observable<{ firstName: string }> {
    const token = this.getToken();
    return this.http.get<{ firstName: string }>(`${this.apiUrl}/current-user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        console.error('Error fetching user:', err);
        this.logout(); // Clear token, redirect, etc.
        return EMPTY; // Ends the observable stream
      })
    );
  }

  getCurrentUserId(): Observable<{ userId: string }> {
    const token = this.getToken();
    return this.http.get<{ userId: string }>(`${this.apiUrl}/current-user-id`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        console.error('Error fetching user ID:', err);
        this.logout(); // Clear token, redirect, etc.
        return EMPTY; // Ends the observable stream
      })
    );
  }
  

  storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.getSessionService().logout(); // 👈 Centralized logout
  }
}
