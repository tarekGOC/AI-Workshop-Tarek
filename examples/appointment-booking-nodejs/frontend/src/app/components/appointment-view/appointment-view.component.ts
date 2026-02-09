import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-appointment-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      @if (loading) {
        <p>Loading appointment...</p>
      } @else if (error) {
        <div class="error">{{ error }}</div>
      } @else if (appointment) {
        <h1>Appointment Details</h1>
        <div class="detail-card">
          <div class="status-badge" [class]="appointment.status">{{ appointment.status }}</div>
          <p class="conf-number">Confirmation #: <strong>{{ appointment.confirmation_number }}</strong></p>
          <div class="detail-grid">
            <div><strong>Service:</strong> {{ appointment.service_name }}</div>
            <div><strong>Provider:</strong> {{ appointment.provider_name }}</div>
            <div><strong>Date:</strong> {{ appointment.appointment_date | date:'mediumDate' }}</div>
            <div><strong>Time:</strong> {{ appointment.start_time }} - {{ appointment.end_time }}</div>
            <div><strong>Duration:</strong> {{ appointment.duration_minutes }} minutes</div>
            <div><strong>Price:</strong> \${{ appointment.price }}</div>
            @if (appointment.notes) {
              <div><strong>Notes:</strong> {{ appointment.notes }}</div>
            }
            <div><strong>Payment Status:</strong> {{ appointment.payment_status }}</div>
          </div>
          <div class="actions">
            <a [href]="icalUrl" class="btn btn-secondary" download>Download Calendar (.ics)</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .detail-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 24px; }
    .conf-number { font-size: 18px; margin-bottom: 16px; }
    .detail-grid { display: grid; gap: 8px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    .status-badge.booked { background: #d4edda; color: #155724; }
    .status-badge.completed { background: #cce5ff; color: #004085; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }
    .error { background: #f8d7da; color: #721c24; padding: 16px; border-radius: 8px; }
    .actions { margin-top: 20px; }
    .btn { padding: 10px 24px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; text-decoration: none; display: inline-block; }
    .btn-secondary { background: #6c757d; color: white; }
  `]
})
export class AppointmentViewComponent implements OnInit {
  appointment: any = null;
  loading = true;
  error = '';
  icalUrl = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const confirmationNumber = this.route.snapshot.paramMap.get('confirmationNumber');
    if (confirmationNumber) {
      this.api.getAppointmentByConfirmation(confirmationNumber).subscribe({
        next: (data) => {
          this.appointment = data;
          this.icalUrl = this.api.getICalUrl(data.id);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Appointment not found';
          this.loading = false;
        }
      });
    }
  }
}
