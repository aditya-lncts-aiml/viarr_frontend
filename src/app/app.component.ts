import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service'; // ✅ Import
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'viarr-frontend';

  constructor(
    private authService: AuthService,
    private sessionService: SessionService // ✅ Inject session service
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.sessionService.startSessionTimer(); // ✅ Use SessionService
    }
  }
}
