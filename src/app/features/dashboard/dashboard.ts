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
        change: 'Real-time', 
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
        change: 'All Time', 
        color: 'blue',
        icon: 'calendar-check' 
      },
    ];
  });

  /** Booking volume for the last 7 days */
  readonly bookingTrend = computed(() => {
    const bookings = this.bookingStore.bookings();
    const today = new Date();
    const labels = [];
    const data = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const count = bookings.filter(b => {
        const bDate = new Date(b.createdAt || b.date);
        return bDate.getDate() === d.getDate() && bDate.getMonth() === d.getMonth();
      }).length;
      data.push(count);
    }
    
    return { labels, data };
  });

  /** Actionable Insights */
  readonly actionableInsights = computed(() => {
    const pendingVenues = this.venueStore.venues().filter(v => v.status === 'pending').length;
    const pendingReviews = this.reviewStore.reviews().filter(r => r.status === 'pending').length;
    const graceSubs = this.subStore.allSubscriptions().filter(s => s.status === 'grace').length;

    return [
      { message: `${pendingVenues} venues await approval`, priority: pendingVenues > 0 ? 'high' : 'low' },
      { message: `${pendingReviews} flagged reviews need moderation`, priority: pendingReviews > 0 ? 'medium' : 'low' },
      { message: `${graceSubs} vendors are in payment grace period`, priority: 'medium' }
    ];
  });

  /** Latest venues for the 'Recent Activity' section with mapped images and stats */
  readonly recentVenues = computed(() => {
    const venues = this.venueStore.venues().slice(0, 5);
    const bookings = this.bookingStore.bookings();

    return venues.map(v => {
      // Find bookings for this venue
      const venueBookings = bookings.filter(b => {
        const bVenueId = typeof b.venueId === 'object' ? (b.venueId as any)._id : b.venueId;
        return bVenueId === v._id;
      });

      const revenue = venueBookings.reduce((sum, b) => sum + (b.totalBookingAmount || 0), 0);

      // Handle Windows backslashes and build absolute URL
      let imgUrl = v.mediaFiles && v.mediaFiles.length > 0 ? v.mediaFiles[0] : '';
      if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = imgUrl.replace(/\\/g, '/');
        imgUrl = `http://192.168.1.12:3000/${imgUrl.replace(/^\/+/, '')}`;
      }

      return {
        ...v,
        img: imgUrl || '',
        bookings: venueBookings.length,
        revenue: revenue
      };
    });
  });

  /** Revenue distribution for the Donut Chart */
  readonly revenueDistribution = computed(() => {
    const subs = this.subStore.allSubscriptions();
    
    let activeRev = 0;
    let graceRev = 0;
    
    subs.forEach(s => {
      const price = s.planSnapshot?.price || 0;
      if (s.status === 'active') activeRev += price;
      if (s.status === 'grace') graceRev += price;
    });

    const total = activeRev + graceRev;
    
    return {
      activeAmount: activeRev,
      graceAmount: graceRev,
      totalAmount: total
    };
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