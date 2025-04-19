import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-ranker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [],
  templateUrl: './ranker.component.html',
  styleUrls: ['./ranker.component.css']
})
export class RankerComponent {
  jobDescription: string = '';
  atsScore: number | null = null;
  loading = false;
  message = '';

  constructor(private http: HttpClient) {}

  checkAtsScore() {
    if (!this.jobDescription.trim()) return;

    this.loading = true;
    this.atsScore = null;
    this.message = '';

    
    this.http.post<any>('http://localhost:8585/ats-score', {
      jobDescription: this.jobDescription
    }).subscribe({
      next: (res) => {
        this.atsScore = res.score;
        this.message = this.getMessage(res.score);
        console.log(this.message);
        
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      
        if (err.status === 404 && err.error?.error?.includes('Resume not found')) {
          this.message = '❌ Resume not found. Please upload your resume before checking ATS score.';
        } else if (err.status === 401) {
          this.message = '❌ You are not logged in. Please log in to check your ATS score.';
        } else {
          this.message = '⚠️ Something went wrong. Please try again later.';
        }
      
        console.error('ATS Score Error:', err);
      }
      
    });
  }

  getMessage(score: number): string {
    if (score >= 80) return '🔥 Excellent Match';
    if (score >= 60) return '✅ Good Match';
    if (score >= 40) return '⚠️ Fair Match';
    if (score >= 20) return '⚠️ Weak Match';
    if (score >= 0) return '❌ Poor Match';
    console.log(score);
    
    return '❌ Needs Improvement';
  }
  getColor(score: number): string {
    if (score >= 70) return '#28a745'; // Green
    if (score >= 40) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }
}

