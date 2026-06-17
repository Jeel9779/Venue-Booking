// Purpose: Component/Logic: Handles UI behavior and user interactions for vendor-subscriptions.
import { Component, inject, signal, computed, ChangeDetectorRef, resource, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { SubscriptionService } from '@core/services/subscription.service';
import { VendorService } from '@core/services/vendor.service';
import { SubscriptionStore } from '@core/store/subscription.store';
import { VendorStore } from '@core/store/vendor.store';
import { Model } from '@shared/components/model/model';
import { LucideAngularModule } from 'lucide-angular';
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-vendor-subscriptions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Model, Pagination],
  templateUrl: './vendor-subscriptions.html',
  styleUrl: './vendor-subscriptions.css'
})
// Defines the structure and behavior of this class
export class VendorSubscriptions implements OnInit {
  private readonly subStore = inject(SubscriptionStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly subService = inject(SubscriptionService);
  private readonly vendorService = inject(VendorService);
  private readonly cd = inject(ChangeDetectorRef);
  protected readonly Math = Math;

  readonly pagination = this.subStore.pagination;
  readonly isLoading = computed(() => this.subStore.isLoading() || this.vendorStore.isLoading());
  readonly error = computed(() => this.subStore.error() || this.vendorStore.error());
  readonly summary = this.subStore.summary;

  ngOnInit() {
    this.subService.loadAllSubscriptions(this.pagination().page, this.pagination().limit);
    this.subService.loadAllAddons();
    this.vendorService.loadAll(1, 100);
  }

  search = signal('');
  filter = signal<string>('all');
  selectedSubscription = signal<any | null>(null);
  


  // Logic to calculate days left and enrich data
  readonly enrichedSubscriptions = computed(() => {
    const subs = this.subStore.allSubscriptions();
    const addons = this.subStore.allAddons();
    const vendors = this.vendorStore.vendors();
    const now = new Date();

    const normalizeSub = (sub: any, isAddon: boolean = false) => {
      // 1. Resolve Vendor Details
      const vendorRef = isAddon ? sub.userId : sub.vendorId;
      const vId = typeof vendorRef === 'string' ? vendorRef : vendorRef?._id;
      const storeVendor = vendors.find((v: any) => v._id === vId);
      
      // Merge: Store > API Object > Default
      const vendorDetails = storeVendor || (typeof vendorRef === 'object' ? vendorRef : { businessName: 'Unknown', fullName: 'Unknown' });

      // 2. Comprehensive Date Logic
      const end = (isAddon ? (sub.expiryDate ? new Date(sub.expiryDate) : now) : (sub.endDate ? new Date(sub.endDate) : now));
      const graceEnd = sub.graceEndDate ? new Date(sub.graceEndDate) : end;
      
      const planSnap = isAddon ? sub.addonId : sub.planSnapshot;
      const totalDays = planSnap?.duration_days || 30;
      let daysLeft = 0;
      let label = 'Remaining';

      if (sub.status === 'active' || sub.status === 'ACTIVE') {
        daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        label = 'Days Left';
      } else if (sub.status === 'grace') {
        daysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        label = 'Grace Days';
      } else if (sub.status === 'suspended' || sub.status === 'SUSPENDED') {
        daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        label = 'Remaining';
      }

      // 3. Status and Future-Ready Warnings
      // "Expiring Soon" in dashboard specifically refers to active plans nearing their primary end date
      const isExpiring = (sub.status === 'active' || sub.status === 'ACTIVE') && daysLeft <= 15 && daysLeft > 0;
      const queueItems = Array.isArray(sub.pendingQueue) ? sub.pendingQueue : [];
      const queueCount = queueItems.length;

      return {
        ...sub,
        planSnapshot: planSnap,
        endDate: end,
        status: (sub.status || '').toLowerCase(),
        vendorDetails,
        pendingQueue: queueItems,
        daysLeft: Math.max(0, daysLeft),
        totalDays,
        daysLabel: label,
        isExpiring,
        queueCount,
        isAddon,
        suspensionReason: sub.suspensionReason || null,
        attachedAddons: [] // Will be populated later
      };
    };

    const normalizedSubs = subs.map((sub: any) => normalizeSub(sub, false));
    const normalizedAddons = addons.map((addon: any) => normalizeSub(addon, true));
    
    // Attach Add-ons to their corresponding Base Plans by Vendor ID
    normalizedSubs.forEach(sub => {
      const vendorId = sub.vendorDetails?._id;
      if (vendorId) {
        sub.attachedAddons = normalizedAddons.filter(addon => {
           const addonVendorId = addon.vendorDetails?._id;
           return addonVendorId === vendorId;
        });
      }
    });

    // We only return Base Plans as primary rows to avoid duplicating vendors
    return [...normalizedSubs].sort((a, b) => {
      return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
    });
  });

  // Calculate total revenue locally to include add-ons and queued plans
  readonly totalRevenue = computed(() => {
    return this.enrichedSubscriptions()
      .reduce((acc, sub) => {
        let total = acc + (sub.planSnapshot?.price || 0);
        if (sub.pendingQueue && sub.pendingQueue.length > 0) {
          sub.pendingQueue.forEach((q: any) => {
            total += (q.planSnapshot?.price || 0);
          });
        }
        return total;
      }, 0);
  });

  setFilter(status: string) {
    this.filter.set(status);
    this.subService.loadAllSubscriptions(1, this.pagination().limit, this.search(), status);
  }

  private searchTimeout: any;
  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(value);
      this.subService.loadAllSubscriptions(1, this.pagination().limit, value, this.filter());
    }, 500);
  }

  onPageChange(page: number) {
    this.subService.loadAllSubscriptions(page, this.pagination().limit, this.search(), this.filter());
  }

  loadAll() {
    this.subService.loadAllSubscriptions(this.pagination().page, this.pagination().limit, this.search(), this.filter());
    this.subService.loadAllAddons();
    this.vendorService.loadAll(1, 100);
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'grace': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'suspended': return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'expired': return 'bg-rose-50 text-rose-700 border-rose-300';
      default: return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  }

  openDetails(sub: any) {
    this.selectedSubscription.set(sub);
    this.cd.detectChanges();
  }

  closeDetails() {
    this.selectedSubscription.set(null);
    this.cd.detectChanges();
  }

  getUsagePercentage(sub: any): number {
    if (!sub || !sub.totalDays) return 0;
    const pct = ((sub.totalDays - sub.daysLeft) / sub.totalDays) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }
}
