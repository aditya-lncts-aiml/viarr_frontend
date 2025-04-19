import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Add this
import { LoginComponent } from './login/login.component'; // ✅ Import your component
import { RegisterComponent } from './register/register.component'; // ✅ Import your component
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingComponent } from './landing/landing.component';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { CommonModule } from '@angular/common';
import { AuthGuard } from './services/auth-guard.service';
import { SessionService } from './services/session.service'; // ✅ Import your service
import { AuthService } from './services/auth.service'; // ✅ Import your service
import { RankerComponent } from './ranker/ranker.component';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'; // ✅ Import your component
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NgModel } from '@angular/forms'; // ✅ Import NgModel
import { InterviewSessionComponent } from './interview-session/interview-session.component';
import { InterviewScoreComponent } from './interview-score/interview-score.component'; // ✅ Import your component
import { ProfileComponent } from './profile/profile.component';
import { ResumeAnalysisComponent } from './resume-analysis/resume-analysis.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter([
      { path: '', redirectTo: 'landing', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
      { path: 'landing', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
      { path: 'ranker', loadComponent: () => import('./ranker/ranker.component').then(m => m.RankerComponent), canActivate: [AuthGuard] },
      { path: 'email-verification', loadComponent: () => import('./email-verification/email-verification.component').then(m => m.EmailVerificationComponent) },
      { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
      { path: 'interview-session', loadComponent: () => import('./interview-session/interview-session.component').then(m => m.InterviewSessionComponent) },
      { path: 'interview-score', loadComponent: () => import('./interview-score/interview-score.component').then(m => m.InterviewScoreComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'resume-analysis', loadComponent: () => import('./resume-analysis/resume-analysis.component').then(m => m.ResumeAnalysisComponent) },
    ]),
    provideAnimations(),
    importProvidersFrom(FormsModule, ReactiveFormsModule)
 // ✅ Import ReactiveFormsModule
  ]
};
