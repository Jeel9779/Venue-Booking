import { Injectable, signal, computed } from '@angular/core';
import { Booking, BookingState } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingStore {
  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _state = signal<BookingState>({
    bookings: [],
    isLoading: false,
    error: null,
  });

  // ── Selectors ──────────────────────────────────────────────────────────────
  readonly bookings = computed(() => this._state().bookings);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // ── Actions ────────────────────────────────────────────────────────────────
  setBookings(bookings: Booking[]): void {
    this._state.update((s) => ({ ...s, bookings, isLoading: false, error: null }));
  }

  setLoading(isLoading: boolean): void {
    this._state.update((s) => ({ ...s, isLoading }));
  }

  setError(error: string | null): void {
    this._state.update((s) => ({ ...s, error, isLoading: false }));
  }

  // ⚡ OPTIMISTIC UPDATE: Instant UI change
  optimisticUpdate(id: string, changes: Partial<Booking>): void {
    this._state.update((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b._id === id ? { ...b, ...changes } : b)),
    }));
  }

  updateBooking(updatedBooking: Booking): void {
    this._state.update((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b._id === updatedBooking._id ? updatedBooking : b)),
    }));
  }

  removeBooking(id: string): void {
    this._state.update((s) => ({
      ...s,
      bookings: s.bookings.filter((b) => b._id !== id),
    }));
  }
}
