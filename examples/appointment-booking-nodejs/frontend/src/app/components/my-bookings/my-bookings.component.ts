import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <h1>My Bookings</h1>

      <div class="filters">
        <div class="filter-group">
          <label>Show:</label>
          <select [(ngModel)]="timeFilter" (change)="loadBookings()">
            <option value="">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="statusFilter" (change)="loadBookings()">
            <option value="">All</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <p class="loading">Loading your bookings...</p>
      } @else if (bookings.length === 0) {
        <div class="empty-state">
          <p>No bookings found.</p>
          <a routerLink="/providers" class="btn btn-primary">Browse Providers</a>
        </div>
      } @else {
        <div class="bookings-list">
          @for (booking of bookings; track booking.id) {
            <div class="booking-card" [class.past]="isPast(booking)" [class.cancelled]="booking.status === 'cancelled'">
              <div class="booking-header">
                <span class="status-badge" [class]="'status-' + booking.status">{{ booking.status }}</span>
                <span class="conf-number">{{ booking.confirmation_number }}</span>
              </div>
              <div class="booking-body">
                <div class="booking-info">
                  <h3>{{ booking.service_name }}</h3>
                  <p class="provider">with {{ booking.provider_name }} &mdash; {{ booking.provider_specialty }}</p>
                  <div class="datetime">
                    <span class="date">📅 {{ booking.appointment_date | date:'fullDate' }}</span>
                    <span class="time">🕐 {{ booking.start_time }} &ndash; {{ booking.end_time }}</span>
                  </div>
                  @if (booking.notes) {
                    <p class="notes">📝 {{ booking.notes }}</p>
                  }
                </div>
                <div class="booking-meta">
                  <p class="price">\${{ booking.price }}</p>
                  @if (booking.deposit_amount > 0) {
                    <p class="deposit">Deposit paid: \${{ booking.deposit_amount }}</p>
                  }
                </div>
              </div>
              <div class="booking-actions">
                @if (booking.status === 'booked' && !isPast(booking)) {
                  <a [routerLink]="['/cancel', booking.cancellation_token]" class="btn btn-sm btn-secondary">Cancel / Reschedule</a>
                }
                <a [routerLink]="['/appointments', booking.confirmation_number]" class="btn btn-sm btn-outline">View Details</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; margin-bottom: 20px; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-group label { font-weight: 500; color: #555; }
    .filter-group select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .loading { color: #666; text-align: center; padding: 40px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #666; }
    .empty-state p { margin-bottom: 16px; font-size: 16px; }
    .bookings-list { display: flex; flex-direction: column; gap: 16px; }
    .booking-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .booking-card.past { opacity: 0.75; }
    .booking-card.cancelled { border-left: 4px solid #dc3545; }
    .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .conf-number { font-family: monospace; color: #888; font-size: 13px; }
    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-booked { background: #d4edda; color: #155724; }
    .status-completed { background: #cce5ff; color: #004085; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .booking-body { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .booking-info { flex: 1; }
    .booking-info h3 { margin: 0 0 4px; color: #333; }
    .provider { color: #666; font-size: 14px; margin-bottom: 8px; }
    .datetime { display: flex; gap: 16px; font-size: 14px; color: #555; flex-wrap: wrap; }
    .notes { color: #888; font-size: 13px; margin-top: 8px; }
    .booking-meta { text-align: right; }
    .price { font-size: 18px; font-weight: 600; color: #333; margin: 0; }
    .deposit { font-size: 12px; color: #888; }
    .booking-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
    .btn { padding: 8px 16px; border-radius: 4px; text-decoration: none; cursor: pointer; border: none; font-size: 13px; display: inline-block; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-primary:hover { background: #357abd; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }
    .btn-outline { background: white; color: #4a90d9; border: 1px solid #4a90d9; }
    .btn-outline:hover { background: #f0f7ff; }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;
  timeFilter = '';
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    const filters: any = {};
    if (this.timeFilter) filters.time = this.timeFilter;
    if (this.statusFilter) filters.status = this.statusFilter;

    this.api.getMyBookings(filters).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loading = false;
      }
    });
  }

  isPast(booking: any): boolean {
    const now = new Date();
    const apptDate = new Date(booking.appointment_date + 'T' + booking.end_time);
    return apptDate < now;
  }
}
