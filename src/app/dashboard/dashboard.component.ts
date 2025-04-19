import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  firstName: string = '';
  selectedFile: File | null = null;
  uploadMessage: string = '';
  uploading: boolean = false;
  // resumeRank: string = '';


  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService // ✅ Inject it
  ) {}
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  uploadResume() {
    if (!this.selectedFile) return;
  
    this.uploading = true; // 🟢 Start spinner
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    this.http.post('http://localhost:8585/api/resume/upload', formData, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.uploadMessage = 'Resume uploaded successfully!';
        this.uploading = false; // 🛑 Stop spinner
        this.selectedFile = null;
      },
      error: (err) => {
        this.uploadMessage = 'Failed to upload resume. Please try again.';
        this.uploading = false; // 🛑 Stop spinner
      }
    });
  }
  

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          this.firstName = user.firstName;
          this.sessionService.startSessionTimer(); // ✅ Centralized
        },
        error: (err) => {
          console.error('Error fetching current user:', err);
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.sessionService.clearSessionTimer(); // ✅ Clean up
  }

  dropdownOpen: boolean = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

goToProfile() {
  this.router.navigate(['/profile']);
  this.dropdownOpen = false;
}

goToHistory() {
  this.router.navigate(['/interview-score']);
  this.dropdownOpen = false;
}

goToAnalysis() {
  this.router.navigate(['/resume-analysis']);
  this.dropdownOpen = false;
}

logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
  this.dropdownOpen = false;
}

}
