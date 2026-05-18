import { Injectable, signal, computed } from '@angular/core';
import { Venue } from '../models/venue.model';
import { initialPagination, Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class VenueStore {
  // ── State (Signals) ────────────────────────────────────────────────────────
  private readonly _venues = signal<Venue[]>([]);
  private readonly _pagination = signal<Pagination>(initialPagination);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ───────────────────────────────────────────────────
  readonly venues = computed(() => this._venues());
  readonly pagination = computed(() => this._pagination());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Actions ────────────────────────────────────────────────────────────────
  /** Updates the venue list and resets loading/error states. */
  setVenues(venues: Venue[]): void {
    this._venues.set(venues);
    this._isLoading.set(false);
    this._error.set(null);
  }

  setPagination(pagination: Pagination): void {
    this._pagination.set(pagination);
  }

  /** Sets the global loading state. */
  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  /** Updates the error message and stops loading. */
  setError(error: string | null): void {
    this._error.set(error);
    this._isLoading.set(false);
  }

  /** Updates a single venue in the list. */
  updateVenue(updatedVenue: Venue): void {
    this._venues.update((venues) =>
      venues.map((v) => (v._id === updatedVenue._id ? updatedVenue : v))
    );
  }
}
