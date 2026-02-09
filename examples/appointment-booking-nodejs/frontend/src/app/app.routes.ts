import { Routes } from '@angular/router';
import { authGuard, providerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'providers', loadComponent: () => import('./components/provider-list/provider-list.component').then(m => m.ProviderListComponent) },
  { path: 'providers/:id/book', canActivate: [authGuard], loadComponent: () => import('./components/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'my-bookings', canActivate: [authGuard], loadComponent: () => import('./components/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) },
  { path: 'appointments/:confirmationNumber', loadComponent: () => import('./components/appointment-view/appointment-view.component').then(m => m.AppointmentViewComponent) },
  { path: 'cancel/:token', loadComponent: () => import('./components/cancel-reschedule/cancel-reschedule.component').then(m => m.CancelRescheduleComponent) },
  { path: 'provider/dashboard', canActivate: [providerGuard], loadComponent: () => import('./components/provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent) },
  { path: 'provider/availability', canActivate: [providerGuard], loadComponent: () => import('./components/availability-manager/availability-manager.component').then(m => m.AvailabilityManagerComponent) },
  { path: 'provider/services', canActivate: [providerGuard], loadComponent: () => import('./components/service-manager/service-manager.component').then(m => m.ServiceManagerComponent) },
  { path: '**', redirectTo: '' }
];
