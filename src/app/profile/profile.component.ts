import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: any = null;
  loading: boolean = true;
  errorMessage: string = '';
  userId: string = '';

  constructor(private http: HttpClient, 
              private authService: AuthService, 
              private router: Router // Inject the Router service
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUserId().subscribe({
      next: (res) => {
        this.userId = res.userId;
        if (!this.userId || this.userId === 'null') {
          this.errorMessage = 'User is not logged in.';
          this.loading = false;
          return;
        }
      
        this.http.get<any>(`http://localhost:8585/user-service/profile/${this.userId}`)
          .subscribe({
            next: (data) => {
              this.userData = data;
              this.loading = false;
            },
            error: (err) => {
              this.errorMessage = 'Failed to fetch user details';
              this.loading = false;
            }
          });
      },
      error: () => {
        this.errorMessage = 'Failed to get user ID.';
      }
    });
  
    
  }
  
}
