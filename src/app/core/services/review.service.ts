// Purpose: Service: Handles business logic and API communication for review.
import { Injectable, inject } from '@angular/core';
import { ReviewApi } from '../api/review-api';
import { ReviewStore } from '../store/review.store';
import { tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
export class ReviewService {
  private readonly api = inject(ReviewApi);
  private readonly store = inject(ReviewStore);

  /**
   * Syncs the moderation queue from the backend (Paginated).
   */
  loadAll(page: number = 1, limit: number = 10, search: string = '', status: string = 'all') {
    this.store.isLoading.set(true);
    return this.api.getAll(page, limit, search, status).pipe(
      tap(res => {
        const reviews = Array.isArray(res) ? res : (res.data || []);
        this.store.setReviews(reviews);
        
        // Handle pagination state
        if (!Array.isArray(res)) {
          this.store.setPagination({
            page: res.page || page,
            limit: res.limit || limit,
            totalRecords: res.totalRecords || reviews.length,
            totalPages: res.totalPages || Math.max(1, Math.ceil((res.totalRecords || reviews.length) / (res.limit || limit)))
          });
        } else {
          this.store.setPagination({
            page, limit, totalRecords: reviews.length, totalPages: Math.max(1, Math.ceil(reviews.length / limit))
          });
        }
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
  approveReview(venueId: string, reviewId: string) {
    const originalReview = this.store.reviews().find(r => r._id === reviewId);
    const originalStatus = originalReview ? originalReview.status : 'pending';

    // Optimistic Update: instantly set status to approved in the UI
    this.store.updateReview({ _id: reviewId, status: 'approved' });

    return this.api.approve(venueId, reviewId).pipe(
      tap(res => {
        // Handle wrapped backend response { message: string, review: Review }
        const review = (res as any)?.review || res;
        if (review && review._id && review.status) {
          // Only update status to avoid overwriting populated fields (like userId.name) with unpopulated strings from backend
          this.store.updateReview({ _id: reviewId, status: review.status });
        }
      }),
      catchError(err => {
        console.error('Approval failed:', err);
        // Rollback to original status on failure
        this.store.updateReview({ _id: reviewId, status: originalStatus });
        this.store.setError('Failed to approve review.');
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Rejects a review and updates the local state.
   */
  rejectReview(venueId: string, reviewId: string) {
    const originalReview = this.store.reviews().find(r => r._id === reviewId);
    const originalStatus = originalReview ? originalReview.status : 'pending';

    // Optimistic Update: instantly set status to rejected in the UI
    this.store.updateReview({ _id: reviewId, status: 'rejected' });

    return this.api.reject(venueId, reviewId).pipe(
      tap(res => {
        // Handle wrapped backend response { message: string, review: Review }
        const review = (res as any)?.review || res;
        if (review && review._id && review.status) {
          // Only update status to avoid overwriting populated fields
          this.store.updateReview({ _id: reviewId, status: review.status });
        }
      }),
      catchError(err => {
        console.error('Rejection failed:', err);
        // Rollback to original status on failure
        this.store.updateReview({ _id: reviewId, status: originalStatus });
        this.store.setError('Failed to reject review.');
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Permanently deletes a review from the system.
   */
  deleteReview(venueId: string, reviewId: string) {
    const originalReview = this.store.reviews().find(r => r._id === reviewId);

    // Optimistic Update: instantly remove from the UI list
    this.store.removeReview(reviewId);

    return this.api.delete(venueId, reviewId).pipe(
      catchError(err => {
        console.error('Deletion failed:', err);
        // Rollback on failure: add the original review back to the list
        if (originalReview) {
          this.store.reviews.update(items => [...items, originalReview]);
        }
        this.store.setError('Failed to delete review.');
        return of(null);
      })
    ).subscribe();
  }
}
