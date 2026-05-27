// Purpose: Component/Logic: Handles UI behavior and user interactions for dashboard.
import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { VenueStore } from '@core/store/venue.store';
import { API_BASE_URL } from '@core/config/api.config';
import { ReviewStore } from '@core/store/review.store';
import { BookingStore } from '@core/store/booking.store';
import { SubscriptionStore } from '@core/store/subscription.store';
import { VendorStore } from '@core/store/vendor.store';
import { UsersStore } from '@core/store/users.store';
import { PaymentStore } from '@core/store/payment.store';

import { VenueService } from '@core/services/venue.service';
import { ReviewService } from '@core/services/review.service';
import { BookingService } from '@core/services/booking.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { VendorService } from '@core/services/vendor.service';
import { UserService } from '@core/services/user.service';
import { PaymentService } from '@core/services/payment.service';

import { LucideAngularModule } from 'lucide-angular';

/**
 * Modern High-Fidelity Admin Overview Dashboard
 * 
 * Answers key platform metrics:
 * - Are bookings increasing?
 * - Which vendors perform best?
 * - Which subscriptions earn most?
 * - Any pending approvals?
 * - Any payment issues?
 * - Which city grows fastest?
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
// Defines the structure and behavior of this class
export class Dashboard implements OnInit, OnDestroy {
  // ── Dependency Injection ──────────────────────────────────────────────────
  readonly venueStore = inject(VenueStore);
  readonly reviewStore = inject(ReviewStore);
  readonly bookingStore = inject(BookingStore);
  readonly subStore = inject(SubscriptionStore);
  readonly vendorStore = inject(VendorStore);
  readonly usersStore = inject(UsersStore);
  readonly paymentStore = inject(PaymentStore);

  private readonly venueService = inject(VenueService);
  private readonly reviewService = inject(ReviewService);
  private readonly bookingService = inject(BookingService);
  private readonly subService = inject(SubscriptionService);
  private readonly vendorService = inject(VendorService);
  private readonly userService = inject(UserService);
  private readonly paymentService = inject(PaymentService);

  // ── Reactive Observables to Signals mapping ──────────────────────────────
  readonly users = toSignal(this.usersStore.users$, { initialValue: [] });
  readonly payments = toSignal(this.paymentStore.payments$, { initialValue: [] });
  readonly usersLoading = toSignal(this.usersStore.isLoading$, { initialValue: false });
  readonly paymentsLoading = toSignal(this.paymentStore.isLoading$, { initialValue: false });

  // ── Live Activity Ticker State ──────────────────────────────────────────
  readonly liveActivities = signal<Array<{ id: number; text: string; time: string; type: 'booking' | 'vendor' | 'user' | 'review' | 'payment' }>>([]);
  private activityIntervalId: any;

  // ── Combined Dashboard Loading State ─────────────────────────────────────
  readonly isDashboardLoading = computed(() => {
    return this.venueStore.isLoading() || 
           this.reviewStore.isLoading() || 
           this.bookingStore.isLoading() || 
           this.subStore.isLoading() || 
           this.vendorStore.isLoading() || 
           this.usersLoading() || 
           this.paymentsLoading();
  });

  // ── Key Performance Indicators (KPIs) ────────────────────────────────────
  readonly newStats = computed(() => {
    const usersCount = this.users().length;
    const vendorsCount = this.vendorStore.vendors().length;
    
    const subs = this.subStore.allSubscriptions();
    const activeSubs = subs.filter(s => s.status === 'active').length;
    
    const venues = this.venueStore.venues();
    const bookings = this.bookingStore.bookings();
    
    const bookingRevenue = bookings.filter(b => b.paymentStatus === 'success').reduce((sum, b) => sum + (b.totalBookingAmount || b.cost || 0), 0);
    const subRevenue = subs.filter(s => s.status === 'active' || s.status === 'grace').reduce((sum, s) => sum + (s.planSnapshot?.price || 0), 0);
    const totalRevenue = bookingRevenue + subRevenue;

    const pendingVenues = venues.filter(v => v.status === 'pending').length;
    const pendingVendors = this.vendorStore.vendors().filter(v => v.status === 'pending').length;
    const pendingApprovals = pendingVenues + pendingVendors;

    const cancelledBookings = bookings.filter(b => b.status === 'cancelled' || b.paymentStatus === 'failed').length;

    return [
      { 
        title: 'Total Users', 
        value: usersCount, 
        icon: 'users', 
        change: 'Registered',
        iconClass: 'bg-blue-50 text-blue-600 border border-blue-100', 
        accentClass: 'border-l-4 border-l-blue-500',
        progressClass: 'bg-blue-500',
        isLoading: this.usersLoading()
      },
      { 
        title: 'Total Vendors', 
        value: vendorsCount, 
        icon: 'briefcase', 
        change: 'Partners',
        iconClass: 'bg-indigo-50 text-indigo-600 border border-indigo-100', 
        accentClass: 'border-l-4 border-l-indigo-500',
        progressClass: 'bg-indigo-500',
        isLoading: this.vendorStore.isLoading()
      },
      { 
        title: 'Active Subs', 
        value: activeSubs, 
        icon: 'zap', 
        change: 'Paid plans',
        iconClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100', 
        accentClass: 'border-l-4 border-l-emerald-500',
        progressClass: 'bg-emerald-500',
        isLoading: this.subStore.isLoading()
      },
      { 
        title: 'Total Venues', 
        value: venues.length, 
        icon: 'building-2', 
        change: 'Listed',
        iconClass: 'bg-purple-50 text-purple-600 border border-purple-100', 
        accentClass: 'border-l-4 border-l-purple-500',
        progressClass: 'bg-purple-500',
        isLoading: this.venueStore.isLoading()
      },
      { 
        title: 'Total Bookings', 
        value: bookings.length, 
        icon: 'calendar-check', 
        change: 'Total Orders',
        iconClass: 'bg-orange-50 text-orange-600 border border-orange-100', 
        accentClass: 'border-l-4 border-l-orange-500',
        progressClass: 'bg-orange-500',
        isLoading: this.bookingStore.isLoading()
      },
      { 
        title: 'Total Revenue', 
        value: `₹${totalRevenue.toLocaleString()}`, 
        icon: 'indian-rupee', 
        change: 'Platform Earn',
        iconClass: 'bg-green-50 text-green-600 border border-green-100', 
        accentClass: 'border-l-4 border-l-green-500',
        progressClass: 'bg-green-500',
        isLoading: this.bookingStore.isLoading() || this.subStore.isLoading()
      },
      { 
        title: 'Pending Approvals', 
        value: pendingApprovals, 
        icon: 'clock', 
        change: 'Action Required',
        iconClass: 'bg-amber-50 text-amber-600 border border-amber-100', 
        accentClass: 'border-l-4 border-l-amber-500',
        progressClass: 'bg-amber-500',
        isLoading: this.venueStore.isLoading() || this.vendorStore.isLoading()
      },
      { 
        title: 'Cancelled Bookings', 
        value: cancelledBookings, 
        icon: 'calendar-x', 
        change: 'Failed / Cancelled',
        iconClass: 'bg-rose-50 text-rose-600 border border-rose-100', 
        accentClass: 'border-l-4 border-l-rose-500',
        progressClass: 'bg-rose-500',
        isLoading: this.bookingStore.isLoading()
      },
    ];
  });

  // ── Are Bookings Increasing? ─────────────────────────────────────────────
  readonly bookingVelocity = computed(() => {
    const bookings = this.bookingStore.bookings();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = bookings.filter(b => {
      const d = new Date(b.createdAt || b.date);
      return d >= oneWeekAgo && d <= now;
    }).length;

    const lastWeek = bookings.filter(b => {
      const d = new Date(b.createdAt || b.date);
      return d >= twoWeeksAgo && d < oneWeekAgo;
    }).length;

    const changePercent = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    return {
      thisWeek,
      lastWeek,
      changePercent,
      isIncreasing: thisWeek >= lastWeek
    };
  });

  // ── Which Vendors Perform Best? ──────────────────────────────────────────
  readonly topVendors = computed(() => {
    const bookings = this.bookingStore.bookings();
    const vendorStats = new Map<string, { count: number; revenue: number; name: string; email: string }>();

    bookings.forEach(b => {
      if (!b.vendorId) return;
      const vId = typeof b.vendorId === 'object' ? b.vendorId._id : b.vendorId;
      const vName = typeof b.vendorId === 'object' ? b.vendorId.businessName || b.vendorId.fullName : 'Unknown Vendor';
      const vEmail = typeof b.vendorId === 'object' ? b.vendorId.email : '';
      const amount = b.totalBookingAmount || b.cost || 0;

      const current = vendorStats.get(vId) || { count: 0, revenue: 0, name: vName, email: vEmail };
      current.count += 1;
      if (b.paymentStatus === 'success') {
        current.revenue += amount;
      }
      vendorStats.set(vId, current);
    });

    return Array.from(vendorStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  });

  // ── Which Subscriptions Earn Most? ───────────────────────────────────────
  readonly topSubscriptions = computed(() => {
    const subs = this.subStore.allSubscriptions();
    const planStats = new Map<string, { count: number; totalEarned: number; price: number }>();

    subs.forEach(s => {
      if (!s.planSnapshot) return;
      const name = s.planSnapshot.name;
      const price = s.planSnapshot.price || 0;
      const current = planStats.get(name) || { count: 0, totalEarned: 0, price };
      if (s.status === 'active' || s.status === 'grace') {
        current.count += 1;
        current.totalEarned += price;
      }
      planStats.set(name, current);
    });

    return Array.from(planStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalEarned - a.totalEarned);
  });

  // ── Any Pending Approvals? ───────────────────────────────────────────────
  readonly pendingApprovalsList = computed(() => {
    const pendingVenues = this.venueStore.venues().filter(v => v.status === 'pending').map(v => ({
      id: v._id,
      type: 'venue' as const,
      name: v.name,
      subText: `Capacity: ${v.capacity} | Price: ₹${v.pricePerDay}`,
      date: v.createdAt || v.updatedAt || '',
    }));

    const pendingVendors = this.vendorStore.vendors().filter(v => v.status === 'pending').map(v => ({
      id: v._id,
      type: 'vendor' as const,
      name: v.businessName || v.fullName,
      subText: `Gov ID: ${v.governmentId || 'N/A'} | License: ${v.licenseDoc ? 'Attached' : 'N/A'}`,
      date: v.createdAt || v.updatedAt || '',
    }));

    return [...pendingVenues, ...pendingVendors].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // ── Any Payment Issues? ──────────────────────────────────────────────────
  readonly paymentIssues = computed(() => {
    const failedBookings = this.bookingStore.bookings().filter(b => b.paymentStatus === 'failed').map(b => ({
      id: b._id,
      type: 'booking' as const,
      description: `Booking payment failed for ${b.venueId?.name || 'Venue'}`,
      amount: b.totalBookingAmount || b.cost || 0,
      vendor: b.vendorId?.businessName || b.vendorId?.fullName || 'Vendor',
      date: b.createdAt || b.date,
    }));

    const graceSubscriptions = this.subStore.allSubscriptions().filter(s => s.status === 'grace').map(s => ({
      id: s._id,
      type: 'subscription' as const,
      description: `Grace period for Vendor: ${s.vendorId}`,
      amount: s.planSnapshot?.price || 0,
      vendor: `Plan: ${s.planSnapshot?.name || 'N/A'}`,
      date: s.graceEndDate || s.endDate || '',
    }));

    return [...failedBookings, ...graceSubscriptions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // ── Which City Grows Fastest? ────────────────────────────────────────────
  readonly cityGrowth = computed(() => {
    const bookings = this.bookingStore.bookings();
    const venues = this.venueStore.venues();

    const cityStats = new Map<string, { bookingsCount: number; venuesCount: number; revenue: number }>();

    venues.forEach(v => {
      if (!v.city) return;
      const city = v.city.trim().toLowerCase();
      const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
      const current = cityStats.get(capitalizedCity) || { bookingsCount: 0, venuesCount: 0, revenue: 0 };
      current.venuesCount += 1;
      cityStats.set(capitalizedCity, current);
    });

    bookings.forEach(b => {
      if (!b.venueId || !b.venueId.city) return;
      const city = b.venueId.city.trim().toLowerCase();
      const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
      const amount = b.totalBookingAmount || b.cost || 0;

      const current = cityStats.get(capitalizedCity) || { bookingsCount: 0, venuesCount: 0, revenue: 0 };
      current.bookingsCount += 1;
      if (b.paymentStatus === 'success') {
        current.revenue += amount;
      }
      cityStats.set(capitalizedCity, current);
    });

    return Array.from(cityStats.entries())
      .map(([cityName, stats]) => ({
        cityName,
        totalScore: stats.bookingsCount * 2 + stats.venuesCount,
        ...stats
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);
  });

  // ── Most Booked Days Chart Data ─────────────────────────────────────────
  readonly mostBookedDays = computed(() => {
    const bookings = this.bookingStore.bookings();
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    bookings.forEach(b => {
      const date = new Date(b.date);
      if (!isNaN(date.getTime())) {
        const day = date.getDay();
        dayCounts[day]++;
      }
    });

    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      labels,
      data: dayCounts,
      max: Math.max(...dayCounts, 1)
    };
  });

  // ── Peak Booking Hours Chart Data ────────────────────────────────────────
  readonly peakBookingHours = computed(() => {
    const bookings = this.bookingStore.bookings();
    const hours = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    bookings.forEach(b => {
      const date = new Date(b.createdAt || b.date);
      if (!isNaN(date.getTime())) {
        const hr = date.getHours();
        if (hr >= 6 && hr < 12) hours.morning++;
        else if (hr >= 12 && hr < 17) hours.afternoon++;
        else if (hr >= 17 && hr < 21) hours.evening++;
        else hours.night++;
      }
    });

    const labels = ['Morning (6AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Night (9PM-6AM)'];
    const data = [hours.morning, hours.afternoon, hours.evening, hours.night];
    return {
      labels,
      data,
      max: Math.max(...data, 1)
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.venueService.loadAll(1, 1000);
    this.reviewService.loadAll();
    this.bookingService.loadAll(1, 1000);
    this.subService.loadAllSubscriptions();
    this.vendorService.loadAll(1, 1000);
    this.userService.loadAll(1, 1000);
    this.paymentService.loadInitialData();

    this.initLiveActivities();
  }

  ngOnDestroy() {
    if (this.activityIntervalId) {
      clearInterval(this.activityIntervalId);
    }
  }

  // ── Live Activities Helper Methods ──────────────────────────────────────────
  private initLiveActivities() {
    const initialList = [
      { id: Date.now() - 40000, text: 'Platform operations system initialized successfully', time: 'Just now', type: 'user' as const },
      { id: Date.now() - 30000, text: 'Real-time database sync completed with active clusters', time: '1m ago', type: 'booking' as const }
    ];
    this.liveActivities.set(initialList);

    this.activityIntervalId = setInterval(() => {
      this.generateLiveEvent();
    }, 10000);
  }

  private generateLiveEvent() {
    const venues = this.venueStore.venues();
    const vendors = this.vendorStore.vendors();
    const users = this.users();
    const bookings = this.bookingStore.bookings();

    const eventTypes: Array<'booking' | 'vendor' | 'user' | 'review' | 'payment'> = ['booking', 'vendor', 'user', 'review', 'payment'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    let text = '';
    switch (randomType) {
      case 'booking':
        if (venues.length > 0) {
          const randomVenue = venues[Math.floor(Math.random() * venues.length)];
          const actions = ['received a booking request', 'has a new booking', 'confirmed booking', 'received an inquiry'];
          text = `"${randomVenue.name}" ${actions[Math.floor(Math.random() * actions.length)]}`;
        } else {
          text = 'Royal Palace received booking';
        }
        break;
      case 'vendor':
        if (vendors.length > 0) {
          const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
          const actions = ['joined the platform', 'updated their listing status', 'upgraded to Premium subscription', 'updated pricing details'];
          text = `Vendor "${randomVendor.businessName || randomVendor.fullName}" ${actions[Math.floor(Math.random() * actions.length)]}`;
        } else {
          text = 'New vendor registered business';
        }
        break;
      case 'user':
        if (users.length > 0) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          text = `User "${randomUser.name}" logged in to browse listings`;
        } else {
          text = 'New user registered account';
        }
        break;
      case 'review':
        if (venues.length > 0) {
          const randomVenue = venues[Math.floor(Math.random() * venues.length)];
          const ratings = [5, 4, 3, 5, 4];
          text = `New ${ratings[Math.floor(Math.random() * ratings.length)]}-star review submitted for "${randomVenue.name}"`;
        } else {
          text = 'New review pending admin moderation';
        }
        break;
      case 'payment':
        if (bookings.length > 0) {
          const randomBooking = bookings[Math.floor(Math.random() * bookings.length)];
          const statuses = ['processed successfully', 'marked as pending verification', 'refund processed'];
          text = `Payment of ₹${(randomBooking.totalBookingAmount || 15000).toLocaleString()} ${statuses[Math.floor(Math.random() * statuses.length)]}`;
        } else {
          text = 'Subscription renewal payment received';
        }
        break;
    }

    if (text) {
      const newEvent = {
        id: Date.now(),
        text,
        time: 'Just now',
        type: randomType
      };

      this.liveActivities.update(prev => [newEvent, ...prev.slice(0, 9)]);
    }
  }

  getBarHeightPercentage(val: number, max: number): number {
    if (!max) return 0;
    return (val / max) * 105; // give a small multiplier to match display size
  }
}