// Purpose: Component/Logic: Handles UI behavior and user interactions for dashboard.
import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardService } from '@core/services/dashboard.service';

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
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
// Defines the structure and behavior of this class
export class Dashboard implements OnInit, OnDestroy {
  // ── Dependency Injection ──────────────────────────────────────────────────
  private readonly dashboardService = inject(DashboardService);

  readonly isDashboardLoading = this.dashboardService.isLoading;
  readonly summary = this.dashboardService.summary;

  // ── Key Performance Indicators (KPIs) ────────────────────────────────────
  readonly newStats = computed(() => {
    const data = this.summary();
    if (!data) return [];

    return [
      { 
        title: 'Total Users', 
        value: data.totalUsers, 
        icon: 'users', 
        change: 'Registered',
        iconClass: 'bg-blue-50 text-blue-600 border border-blue-100', 
        accentClass: 'border-l-4 border-l-blue-500',
        progressClass: 'bg-blue-500',
        isLoading: false
      },
      { 
        title: 'Total Vendors', 
        value: data.totalVendors, 
        icon: 'briefcase', 
        change: 'Partners',
        iconClass: 'bg-indigo-50 text-indigo-600 border border-indigo-100', 
        accentClass: 'border-l-4 border-l-indigo-500',
        progressClass: 'bg-indigo-500',
        isLoading: false
      },
      { 
        title: 'Active Subs', 
        value: data.topSubscriptions?.reduce((acc, sub) => acc + sub.count, 0) || 0, 
        icon: 'zap', 
        change: 'Paid plans',
        iconClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100', 
        accentClass: 'border-l-4 border-l-emerald-500',
        progressClass: 'bg-emerald-500',
        isLoading: false
      },
      { 
        title: 'Total Venues', 
        value: data.activeVenues, 
        icon: 'building-2', 
        change: 'Listed',
        iconClass: 'bg-purple-50 text-purple-600 border border-purple-100', 
        accentClass: 'border-l-4 border-l-purple-500',
        progressClass: 'bg-purple-500',
        isLoading: false
      },
      { 
        title: 'Total Bookings', 
        value: data.totalBookings, 
        icon: 'calendar-check', 
        change: 'Total Orders',
        iconClass: 'bg-orange-50 text-orange-600 border border-orange-100', 
        accentClass: 'border-l-4 border-l-orange-500',
        progressClass: 'bg-orange-500',
        isLoading: false
      },
      { 
        title: 'Total Revenue', 
        value: `₹${data.netRevenue.toLocaleString()}`, 
        icon: 'indian-rupee', 
        change: 'Platform Earn',
        iconClass: 'bg-green-50 text-green-600 border border-green-100', 
        accentClass: 'border-l-4 border-l-green-500',
        progressClass: 'bg-green-500',
        isLoading: false
      },
      { 
        title: 'Pending Approvals', 
        value: data.pendingApprovalsCount, 
        icon: 'clock', 
        change: 'Action Required',
        iconClass: 'bg-amber-50 text-amber-600 border border-amber-100', 
        accentClass: 'border-l-4 border-l-amber-500',
        progressClass: 'bg-amber-500',
        isLoading: false
      },
      { 
        title: 'Cancelled Bookings', 
        value: data.cancelledBookingsCount, 
        icon: 'calendar-x', 
        change: 'Failed / Cancelled',
        iconClass: 'bg-rose-50 text-rose-600 border border-rose-100', 
        accentClass: 'border-l-4 border-l-rose-500',
        progressClass: 'bg-rose-500',
        isLoading: false
      },
    ];
  });

  // ── Are Bookings Increasing? ─────────────────────────────────────────────
  readonly bookingVelocity = computed(() => {
    return this.summary()?.bookingVelocity || { thisWeek: 0, lastWeek: 0, changePercent: 0, isIncreasing: false };
  });

  // ── Which Vendors Perform Best? ──────────────────────────────────────────
  readonly topVendors = computed(() => {
    return this.summary()?.topVendors || [];
  });

  // ── Which Subscriptions Earn Most? ───────────────────────────────────────
  readonly topSubscriptions = computed(() => {
    return this.summary()?.topSubscriptions || [];
  });

  // ── Any Pending Approvals? ───────────────────────────────────────────────
  readonly pendingApprovalsList = computed(() => {
    return this.summary()?.pendingApprovals || [];
  });

  // ── Any Payment Issues? ──────────────────────────────────────────────────
  readonly paymentIssues = computed(() => {
    return this.summary()?.paymentIssues || [];
  });

  // ── Which City Grows Fastest? ────────────────────────────────────────────
  readonly cityGrowth = computed(() => {
    return this.summary()?.cityGrowth || [];
  });

  // ── Most Booked Days Chart Data ─────────────────────────────────────────
  readonly mostBookedDays = computed(() => {
    const dayCounts = this.summary()?.mostBookedDays || [0, 0, 0, 0, 0, 0, 0];
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      labels,
      data: dayCounts,
      max: Math.max(...dayCounts, 1)
    };
  });

  // ── Peak Booking Hours Chart Data ────────────────────────────────────────
  readonly peakBookingHours = computed(() => {
    const hours = this.summary()?.peakBookingHours || { morning: 0, afternoon: 0, evening: 0, night: 0 };
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
    this.dashboardService.loadDashboard();
  }

  ngOnDestroy() {
  }

  getPercentage(val: number, max: number): number {
    if (!max) return 0;
    return (val / max) * 100;
  }
}