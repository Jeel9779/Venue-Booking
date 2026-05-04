import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Venue } from '../models/venue.model';


interface VenueState {
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VenueState = {
  venues: [],
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class VenueStore {
  /** Main state stream using BehaviorSubject */
  private readonly state$ = new BehaviorSubject<VenueState>(initialState);

  /** Expose the state as a read-only Observable */
  readonly stateView$ = this.state$.asObservable();

  /** Slice-level observables for targeted UI updates .. RxJS map operator */
  readonly venues$ = this.stateView$.pipe(map(s => s.venues));
  readonly isLoading$ = this.stateView$.pipe(map(s => s.isLoading));
  readonly error$ = this.stateView$.pipe(map(s => s.error));

  /** 
   * Returns the current value of the state without subscribing.
   */
  get snapshot(): VenueState {
    return this.state$.getValue();
  }

  // ── State Mutations (Setters) ─────────────────────────────────────────────
  /** 
   * Updates the venue list and resets loading/error states.
   */
  setVenues(venues: Venue[]): void {
    this.state$.next({
      ...this.snapshot,
      venues,
      isLoading: false,
      error: null,
    });
  }

  /** 
   * Sets the global loading state.
   */
  setLoading(isLoading: boolean): void {
    this.state$.next({
      ...this.snapshot,
      isLoading,
    });
  }

  /** 
   * Updates the error message and stops loading.
   */
  setError(error: string | null): void {
    this.state$.next({
      ...this.snapshot,
      error,
      isLoading: false,
    });
  }

  /** 
   * Updates a single venue in the list (e.g., after an Approve/Reject action).
   */
  updateVenue(updatedVenue: Venue): void {
    const venues = this.snapshot.venues.map((v) =>
      v._id === updatedVenue._id ? updatedVenue : v
    );
    this.state$.next({
      ...this.snapshot,
      venues,
    });
  }
}
