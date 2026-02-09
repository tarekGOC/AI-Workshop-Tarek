import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Provider Dashboard</h1>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.upcoming || 0 }}</div>
          <div class="stat-label">Upcoming</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.completed || 0 }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.cancelled || 0 }}</div>
          <div class="stat-label">Cancelled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.cancellation_rate || 0 }}%</div>
          <div class="stat-label">Cancellation Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.no_show_rate || 0 }}%</div>
          <div class="stat-label">No-Show Rate</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input type="date" [(ngModel)]="filterDateFrom" placeholder="From date">
        <input type="date" [(ngModel)]="filterDateTo" placeholder="To date">
        <select [(ngModel)]="filterStatus">
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-Show</option>
        </select>
        <input type="text" [(ngModel)]="filterSearch" placeholder="Search customer...">
        <button class="btn btn-primary" (click)="loadAppointments()">Filter</button>
        <button class="btn btn-secondary" (click)="exportCalendar()">Export Calendar</button>
      </div>

      <!-- Appointments Table -->
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (apt of appointments; track apt.id) {
              <tr [class]="apt.status">
                <td>{{ apt.appointment_date | date:'mediumDate' }}</td>
                <td>{{ apt.start_time }} - {{ apt.end_time }}</td>
                <td>
                  <strong>{{ apt.customer_name }}</strong><br>
                  <small>{{ apt.customer_email }}</small>
                  @if (apt.customer_phone) { <br><small>{{ apt.customer_phone }}</small> }
                </td>
                <td>{{ apt.service_name }}</td>
                <td><span class="status-badge" [class]="apt.status">{{ apt.status }}</span></td>
                <td class="actions-cell">
                  @if (apt.status === 'booked') {
                    <button class="btn-sm btn-success" (click)="completeAppointment(apt)">Complete</button>
                    <button class="btn-sm btn-danger" (click)="openCancelDialog(apt)">Cancel</button>
                    <button class="btn-sm btn-info" (click)="openMessageDialog(apt)">Message</button>
                  }
                  @if (apt.notes) {
                    <div class="notes"><small>Notes: {{ apt.notes }}</small></div>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6">No appointments found.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Cancel Dialog -->
      @if (cancelDialog) {
        <div class="modal-overlay" (click)="cancelDialog = null">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Cancel Appointment</h3>
            <p>Cancel appointment for {{ cancelDialog.customer_name }}?</p>
            <div class="form-group">
              <label>Reason:</label>
              <textarea [(ngModel)]="cancelReason" rows="3"></textarea>
            </div>
            <button class="btn btn-danger" (click)="confirmCancel()">Cancel Appointment</button>
            <button class="btn btn-secondary" (click)="cancelDialog = null">Close</button>
          </div>
        </div>
      }

      <!-- Message Dialog -->
      @if (messageDialog) {
        <div class="modal-overlay" (click)="messageDialog = null">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Send Message to {{ messageDialog.customer_name }}</h3>
            <div class="form-group">
              <label>Subject:</label>
              <input type="text" [(ngModel)]="messageSubject">
            </div>
            <div class="form-group">
              <label>Message:</label>
              <textarea [(ngModel)]="messageBody" rows="4"></textarea>
            </div>
            <button class="btn btn-primary" (click)="sendMessage()">Send</button>
            <button class="btn btn-secondary" (click)="messageDialog = null">Close</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #4a90d9; }
    .stat-label { color: #666; font-size: 14px; }
    .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
    .filters input, .filters select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    tr.cancelled { opacity: 0.6; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .status-badge.booked { background: #d4edda; color: #155724; }
    .status-badge.completed { background: #cce5ff; color: #004085; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }
    .status-badge.no-show { background: #fff3cd; color: #856404; }
    .actions-cell { white-space: nowrap; }
    .btn-sm { padding: 4px 8px; border-radius: 3px; border: none; cursor: pointer; font-size: 12px; margin: 2px; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .notes { margin-top: 4px; color: #666; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 8px; padding: 24px; max-width: 500px; width: 100%; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .btn { padding: 10px 24px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; margin-right: 8px; margin-top: 8px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class ProviderDashboardComponent implements OnInit {
  appointments: any[] = [];
  stats: any = {};
  filterDateFrom = '';
  filterDateTo = '';
  filterStatus = '';
  filterSearch = '';
  cancelDialog: any = null;
  cancelReason = '';
  messageDialog: any = null;
  messageSubject = '';
  messageBody = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAppointments();
    this.loadStats();
  }

  loadAppointments() {
    const filters: any = {};
    if (this.filterDateFrom) filters.date_from = this.filterDateFrom;
    if (this.filterDateTo) filters.date_to = this.filterDateTo;
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterSearch) filters.search = this.filterSearch;

    this.api.getProviderAppointments(filters).subscribe({
      next: (data) => this.appointments = data,
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  loadStats() {
    this.api.getProviderStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  completeAppointment(apt: any) {
    this.api.completeAppointment(apt.id).subscribe({
      next: () => {
        apt.status = 'completed';
        this.loadStats();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  openCancelDialog(apt: any) {
    this.cancelDialog = apt;
    this.cancelReason = '';
  }

  confirmCancel() {
    this.api.providerCancelAppointment(this.cancelDialog.id, this.cancelReason).subscribe({
      next: () => {
        this.cancelDialog.status = 'cancelled';
        this.cancelDialog = null;
        this.loadStats();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  openMessageDialog(apt: any) {
    this.messageDialog = apt;
    this.messageSubject = '';
    this.messageBody = '';
  }

  sendMessage() {
    this.api.sendMessageToCustomer(this.messageDialog.id, this.messageSubject, this.messageBody).subscribe({
      next: () => {
        alert('Message sent!');
        this.messageDialog = null;
      },
      error: (err) => console.error('Error:', err)
    });
  }

  exportCalendar() {
    this.api.exportAppointments().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appointments.ics';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error exporting:', err)
    });
  }
}
