import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cancel-reschedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      @if (loading) {
        <p>Loading appointment...</p>
      } @else if (error) {
        <div class="error">{{ error }}</div>
      } @else if (cancelled) {
        <div class="success">
          <h2>Appointment Cancelled</h2>
          <p>Your appointment has been cancelled successfully.</p>
          @if (refundAmount > 0) {
            <p>A refund of \${{ refundAmount.toFixed(2) }} will be processed.</p>
          }
        </div>
      } @else if (rescheduled) {
        <div class="success">
          <h2>Appointment Rescheduled</h2>
          <p>Your appointment has been moved to {{ newDate }} at {{ newTime }}.</p>
        </div>
      } @else if (appointment) {
        <h1>Manage Appointment</h1>
        <div class="detail-card">
          <div class="status-badge" [class]="appointment.status">{{ appointment.status }}</div>
          <p><strong>Service:</strong> {{ appointment.service_name }}</p>
          <p><strong>Provider:</strong> {{ appointment.provider_name }}</p>
          <p><strong>Date:</strong> {{ appointment.appointment_date | date:'mediumDate' }}</p>
          <p><strong>Time:</strong> {{ appointment.start_time }} - {{ appointment.end_time }}</p>
        </div>

        @if (appointment.status !== 'cancelled') {
          <div class="actions">
            <h2>Cancel Appointment</h2>
            <div class="form-group">
              <label>Reason for cancellation:</label>
              <textarea [(ngModel)]="cancelReason" rows="3" placeholder="Optional reason..."></textarea>
            </div>
            @if (!confirmCancel) {
              <button class="btn btn-danger" (click)="confirmCancel = true">Cancel Appointment</button>
            } @else {
              <div class="confirm-box">
                <p><strong>Are you sure?</strong> This action cannot be undone.</p>
                <button class="btn btn-danger" (click)="cancelAppointment()">Yes, Cancel</button>
                <button class="btn btn-secondary" (click)="confirmCancel = false">No, Keep It</button>
              </div>
            }

            <h2>Reschedule Appointment</h2>
            <div class="form-group">
              <label>New Date:</label>
              <input type="date" [(ngModel)]="newDate" (change)="loadSlots()" [min]="today">
            </div>
            @if (availableSlots.length > 0) {
              <div class="slots-grid">
                @for (slot of availableSlots; track slot.start_time) {
                  <button class="slot-btn" [class.selected]="selectedSlot?.start_time === slot.start_time" (click)="selectedSlot = slot">
                    {{ slot.start_time }} - {{ slot.end_time }}
                  </button>
                }
              </div>
              @if (selectedSlot) {
                <button class="btn btn-primary" (click)="rescheduleAppointment()">Reschedule to {{ newDate }} {{ selectedSlot.start_time }}</button>
              }
            } @else if (newDate) {
              <p>No available slots on this date.</p>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .detail-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    .status-badge.booked { background: #d4edda; color: #155724; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; margin: 16px 0; }
    .slot-btn { padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; }
    .slot-btn.selected { background: #4a90d9; color: white; }
    .confirm-box { background: #fff3cd; padding: 16px; border-radius: 8px; margin: 12px 0; }
    .success { background: #d4edda; padding: 20px; border-radius: 8px; }
    .error { background: #f8d7da; color: #721c24; padding: 16px; border-radius: 8px; }
    .btn { padding: 10px 24px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; margin-right: 8px; margin-top: 8px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class CancelRescheduleComponent implements OnInit {
  appointment: any = null;
  loading = true;
  error = '';
  cancelReason = '';
  confirmCancel = false;
  cancelled = false;
  rescheduled = false;
  refundAmount = 0;
  newDate = '';
  newTime = '';
  today = new Date().toISOString().split('T')[0];
  availableSlots: any[] = [];
  selectedSlot: any = null;
  token = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.api.getAppointmentByCancelToken(this.token).subscribe({
      next: (data) => {
        this.appointment = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Appointment not found or invalid link';
        this.loading = false;
      }
    });
  }

  cancelAppointment() {
    this.api.cancelAppointment(this.token, this.cancelReason).subscribe({
      next: (result) => {
        this.cancelled = true;
        this.refundAmount = result.refund_amount || 0;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to cancel appointment';
      }
    });
  }

  loadSlots() {
    if (!this.newDate) return;
    this.api.getAvailableSlots(
      this.appointment.provider_id, this.newDate, this.newDate,
      this.appointment.service_type_id
    ).subscribe({
      next: (data) => {
        this.availableSlots = data[this.newDate] || [];
      },
      error: (err) => console.error('Error loading slots:', err)
    });
  }

  rescheduleAppointment() {
    if (!this.selectedSlot) return;
    this.api.rescheduleAppointment(this.token, {
      appointment_date: this.newDate,
      start_time: this.selectedSlot.start_time
    }).subscribe({
      next: (result) => {
        this.rescheduled = true;
        this.newDate = result.new_date;
        this.newTime = result.new_time;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to reschedule';
      }
    });
  }
}
