import { Injectable, signal, computed } from '@angular/core';
import { Review, ReviewStats } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewStore {
  // ── State (Signals) ──
  /** The full list of reviews fetched from the server. */
  readonly reviews = signal<Review[]>([]);
  /** Loading indicator for API operations. */
  readonly isLoading = signal<boolean>(false);
  /** Global error message for the review feature. */
  readonly error = signal<string | null>(null);
  /** Current active filter status (all, pending, approved, rejected). */
  readonly filterStatus = signal<string>('all');
  /** Current search query string. */
  readonly searchTerm = signal<string>('');

  // ── Derived State (Computed Signals) ──
  /**
   * Reactive selector that filters and searches the reviews.
   * Order of operation: 
   * 1. Status Filter (Primary)
   * 2. Multi-field Search (Secondary) - Matches name, email, venue, feedback, rating, or status.
   */
  readonly filteredReviews = computed(() => {
    const status = this.filterStatus();
    const query = this.searchTerm().toLowerCase().trim();
    const allReviews = this.reviews();
    
    let filtered = allReviews;

    // 1. Status Filter
    if (status !== 'all') {
      filtered = filtered.filter(r => r && r.status === status);
    }

    // 2. Multi-field Search
    if (query) {
      filtered = filtered.filter(r => {
        if (!r) return false;
        
        const userName = r.userId && typeof r.userId === 'object' ? (r.userId.name || '') : '';
        const userEmail = r.userId && typeof r.userId === 'object' ? (r.userId.email || '') : '';
        const venueName = r.venueName || (r.venueId && typeof r.venueId === 'object' ? (r.venueId.name || '') : '');
        const feedback = r.feedback || '';
        const rating = r.rating ? r.rating.toString() : '';
        const statusStr = r.status || '';

        return userName.toLowerCase().includes(query) ||
               userEmail.toLowerCase().includes(query) ||
               venueName.toLowerCase().includes(query) ||
               feedback.toLowerCase().includes(query) ||
               rating.includes(query) ||
               statusStr.toLowerCase().includes(query);
      });
    }

    return filtered;
  });

  /**
   * Calculates real-time statistics for the moderation dashboard.
   */
  readonly stats = computed((): ReviewStats => {
    return this.calculateAdminStats(this.reviews());
  });

  /**
   * Expert calculation logic to process a flat array of reviews.
   * Treat every approved review as an individual data point for global analytics.
   */
  private calculateAdminStats(reviews: Review[]): ReviewStats {
    const totalReviews = reviews.length;
    const awaitingReview = reviews.filter(r => r.status === 'pending').length;
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    const approvedContent = approvedReviews.length;

    // Live Avg Score: Sum of ratings / Total count ONLY for approved reviews
    const totalApprovedRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    const liveAvgScore = approvedContent > 0 
      ? Number((totalApprovedRating / approvedContent).toFixed(1))
      : 0;

    // Distribution breakdown for 1-5 stars
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[Math.floor(r.rating)]++;
      }
    });

    return {
      totalReviews,
      awaitingReview,
      approvedContent,
      liveAvgScore,
      distribution
    };
  }

  /**
   * Provides raw counts for the rating distribution.
   * The Chart component will handle scaling and visualization.
   */
  readonly ratingChartData = computed(() => {
    const dist = this.stats().distribution;
    return [dist[1], dist[2], dist[3], dist[4], dist[5]];
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
