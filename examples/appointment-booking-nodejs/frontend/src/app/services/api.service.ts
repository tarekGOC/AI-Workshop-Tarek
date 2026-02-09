import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Providers
  getProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/appointments/providers`);
  }

  // Slots
  getAvailableSlots(providerId: number, startDate: string, endDate: string, serviceTypeId?: number, timezone?: string): Observable<any> {
    let params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    if (serviceTypeId) params = params.set('service_type_id', serviceTypeId.toString());
    if (timezone) params = params.set('timezone', timezone);
    return this.http.get<any>(`${this.baseUrl}/appointments/providers/${providerId}/slots`, { params });
  }

  // Services
  getProviderServices(providerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services/provider/${providerId}`);
  }

  getMyServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services/mine`, { headers: this.getHeaders() });
  }

  createService(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/services`, data, { headers: this.getHeaders() });
  }

  updateService(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/services/${id}`, data, { headers: this.getHeaders() });
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/services/${id}`, { headers: this.getHeaders() });
  }

  // Appointments
  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments`, data, { headers: this.getHeaders() });
  }

  getMyBookings(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/appointments/my-bookings`, { headers: this.getHeaders(), params });
  }

  getAppointmentByConfirmation(confirmationNumber: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointments/confirm/${confirmationNumber}`);
  }

  getAppointmentByCancelToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointments/cancel/${token}`);
  }

  cancelAppointment(token: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments/cancel/${token}`, { reason });
  }

  rescheduleAppointment(token: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/reschedule/${token}`, data);
  }

  getICalUrl(appointmentId: number): string {
    return `${this.baseUrl}/appointments/${appointmentId}/ical`;
  }

  // Provider appointments
  getProviderAppointments(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/appointments/provider/list`, { headers: this.getHeaders(), params });
  }

  completeAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/provider/${id}/complete`, {}, { headers: this.getHeaders() });
  }

  providerCancelAppointment(id: number, reason: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/provider/${id}/cancel`, { reason }, { headers: this.getHeaders() });
  }

  sendMessageToCustomer(id: number, subject: string, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments/provider/${id}/message`, { subject, message }, { headers: this.getHeaders() });
  }

  getProviderStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointments/provider/stats`, { headers: this.getHeaders() });
  }

  exportAppointments(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/appointments/provider/export`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Availability
  getMyAvailability(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/provider/availability`, { headers: this.getHeaders() });
  }

  createAvailability(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/provider/availability`, data, { headers: this.getHeaders() });
  }

  updateAvailability(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/provider/availability/${id}`, data, { headers: this.getHeaders() });
  }

  deleteAvailability(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/provider/availability/${id}`, { headers: this.getHeaders() });
  }

  addBlockedDate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/provider/availability/blocked-dates`, data, { headers: this.getHeaders() });
  }

  removeBlockedDate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/provider/availability/blocked-dates/${id}`, { headers: this.getHeaders() });
  }

  addBreak(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/provider/availability/breaks`, data, { headers: this.getHeaders() });
  }

  removeBreak(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/provider/availability/breaks/${id}`, { headers: this.getHeaders() });
  }

  // Payments
  processPayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/process`, data, { headers: this.getHeaders() });
  }

  processRefund(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/refund`, data, { headers: this.getHeaders() });
  }

  // Timezones
  getTimezones(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/timezones`);
  }
}
