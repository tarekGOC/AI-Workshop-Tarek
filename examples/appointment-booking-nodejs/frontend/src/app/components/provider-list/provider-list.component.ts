import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Service Providers</h1>
      <p>Browse our available service providers and book an appointment.</p>
      
      <div class="provider-grid">
        @for (provider of providers; track provider.id) {
          <div class="provider-card">
            <div class="provider-avatar">{{ provider.name.charAt(0) }}</div>
            <h3>{{ provider.name }}</h3>
            <p class="specialty">{{ provider.specialty }}</p>
            <p class="contact">{{ provider.email }}</p>
            @if (provider.phone) {
              <p class="contact">{{ provider.phone }}</p>
            }
            <a [routerLink]="['/providers', provider.id, 'book']" class="btn btn-primary">Book Appointment</a>
          </div>
        } @empty {
          <p>No providers found.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; margin-bottom: 10px; }
    .provider-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .provider-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .provider-avatar { width: 60px; height: 60px; border-radius: 50%; background: #4a90d9; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 16px; }
    .specialty { color: #666; font-style: italic; }
    .contact { color: #888; font-size: 14px; }
    .btn { display: inline-block; padding: 10px 24px; border-radius: 4px; text-decoration: none; cursor: pointer; border: none; font-size: 14px; margin-top: 12px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-primary:hover { background: #357abd; }
  `]
})
export class ProviderListComponent implements OnInit {
  providers: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProviders().subscribe({
      next: (data) => this.providers = data,
      error: (err) => console.error('Error loading providers:', err)
    });
  }
}
