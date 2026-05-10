import { Injectable, inject } from '@angular/core';
import { ReviewApi } from '../api/review-api';
import { ReviewStore } from '../store/review.store';
import { tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ReviewApi);
  private readonly store = inject(ReviewStore);

  /**
   * Syncs the entire moderation queue from the backend.
   */
  loadAll() {
    this.store.isLoading.set(true);
    return this.api.getAll().pipe(
      tap(reviews => {
        this.store.setReviews(reviews);
        this.store.setError(null);
      }),
      catchError(err => {
        this.store.setError('Server connectivity issue. Failed to sync reviews.');
        return of([]);
      }),
      finalize(() => this.store.isLoading.set(false))
    ).subscribe();
  }

  /**
   * Approves a review and updates the local state.
   */
  approveReview(id: string) {
    return this.api.approve(id).pipe(
      tap(updated => this.store.updateReview(updated)),
      catchError(err => {
        console.error('Approval failed:', err);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Rejects a review and updates the local state.
   */
  rejectReview(id: string) {
    return this.api.reject(id).pipe(
      tap(updated => this.store.updateReview(updated)),
      catchError(err => {
        console.error('Rejection failed:', err);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Permanently deletes a review from the system.
   */
  deleteReview(id: string) {
    return this.api.delete(id).pipe(
      tap(() => this.store.removeReview(id)),
      catchError(err => {
        console.error('Deletion failed:', err);
        return of(null);
      })
    ).subscribe();
  }
}
