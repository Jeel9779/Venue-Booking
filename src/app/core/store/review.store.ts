import { Injectable, signal, computed } from '@angular/core';
import { Review, ReviewStats } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewStore {
  // ── State (Signals) ──
  readonly reviews = signal<Review[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filterStatus = signal<string>('all');

  // ── Derived State (Computed Signals) ──
  /**
   * Filters the reviews based on the current selection (all, pending, approved, rejected).
   */
  readonly filteredReviews = computed(() => {
    const status = this.filterStatus();
    const allReviews = this.reviews();
    if (status === 'all') return allReviews;
    return allReviews.filter(r => r.status === status);
  });

  /**
   * Calculates real-time statistics for the moderation dashboard.
   */
  readonly stats = computed((): ReviewStats => {
    const all = this.reviews();
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      averageRating: all.length > 0 
        ? Number((all.reduce((acc, r) => acc + r.rating, 0) / all.length).toFixed(1))
        : 0
    };
  });

  // ── State Actions ──
  setReviews(reviews: Review[]) {
    this.reviews.set(reviews);
    this.isLoading.set(false);
  }

  updateReview(updated: Review) {
    this.reviews.update(items => items.map(i => i._id === updated._id ? updated : i));
  }

  removeReview(id: string) {
    this.reviews.update(items => items.filter(i => i._id !== id));
  }

  setError(message: string | null) {
    this.error.set(message);
    this.isLoading.set(false);
  }
}
