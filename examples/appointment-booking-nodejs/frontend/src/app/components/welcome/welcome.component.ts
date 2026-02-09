import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-page">
      <div class="welcome-card">
        <div class="logo">📅</div>
        <h1>Appointment Booking</h1>
        <p class="subtitle">Schedule appointments with our service providers quickly and easily.</p>

        @if (auth.authenticated()) {
          <div class="logged-in">
            <p>Welcome back, <strong>{{ auth.username() }}</strong>!</p>
            <button class="btn btn-primary" (click)="goToProviders()">Browse Providers</button>
            @if (auth.isProvider()) {
              <button class="btn btn-secondary" (click)="goToDashboard()">Provider Dashboard</button>
            }
          </div>
        } @else {
          <div class="login-section">
            <div class="login-form-look">
              <h2>Sign In</h2>
              <p class="login-hint">Use your organizational account to get started</p>
              <button class="btn btn-keycloak" (click)="auth.login()">
                <span class="keycloak-icon">🔐</span>
                Login with Keycloak
              </button>
            </div>
          </div>
        }

        <div class="features">
          <div class="feature">
            <span class="feature-icon">🕐</span>
            <h3>Easy Scheduling</h3>
            <p>Pick a time slot that works for you</p>
          </div>
          <div class="feature">
            <span class="feature-icon">📋</span>
            <h3>Manage Bookings</h3>
            <p>View, cancel, or reschedule anytime</p>
          </div>
          <div class="feature">
            <span class="feature-icon">👤</span>
            <h3>Provider Dashboard</h3>
            <p>Providers manage availability and services</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 60px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .welcome-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .logo {
      font-size: 64px;
      margin-bottom: 8px;
    }
    h1 {
      color: #333;
      margin: 0 0 8px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 32px;
      font-size: 15px;
    }
    .login-section {
      margin-bottom: 32px;
    }
    .login-form-look {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 32px 24px;
    }
    .login-form-look h2 {
      margin: 0 0 8px;
      color: #333;
      font-size: 20px;
    }
    .login-hint {
      color: #888;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      padding: 12px 32px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-keycloak {
      background: #4a90d9;
      color: white;
      width: 100%;
      padding: 14px 32px;
      font-size: 16px;
    }
    .btn-keycloak:hover { background: #357abd; }
    .keycloak-icon { margin-right: 8px; }
    .btn-primary {
      background: #4a90d9;
      color: white;
      margin-right: 12px;
    }
    .btn-primary:hover { background: #357abd; }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-secondary:hover { background: #5a6268; }
    .logged-in p {
      color: #555;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #eee;
    }
    .feature {
      text-align: center;
    }
    .feature-icon {
      font-size: 28px;
      display: block;
      margin-bottom: 8px;
    }
    .feature h3 {
      font-size: 13px;
      color: #333;
      margin: 0 0 4px;
    }
    .feature p {
      font-size: 11px;
      color: #888;
      margin: 0;
    }
    @media (max-width: 520px) {
      .welcome-card { padding: 24px; }
      .features { grid-template-columns: 1fr; }
    }
  `]
})
export class WelcomeComponent {
  constructor(public auth: AuthService, private router: Router) {}

  goToProviders() {
    this.router.navigate(['/providers']);
  }

  goToDashboard() {
    this.router.navigate(['/provider/dashboard']);
  }
}
