import { Injectable, signal, computed } from '@angular/core';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingStore {
  // ── State ──
  private readonly _bookings = signal<Booking[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ──
  readonly bookings = computed(() => this._bookings());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Updaters ──
  setBookings(bookings: Booking[]) {
    this._bookings.set(bookings);
  }

  addBooking(booking: Booking) {
    this._bookings.update(bookings => [booking, ...bookings]);
  }

  updateBooking(updatedBooking: Booking) {
    this._bookings.update(bookings => bookings.map(b => b._id === updatedBooking._id ? updatedBooking : b));
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
  }
}
