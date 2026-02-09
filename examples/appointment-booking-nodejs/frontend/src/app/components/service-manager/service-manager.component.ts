import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-service-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Manage Services</h1>

      <div class="services-list">
        @for (service of services; track service.id) {
          <div class="service-card">
            @if (editingService?.id === service.id) {
              <div class="edit-form">
                <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="editingService.name"></div>
                <div class="form-group"><label>Description</label><textarea [(ngModel)]="editingService.description" rows="2"></textarea></div>
                <div class="form-row">
                  <div class="form-group"><label>Duration (min)</label><input type="number" [(ngModel)]="editingService.duration_minutes"></div>
                  <div class="form-group"><label>Price ($)</label><input type="number" [(ngModel)]="editingService.price" step="0.01"></div>
                  <div class="form-group"><label>Buffer (min)</label><input type="number" [(ngModel)]="editingService.buffer_minutes"></div>
                  <div class="form-group"><label>Deposit (%)</label><input type="number" [(ngModel)]="editingService.deposit_percentage" step="0.01"></div>
                </div>
                <button class="btn btn-primary" (click)="saveService()">Save</button>
                <button class="btn btn-secondary" (click)="editingService = null">Cancel</button>
              </div>
            } @else {
              <h3>{{ service.name }}</h3>
              <p>{{ service.description }}</p>
              <div class="service-details">
                <span>{{ service.duration_minutes }} min</span>
                <span>\${{ service.price }}</span>
                <span>Buffer: {{ service.buffer_minutes }} min</span>
                <span>Deposit: {{ service.deposit_percentage }}%</span>
              </div>
              <div class="service-actions">
                <button class="btn-sm btn-info" (click)="editService(service)">Edit</button>
                <button class="btn-sm btn-danger" (click)="deleteService(service.id)">Delete</button>
              </div>
            }
          </div>
        } @empty {
          <p>No services configured yet.</p>
        }
      </div>

      <div class="add-section">
        <h2>Add New Service</h2>
        <div class="form-group"><label>Name</label><input type="text" [(ngModel)]="newService.name"></div>
        <div class="form-group"><label>Description</label><textarea [(ngModel)]="newService.description" rows="2"></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Duration (min)</label><input type="number" [(ngModel)]="newService.duration_minutes"></div>
          <div class="form-group"><label>Price ($)</label><input type="number" [(ngModel)]="newService.price" step="0.01"></div>
          <div class="form-group"><label>Buffer (min)</label><input type="number" [(ngModel)]="newService.buffer_minutes"></div>
          <div class="form-group"><label>Deposit (%)</label><input type="number" [(ngModel)]="newService.deposit_percentage" step="0.01"></div>
        </div>
        <button class="btn btn-primary" (click)="addService()">Add Service</button>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .services-list { display: grid; gap: 12px; margin-bottom: 24px; }
    .service-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
    .service-details { display: flex; gap: 16px; color: #666; font-size: 14px; margin: 8px 0; }
    .service-actions { display: flex; gap: 8px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .add-section { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
    .btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; margin-right: 8px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-sm { padding: 4px 8px; border-radius: 3px; border: none; cursor: pointer; font-size: 12px; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-danger { background: #dc3545; color: white; }
  `]
})
export class ServiceManagerComponent implements OnInit {
  services: any[] = [];
  editingService: any = null;
  newService = { name: '', description: '', duration_minutes: 30, price: 0, buffer_minutes: 5, deposit_percentage: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.api.getMyServices().subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Error:', err)
    });
  }

  addService() {
    if (!this.newService.name) return;
    this.api.createService(this.newService).subscribe({
      next: () => {
        this.newService = { name: '', description: '', duration_minutes: 30, price: 0, buffer_minutes: 5, deposit_percentage: 0 };
        this.loadServices();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  editService(service: any) {
    this.editingService = { ...service };
  }

  saveService() {
    this.api.updateService(this.editingService.id, this.editingService).subscribe({
      next: () => {
        this.editingService = null;
        this.loadServices();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  deleteService(id: number) {
    if (confirm('Delete this service?')) {
      this.api.deleteService(id).subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error('Error:', err)
      });
    }
  }
}
