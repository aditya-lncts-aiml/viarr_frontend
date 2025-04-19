import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient to make requests
import { AuthService } from '../services/auth.service'; // For fetching user info if needed
import { CommonModule } from '@angular/common'; // For common Angular features
import { Router } from '@angular/router'; // For navigation if needed
import { RouterModule } from '@angular/router'; // For routing features

@Component({
  selector: 'app-resume-analysis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resume-analysis.component.html',
  styleUrls: ['./resume-analysis.component.css']
})
export class ResumeAnalysisComponent implements OnInit {
  loading: boolean = false;  // For showing loading spinner
  errorMessage: string = ''; // For showing error messages
  resumeData: any = null;    // To store the result of resume analysis

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router // Inject the Router service for navigation if needed
  ) {}

  ngOnInit(): void {
    this.getResumeAnalysis();  // Fetch resume analysis when the component loads
  }

  // Method to fetch the resume analysis from the backend
  getResumeAnalysis(): void {
    this.loading = true;
    this.authService.getCurrentUserId().subscribe({
      next: (res) => {
        const userId = res.userId;
        // Send a GET request to retrieve the analysis result
        this.http.get<any>(`http://localhost:8585/api/resume/analysis/${userId}`).subscribe({
          next: (data) => {
            this.resumeData = data; // Store the result of the analysis
            this.loading = false;    // Hide loading spinner after receiving data
          },
          error: (err) => {
            this.errorMessage = 'Failed to fetch resume analysis. Please try again later.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to get user ID.';
        this.loading = false;
      }
    });
  }
}
