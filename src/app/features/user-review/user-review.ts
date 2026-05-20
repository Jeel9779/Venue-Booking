import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ReviewService } from '../../core/services/review.service';
import { ReviewStore } from '../../core/store/review.store';
import { Card } from '../../shared/components/card/card';
import { Chart } from '../../shared/components/chart/chart';
import { VenueApi } from '../../core/api/venue-api';
import { API_BASE_URL } from '../../core/config/api.config';
import { VenueService } from '../../core/services/venue.service';
import { VenueStore } from '../../core/store/venue.store';

@Component({
  selector: 'app-user-review',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Card, Chart],
  templateUrl: './user-review.html',
  styleUrl: './user-review.css'
})
export class UserReview implements OnInit {
  // ── Dependency Injection ──
  private readonly service = inject(ReviewService);
  readonly store = inject(ReviewStore);
  private readonly venueApi = inject(VenueApi);
  private readonly venueService = inject(VenueService);
  private readonly venueStore = inject(VenueStore);

  // ── Reactive Properties (Exposing Store Signals) ──
  readonly reviews = this.store.filteredReviews;
  readonly stats = this.store.stats;
  readonly isLoading = this.store.isLoading;
  readonly currentFilter = this.store.filterStatus;
  readonly error = this.store.error;
  readonly chartData = this.store.ratingChartData;
  readonly apiBaseUrl = API_BASE_URL;

  // ── Local UI State ──
  readonly searchTerm = this.store.searchTerm;
  showDeleteModal = signal(false);
  reviewToDelete = signal<any | null>(null);

  // ── Venue Details Modal State ──
  showVenueModal = signal(false);
  isLoadingVenue = signal(false);
  selectedVenue = signal<any | null>(null);
  activeImageIndex = signal(0);

  ngOnInit() {
    this.service.loadAll();
    this.venueService.loadAll(); // Instant local cache synchronization!
  }

  /**
   * Action: Open venue details and load full attributes.
   */
  openVenueDetails(venue: any) {
    if (!venue) return;

    // Support both populated object and raw string ID!
    const id = typeof venue === 'object' ? venue._id : venue;
    if (!id) return;

    this.activeImageIndex.set(0); // Reset slider to first image!

    this.showVenueModal.set(true);

    // 1. Instant Cache Lookup (Zero network latency!)
    const cachedVenue = this.venueStore.venues().find(v => v._id === id);
    if (cachedVenue) {
      this.selectedVenue.set(cachedVenue);
      this.isLoadingVenue.set(false);
      return;
    }

    // 2. Network Fallback
    this.isLoadingVenue.set(true);
    this.venueApi.getById(id).subscribe({
      next: (fullVenue) => {
        this.selectedVenue.set(fullVenue);
        this.isLoadingVenue.set(false);
      },
      error: (err) => {
        console.error('Failed to load venue details', err);
        // Fallback to basic object on failure
        this.selectedVenue.set(typeof venue === 'object' ? venue : { _id: id, name: 'Venue Details' });
        this.isLoadingVenue.set(false);
      }
    });
  }

  closeVenueModal() {
    this.showVenueModal.set(false);
    this.selectedVenue.set(null);
  }

  prevImage(total: number) {
    this.activeImageIndex.update(idx => (idx === 0 ? total - 1 : idx - 1));
  }

  nextImage(total: number) {
    this.activeImageIndex.update(idx => (idx === total - 1 ? 0 : idx + 1));
  }

  setActiveImage(idx: number) {
    this.activeImageIndex.set(idx);
  }

  /**
   * Sanitizes and constructs the full image URL.
   */
  getImageUrl(img?: string): string {
    if (!img) return '';
    let url = img.replace(/\\/g, '/'); // Fix Windows paths
    if (url.startsWith('http')) return url;
    return this.apiBaseUrl + '/' + url.replace(/^\/+/, '');
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
  approve(review: any) {
    const venueId = typeof review.venueId === 'object' ? review.venueId?._id : review.venueId;
    this.service.approveReview(venueId, review._id);
  }

  /**
   * Action: Reject a review.
   */
  reject(review: any) {
    const venueId = typeof review.venueId === 'object' ? review.venueId?._id : review.venueId;
    this.service.rejectReview(venueId, review._id);
  }

  /**
   * Action: Open delete confirmation modal.
   */
  confirmDelete(review: any) {
    this.reviewToDelete.set(review);
    this.showDeleteModal.set(true);
  }

  /**
   * Action: Finalize deletion.
   */
  executeDelete() {
    const review = this.reviewToDelete();
    if (review) {
      const venueId = typeof review.venueId === 'object' ? review.venueId?._id : review.venueId;
      this.service.deleteReview(venueId, review._id);
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
