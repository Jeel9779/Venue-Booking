import { Injectable, signal, computed } from '@angular/core';
import { Review, ReviewStats } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewStore {
  // ── State (Signals) ──
  readonly reviews = signal<Review[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filterStatus = signal<string>('all');
  readonly searchTerm = signal<string>('');

  // ── Derived State (Computed Signals) ──
  /**
   * Filters and searches the reviews based on the current selection and query.
   */
  readonly filteredReviews = computed(() => {
    const status = this.filterStatus();
    const query = this.searchTerm().toLowerCase().trim();
    const allReviews = this.reviews();
    
    let filtered = allReviews;

    // 1. Status Filter
    if (status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }

    // 2. Multi-field Search
    if (query) {
      filtered = filtered.filter(r => 
        r.userId.name.toLowerCase().includes(query) ||
        r.userId.email.toLowerCase().includes(query) ||
        r.venueId.name.toLowerCase().includes(query) ||
        (r.feedback && r.feedback.toLowerCase().includes(query)) ||
        r.rating.toString().includes(query) ||
        r.status.toLowerCase().includes(query)
      );
    }

    return filtered;
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

  updateReview(updated: any) {
    this.reviews.update(items => items.map(i => {
      if (i._id === updated._id) {
        // Create a copy of the existing item and only update fields that are provided in 'updated'
        // This preserves populated objects (userId, venueId) if the update response only contains IDs
        const newItem = { ...i, ...updated };
        
        // If the update returned userId as a string but we have it as an object, preserve the object but update the ID
        if (typeof updated.userId === 'string' && typeof i.userId === 'object') {
          newItem.userId = { ...i.userId, _id: updated.userId };
        }
        if (typeof updated.venueId === 'string' && typeof i.venueId === 'object') {
          newItem.venueId = { ...i.venueId, _id: updated.venueId };
        }
        
        return newItem as Review;
      }
      return i;
    }));
  }

  removeReview(id: string) {
    this.reviews.update(items => items.filter(i => i._id !== id));
  }

  setError(message: string | null) {
    this.error.set(message);
    this.isLoading.set(false);
  }
}
