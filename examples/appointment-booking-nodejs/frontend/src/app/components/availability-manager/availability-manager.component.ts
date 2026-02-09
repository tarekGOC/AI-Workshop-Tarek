import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-availability-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Manage Availability</h1>

      <!-- Weekly Schedule -->
      <div class="section">
        <h2>Weekly Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (slot of availability; track slot.id) {
              <tr>
                <td>{{ dayNames[slot.day_of_week] }}</td>
                <td>{{ slot.start_time }}</td>
                <td>{{ slot.end_time }}</td>
                <td>{{ slot.is_active ? 'Yes' : 'No' }}</td>
                <td>
                  <button class="btn-sm btn-danger" (click)="deleteAvailability(slot.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="add-form">
          <h3>Add Availability</h3>
          <select [(ngModel)]="newAvail.day_of_week">
            @for (day of dayNames; track $index) {
              <option [value]="$index">{{ day }}</option>
            }
          </select>
          <input type="time" [(ngModel)]="newAvail.start_time">
          <input type="time" [(ngModel)]="newAvail.end_time">
          <button class="btn btn-primary" (click)="addAvailability()">Add</button>
        </div>
      </div>

      <!-- Breaks -->
      <div class="section">
        <h2>Breaks</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (brk of breaks; track brk.id) {
              <tr>
                <td>{{ dayNames[brk.day_of_week] }}</td>
                <td>{{ brk.start_time }}</td>
                <td>{{ brk.end_time }}</td>
                <td>
                  <button class="btn-sm btn-danger" (click)="deleteBreak(brk.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="add-form">
          <h3>Add Break</h3>
          <select [(ngModel)]="newBreak.day_of_week">
            @for (day of dayNames; track $index) {
              <option [value]="$index">{{ day }}</option>
            }
          </select>
          <input type="time" [(ngModel)]="newBreak.start_time">
          <input type="time" [(ngModel)]="newBreak.end_time">
          <button class="btn btn-primary" (click)="addBreak()">Add</button>
        </div>
      </div>

      <!-- Blocked Dates -->
      <div class="section">
        <h2>Blocked Dates (Vacation/Days Off)</h2>
        <div class="blocked-list">
          @for (bd of blockedDates; track bd.id) {
            <div class="blocked-item">
              <span>{{ bd.blocked_date | date:'mediumDate' }}</span>
              @if (bd.reason) { <span class="reason">- {{ bd.reason }}</span> }
              <button class="btn-sm btn-danger" (click)="removeBlockedDate(bd.id)">Remove</button>
            </div>
          } @empty {
            <p>No blocked dates.</p>
          }
        </div>

        <div class="add-form">
          <h3>Block a Date</h3>
          <input type="date" [(ngModel)]="newBlockedDate.date">
          <input type="text" [(ngModel)]="newBlockedDate.reason" placeholder="Reason (optional)">
          <button class="btn btn-primary" (click)="addBlockedDate()">Block Date</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .section { margin-bottom: 32px; background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; }
    .add-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid #eee; }
    .add-form h3 { width: 100%; margin: 0 0 8px; }
    .add-form input, .add-form select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .blocked-list { margin-bottom: 16px; }
    .blocked-item { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
    .reason { color: #666; }
    .btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; }
    .btn-primary { background: #4a90d9; color: white; }
    .btn-sm { padding: 4px 8px; border-radius: 3px; border: none; cursor: pointer; font-size: 12px; }
    .btn-danger { background: #dc3545; color: white; }
  `]
})
export class AvailabilityManagerComponent implements OnInit {
  availability: any[] = [];
  breaks: any[] = [];
  blockedDates: any[] = [];
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  newAvail = { day_of_week: 1, start_time: '09:00', end_time: '17:00' };
  newBreak = { day_of_week: 1, start_time: '12:00', end_time: '13:00' };
  newBlockedDate = { date: '', reason: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getMyAvailability().subscribe({
      next: (data) => {
        this.availability = data.availability || [];
        this.breaks = data.breaks || [];
        this.blockedDates = data.blocked_dates || [];
      },
      error: (err) => console.error('Error loading availability:', err)
    });
  }

  addAvailability() {
    this.api.createAvailability(this.newAvail).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error:', err)
    });
  }

  deleteAvailability(id: number) {
    this.api.deleteAvailability(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error:', err)
    });
  }

  addBreak() {
    this.api.addBreak(this.newBreak).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error:', err)
    });
  }

  deleteBreak(id: number) {
    this.api.removeBreak(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error:', err)
    });
  }

  addBlockedDate() {
    if (!this.newBlockedDate.date) return;
    this.api.addBlockedDate({
      blocked_date: this.newBlockedDate.date,
      reason: this.newBlockedDate.reason
    }).subscribe({
      next: () => {
        this.newBlockedDate = { date: '', reason: '' };
        this.loadData();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  removeBlockedDate(id: number) {
    this.api.removeBlockedDate(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error:', err)
    });
  }
}
