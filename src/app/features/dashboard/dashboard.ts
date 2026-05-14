import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { VenueStore } from '@core/store/venue.store';
import { ReviewStore } from '@core/store/review.store';
import { BookingStore } from '@core/store/booking.store';
import { SubscriptionStore } from '@core/store/subscription.store';
import { VendorStore } from '@core/store/vendor.store';
import { VenueService } from '@core/services/venue.service';
import { ReviewService } from '@core/services/review.service';
import { BookingService } from '@core/services/booking.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { VendorService } from '@core/services/vendor.service';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { Chart } from '@shared/components/chart/chart';
import { DonutChart } from '@shared/components/donut-chart/donut-chart';
import { VenueList } from '@shared/components/venue-list/venue-list';
import { InsightCard } from '@shared/components/insight-card/insight-card';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Admin Overview Dashboard
 * 
 * Aggregates high-level metrics across the entire platform.
 * It serves as a mission-control center for admins to monitor 
 * revenue, moderation queues, and operational velocity.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, StatCard, Chart, DonutChart, VenueList, InsightCard, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // ── Dependency Injection ──────────────────────────────────────────────────
  private readonly venueStore = inject(VenueStore);
  private readonly reviewStore = inject(ReviewStore);
  private readonly bookingStore = inject(BookingStore);
  private readonly subStore = inject(SubscriptionStore);
  private readonly vendorStore = inject(VendorStore);

  private readonly venueService = inject(VenueService);
  private readonly reviewService = inject(ReviewService);
  private readonly bookingService = inject(BookingService);
  private readonly subService = inject(SubscriptionService);
  private readonly vendorService = inject(VendorService);

  // ── Aggregated Stats (Real Data) ─────────────────────────────────────────
  /** 
   * Transforms raw store data into displayable KPI cards.
   * Uses Signal computed logic for automatic UI refreshes.
   */
  readonly stats = computed(() => {
    const venues = this.venueStore.venues();
    const reviews = this.reviewStore.reviews();
    const bookings = this.bookingStore.bookings();
    const subSummary = this.subStore.summary();

    return [
      { 
        title: 'Net Revenue', 
        value: `₹${(subSummary?.revenue || 0).toLocaleString()}`, 
        change: '+8.2%', 
        color: 'indigo',
        icon: 'indian-rupee' 
      },
      { 
        title: 'Active Venues', 
        value: venues.filter(v => v.status === 'approved').length, 
        change: 'Stable', 
        color: 'emerald',
        icon: 'building-2' 
      },
      { 
        title: 'Pending Reviews', 
        value: reviews.filter(r => r.status === 'pending').length, 
        change: reviews.filter(r => r.status === 'pending').length > 5 ? 'Action Req.' : 'Low', 
        color: 'amber',
        icon: 'message-square' 
      },
      { 
        title: 'Total Bookings', 
        value: bookings.length, 
        change: '+12.5%', 
        color: 'blue',
        icon: 'calendar-check' 
      },
    ];
  });

  /** Latest venues for the 'Recent Activity' section */
  readonly recentVenues = computed(() => {
    return this.venueStore.venues().slice(0, 5);
  });

  /** Revenue distribution for the Donut Chart */
  readonly revenueDistribution = computed(() => {
    const subs = this.subStore.allSubscriptions();
    // Simplified logic for donut: active vs grace vs expired
    const active = subs.filter(s => s.status === 'active').length;
    const grace = subs.filter(s => s.status === 'grace').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    return [active, grace, expired];
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  /**
   * Triggers a multi-stream refresh.
   * Production Rule: Initializing the dashboard should sync all relevant stores.
   */
  ngOnInit() {
    this.venueService.loadAll();
    this.reviewService.loadAll();
    this.bookingService.loadAll();
    this.subService.loadAllSubscriptions();
    this.vendorService.loadAll();
  }
}