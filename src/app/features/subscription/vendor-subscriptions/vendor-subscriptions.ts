import { Component, inject, signal, computed, ChangeDetectorRef, resource, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { SubscriptionStore } from '@core/store/subscription.store';
import { VendorStore } from '@core/store/vendor.store';
import { SubscriptionApi } from '@core/api/subscription-api';
import { VendorApi } from '@core/api/vendor-api';
import { Button } from '@shared/components/button/button';
import { Model } from '@shared/components/model/model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendor-subscriptions',
  standalone: true,
  imports: [CommonModule, Button, LucideAngularModule, Model],
  templateUrl: './vendor-subscriptions.html',
  styleUrl: './vendor-subscriptions.css'
})
export class VendorSubscriptions {
  private readonly subStore = inject(SubscriptionStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly subApi = inject(SubscriptionApi);
  private readonly vendorApi = inject(VendorApi);
  private readonly cd = inject(ChangeDetectorRef);
  protected readonly Math = Math;

  // ── Declarative Data Loading (Aligned with Bookings) ──────────────────────────
  private readonly subscriptionsResource = resource({
    loader: () => firstValueFrom(this.subApi.adminGetAllSubscriptions()),
  });

  private readonly vendorsResource = resource({
    loader: () => firstValueFrom(this.vendorApi.getAll()),
  });

  // Sync resource data to store (Eagerly using effect)
  private readonly _syncEffect = effect(() => {
    const sRes = this.subscriptionsResource.value();
    if (sRes) {
      this.subStore.setAllSubscriptions(sRes.subscriptions);
      this.subStore.setSummary(sRes.summary);
    }

    const vRes = this.vendorsResource.value();
    if (vRes) {
      this.vendorStore.setVendors(vRes);
    }
  });

  readonly isLoading = computed(() => this.subscriptionsResource.isLoading() || this.vendorsResource.isLoading() || this.subStore.isLoading());
  readonly error = computed(() => (this.subscriptionsResource.error() as any)?.message || this.subStore.error());
  readonly summary = this.subStore.summary;

  search = signal('');
  filter = signal<string>('all');
  selectedSubscription = signal<any | null>(null);
  


  // Logic to calculate days left and enrich data
  readonly enrichedSubscriptions = computed(() => {
    const subs = this.subStore.allSubscriptions();
    const vendors = this.vendorStore.vendors();
    const now = new Date();

    return subs.map((sub: any) => {
      // 1. Resolve Vendor Details
      const vId = typeof sub.vendorId === 'string' ? sub.vendorId : sub.vendorId?._id;
      const storeVendor = vendors.find((v: any) => v._id === vId);
      
      // Merge: Store > API Object > Default
      const vendorDetails = storeVendor || (typeof sub.vendorId === 'object' ? sub.vendorId : { businessName: 'Unknown', fullName: 'Unknown' });

      // 2. Comprehensive Date Logic
      const now = new Date();
      const end = sub.endDate ? new Date(sub.endDate) : now;
      const graceEnd = sub.graceEndDate ? new Date(sub.graceEndDate) : end;
      
      const totalDays = sub.planSnapshot?.duration_days || 30;
      let daysLeft = 0;
      let label = 'Remaining';

      if (sub.status === 'active') {
        daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        label = 'Days Left';
      } else if (sub.status === 'grace') {
        daysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        label = 'Grace Days';
      }

      // 3. Status and Future-Ready Warnings
      // "Expiring Soon" in dashboard specifically refers to active plans nearing their primary end date
      const isExpiring = sub.status === 'active' && daysLeft <= 15 && daysLeft > 0;
      const queueItems = Array.isArray(sub.pendingQueue) ? sub.pendingQueue : [];
      const queueCount = queueItems.length;

      return {
        ...sub,
        vendorDetails,
        pendingQueue: queueItems,
        daysLeft: Math.max(0, daysLeft),
        totalDays,
        daysLabel: label,
        isExpiring,
        queueCount
      };
    });
  });

  // Calculate total revenue locally if summary is empty or missing it
  readonly totalRevenue = computed(() => {
    const s = this.summary();
    if (s?.revenue) return s.revenue;
    
    // Fallback: Sum of prices of all active/grace subscriptions
    return this.enrichedSubscriptions()
      .filter(sub => sub.status === 'active' || sub.status === 'grace')
      .reduce((acc, sub) => acc + (sub.planSnapshot?.price || 0), 0);
  });

  readonly filteredSubscriptions = computed(() => {
    const list = this.enrichedSubscriptions();
    const f = this.filter();
    const q = this.search().toLowerCase().trim();

    return list.filter(sub => {
      // 1. Status Filter
      if (f === 'expiring') {
        if (!sub.isExpiring) return false;
      } else if (f !== 'all' && sub.status !== f) {
        return false;
      }

      // 2. Search Filter
      if (q) {
        const vendorName = sub.vendorDetails?.businessName?.toLowerCase() || sub.vendorDetails?.fullName?.toLowerCase() || '';
        const vendorEmail = sub.vendorDetails?.email?.toLowerCase() || '';
        const planName = sub.planSnapshot?.name?.toLowerCase() || '';
        const txnId = sub._id.toLowerCase();
        
        return vendorName.includes(q) || 
               vendorEmail.includes(q) || 
               planName.includes(q) || 
               txnId.includes(q);
      }

      return true;
    });
  });



  loadAll() {
    this.subscriptionsResource.reload();
    this.vendorsResource.reload();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'grace': return 'bg-amber-50 text-amber-700 border-amber-300';
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
}
