import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReviewService } from '../../core/services/review.service';
import { ReviewStore } from '../../core/store/review.store';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';

@Component({
  selector: 'app-user-review',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Button, Card],
  templateUrl: './user-review.html',
  styleUrl: './user-review.css'
})
export class UserReview implements OnInit {
  // ── Dependency Injection ──
  private readonly service = inject(ReviewService);
  readonly store = inject(ReviewStore);

  // ── Reactive Properties (Exposing Store Signals) ──
  readonly reviews = this.store.filteredReviews;
  readonly stats = this.store.stats;
  readonly isLoading = this.store.isLoading;
  readonly currentFilter = this.store.filterStatus;
  readonly error = this.store.error;

  ngOnInit() {
    this.service.loadAll();
  }

  /**
   * Updates the UI filter state.
   */
  setFilter(status: string) {
    this.store.filterStatus.set(status);
  }

  /**
   * Action: Approve a review.
   */
  approve(id: string) {
    this.service.approveReview(id);
  }

  /**
   * Action: Reject a review.
   */
  reject(id: string) {
    this.service.rejectReview(id);
  }

  /**
   * Action: Delete a review with confirmation.
   */
  delete(id: string) {
    if (confirm('Are you sure you want to permanently delete this review? This action cannot be undone.')) {
      this.service.deleteReview(id);
    }
  }

  /**
   * Utility: Generates an array for star rendering.
   */
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
