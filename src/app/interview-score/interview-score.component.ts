import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-score',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './interview-score.component.html',
  styleUrls: ['./interview-score.component.css']
})
export class InterviewScoreComponent implements OnInit {
  userId: string = '';
  evaluations: any[] = [];
  errorMessage: string | null = null;
  loading: boolean = false; // 👈 Loading flag

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router // Inject the Router service
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe({
      next: (res) => {
        this.userId = res.userId;
        this.fetchEvaluations(this.userId);
      },
      error: () => {
        this.errorMessage = 'Failed to get user ID.';
      }
    });
  }

  fetchEvaluations(userId: string): void {
    this.loading = true; // 👈 Start loading
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    this.http.get<any[]>(`http://localhost:8585/api/interview/evaluate`, {
      headers,
      params: { userId }
    }).subscribe({
      next: (data) => {
        this.evaluations = data;
        this.loading = false; // 👈 Stop loading
      },
      error: (err) => {
        this.loading = false; // 👈 Stop loading even on error
        this.errorMessage = err.status === 429
          ? 'Too many requests. Please wait a few minutes and try again.'
          : 'Failed to fetch evaluations.';
      }
    });
  }
}
