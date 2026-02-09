import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Book an Appointment</h1>

      @if (step === 'select-service') {
        <div class="step">
          <h2>1. Select a Service</h2>
          <div class="service-list">
            @for (service of services; track service.id) {
              <div class="service-card" [class.selected]="selectedService?.id === service.id" (click)="selectService(service)">
                <h3>{{ service.name }}</h3>
                <p>{{ service.description }}</p>
                <div class="service-details">
                  <span>{{ service.duration_minutes }} min</span>
                  <span>\${{ service.price }}</span>
                  @if (service.deposit_percentage > 0) {
                    <span class="deposit">{{ service.deposit_percentage }}% deposit required</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (step === 'select-slot') {
        <div class="step">
          <h2>2. Choose a Date & Time</h2>
          <div class="date-picker">
            <label>Select Date:</label>
            <input type="date" [(ngModel)]="selectedDate" (change)="loadSlots()" [min]="today">
            <label>Timezone:</label>
            <select [(ngModel)]="selectedTimezone" (change)="loadSlots()">
              @for (tz of commonTimezones; track tz) {
                <option [value]="tz">{{ tz }}</option>
              }
            </select>
          </div>
          @if (loading) {
            <p>Loading available slots...</p>
          }
          <div class="slots-grid">
            @for (slot of availableSlots; track slot.start_time) {
              <button class="slot-btn" [class.selected]="selectedSlot?.start_time === slot.start_time" (click)="selectSlot(slot)">
                {{ slot.start_time }} - {{ slot.end_time }}
              </button>
            } @empty {
              @if (!loading && selectedDate) {
                <p>No available slots for this date.</p>
              }
            }
          </div>
          @if (selectedSlot) {
            <button class="btn btn-primary" (click)="step = 'enter-details'">Continue</button>
          }
          <button class="btn btn-secondary" (click)="step = 'select-service'">Back</button>
        </div>
      }

      @if (step === 'enter-details') {
        <div class="step">
          <h2>3. Your Details</h2>
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" [(ngModel)]="customerName" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="customerEmail" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="customerPhone" placeholder="+1-555-0123">
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="notes" placeholder="Any special requirements..." rows="3"></textarea>
          </div>

          @if (selectedService.deposit_percentage > 0) {
            <div class="payment-section">
              <h3>Payment - Deposit Required: \${{ depositAmount.toFixed(2) }}</h3>
              <div class="form-group">
                <label>Card Number (stub)</label>
                <input type="text" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242">
              </div>
            </div>
          }

          <div class="summary">
            <h3>Booking Summary</h3>
            <p><strong>Service:</strong> {{ selectedService.name }}</p>
            <p><strong>Date:</strong> {{ selectedDate }}</p>
            <p><strong>Time:</strong> {{ selectedSlot.start_time }} - {{ selectedSlot.end_time }}</p>
            <p><strong>Duration:</strong> {{ selectedService.duration_minutes }} minutes</p>
            <p><strong>Price:</strong> \${{ selectedService.price }}</p>
          </div>

          @if (bookingError) {
            <div class="error">{{ bookingError }}</div>
          }

          <button class="btn btn-primary" (click)="bookAppointment()" [disabled]="bookingInProgress">
            {{ bookingInProgress ? 'Booking...' : 'Confirm Booking' }}
          </button>
          <button class="btn btn-secondary" (click)="step = 'select-slot'">Back</button>
        </div>
      }

      @if (step === 'confirmation') {
        <div class="step confirmation">
          <h2>Booking Confirmed!</h2>
          <div class="confirmation-details">
            <p class="conf-number">Confirmation #: <strong>{{ confirmationNumber }}</strong></p>
            <p><strong>Service:</strong> {{ selectedService.name }}</p>
            <p><strong>Date:</strong> {{ selectedDate }}</p>
            <p><strong>Time:</strong> {{ selectedSlot.start_time }} - {{ selectedSlot.end_time }}</p>
            <p>A confirmation email has been sent to {{ customerEmail }}.</p>
            <p>You can cancel or reschedule using the link in your confirmation email.</p>
          </div>
          @if (icalUrl) {
            <a [href]="icalUrl" class="btn btn-secondary" download>Download Calendar File (.ics)</a>
          }
          <button class="btn btn-primary" (click)="reset()">Book Another</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .step { margin-top: 20px; }
    .service-list { display: grid; gap: 12px; margin-top: 12px; }
    .service-card { background: white; border: 2px solid #ddd; border-radius: 8px; padding: 16px; cursor: pointer; }
    .service-card.selected { border-color: #4a90d9; background: #f0f7ff; }
    .service-card:hover { border-color: #999; }
    .service-details { display: flex; gap: 16px; margin-top: 8px; color: #666; font-size: 14px; }
    .deposit { color: #e67e22; font-weight: bold; }
    .date-picker { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .date-picker input, .date-picker select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; margin: 16px 0; }
    .slot-btn { padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; }
    .slot-btn.selected { background: #4a90d9; color: white; border-color: #4a90d9; }
    .slot-btn:hover { border-color: #4a90d9; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .summary { background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .payment-section { background: #fff3cd; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .confirmation-details { background: #d4edda; padding: 20px; border-radius: 8px; margin: 16px 0; }
    .conf-number { font-size: 18px; }
    .error { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 4px; margin: 12px 0; }
    .btn { padding: 10px 24px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; margin-right: 8px; margin-top: 8px; text-decoration: none; display: inline-block; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-primary:hover { background: #357abd; }
    .btn-primary:disabled { background: #ccc; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }
  `]
})
export class BookingComponent implements OnInit {
  providerId!: number;
  services: any[] = [];
  selectedService: any = null;
  step: string = 'select-service';
  selectedDate: string = '';
  selectedTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  today: string = new Date().toISOString().split('T')[0];
  availableSlots: any[] = [];
  selectedSlot: any = null;
  loading = false;
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  notes = '';
  cardNumber = '';
  bookingError = '';
  bookingInProgress = false;
  confirmationNumber = '';
  icalUrl = '';
  depositAmount = 0;

  commonTimezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
    'Australia/Sydney', 'Pacific/Auckland', 'UTC'
  ];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProviderServices(this.providerId).subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Error loading services:', err)
    });

    // Pre-fill email from token if available
    if (this.auth.profile()) {
      this.customerEmail = this.auth.profile().email || '';
      this.customerName = (this.auth.profile().given_name || '') + ' ' + (this.auth.profile().family_name || '');
      this.customerName = this.customerName.trim();
    }
  }

  selectService(service: any) {
    this.selectedService = service;
    this.depositAmount = service.price * service.deposit_percentage / 100;
    this.step = 'select-slot';
  }

  loadSlots() {
    if (!this.selectedDate) return;
    this.loading = true;
    this.availableSlots = [];
    this.selectedSlot = null;

    this.api.getAvailableSlots(
      this.providerId, this.selectedDate, this.selectedDate,
      this.selectedService.id, this.selectedTimezone
    ).subscribe({
      next: (data) => {
        this.availableSlots = data[this.selectedDate] || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.loading = false;
      }
    });
  }

  selectSlot(slot: any) {
    this.selectedSlot = slot;
  }

  bookAppointment() {
    this.bookingError = '';
    if (!this.customerName || !this.customerEmail) {
      this.bookingError = 'Name and email are required';
      return;
    }
    this.bookingInProgress = true;

    const data: any = {
      provider_id: this.providerId,
      service_type_id: this.selectedService.id,
      customer_name: this.customerName,
      customer_email: this.customerEmail,
      customer_phone: this.customerPhone || null,
      appointment_date: this.selectedDate,
      start_time: this.selectedSlot.start_time,
      notes: this.notes,
      timezone: this.selectedTimezone
    };

    if (this.selectedService.deposit_percentage > 0 && this.cardNumber) {
      data.card_details = { lastFour: this.cardNumber.slice(-4) };
    }

    this.api.bookAppointment(data).subscribe({
      next: (result) => {
        this.confirmationNumber = result.confirmation_number;
        this.icalUrl = this.api.getICalUrl(result.id);
        this.step = 'confirmation';
        this.bookingInProgress = false;
      },
      error: (err) => {
        this.bookingError = err.error?.error || err.error?.errors?.join(', ') || 'Booking failed';
        this.bookingInProgress = false;
      }
    });
  }

  reset() {
    this.step = 'select-service';
    this.selectedService = null;
    this.selectedSlot = null;
    this.selectedDate = '';
    this.notes = '';
    this.cardNumber = '';
    this.bookingError = '';
    this.confirmationNumber = '';
    this.icalUrl = '';
  }
}
