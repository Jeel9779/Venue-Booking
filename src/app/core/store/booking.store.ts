// Purpose: Store: Manages global/local state and reactivity for booking.
import { Injectable, signal, computed } from '@angular/core';
import { Booking, BookingState } from '../models/booking.model';
import { initialPagination, Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class BookingStore {
  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _state = signal<BookingState>({
    bookings: [],
    pagination: initialPagination,
    isLoading: false,
    error: null,
  });

  // ── Selectors ──────────────────────────────────────────────────────────────
  readonly bookings = computed(() => this._state().bookings);
  readonly pagination = computed(() => this._state().pagination);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // ── Actions ────────────────────────────────────────────────────────────────
  setBookings(bookings: Booking[]): void {
    this._state.update((s) => ({ ...s, bookings, isLoading: false, error: null }));
  }

  setPagination(pagination: Pagination): void {
    this._state.update((s) => ({ ...s, pagination }));
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
