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
  private readonly state$ = new BehaviorSubject<VenueState>(initialState);

  // Expose observables
  readonly stateView$ = this.state$.asObservable();
  
  readonly venues$ = this.stateView$.pipe(map(s => s.venues));
  readonly isLoading$ = this.stateView$.pipe(map(s => s.isLoading));
  readonly error$ = this.stateView$.pipe(map(s => s.error));

  // Selectors
  get snapshot(): VenueState {
    return this.state$.getValue();
  }

  // State Mutations
  setVenues(venues: Venue[]): void {
    this.state$.next({
      ...this.snapshot,
      venues,
      isLoading: false,
      error: null,
    });
  }

  setLoading(isLoading: boolean): void {
    this.state$.next({
      ...this.snapshot,
      isLoading,
    });
  }

  setError(error: string | null): void {
    this.state$.next({
      ...this.snapshot,
      error,
      isLoading: false,
    });
  }

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
