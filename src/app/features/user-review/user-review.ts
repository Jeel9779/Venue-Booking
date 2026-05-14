import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReviewService } from '../../core/services/review.service';
import { ReviewStore } from '../../core/store/review.store';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Chart } from '../../shared/components/chart/chart';

@Component({
  selector: 'app-user-review',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Button, Card, Chart],
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
  readonly chartData = this.store.ratingChartData;

  // ── Local UI State ──
  readonly searchTerm = this.store.searchTerm;
  showDeleteModal = signal(false);
  reviewToDelete = signal<string | null>(null);

  ngOnInit() {
    this.service.loadAll();
  }

  /**
   * Updates the search query in the store.
   */
  onSearch(query: string) {
    this.store.searchTerm.set(query);
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
   * Action: Open delete confirmation modal.
   */
  confirmDelete(id: string) {
    this.reviewToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  /**
   * Action: Finalize deletion.
   */
  executeDelete() {
    const id = this.reviewToDelete();
    if (id) {
      this.service.deleteReview(id);
      this.closeDeleteModal();
    }
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.reviewToDelete.set(null);
  }

  /**
   * Utility: Generates an array for star rendering.
   */
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
