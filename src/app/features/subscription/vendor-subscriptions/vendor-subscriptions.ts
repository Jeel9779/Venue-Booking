import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '@core/services/subscription.service';
import { SubscriptionStore } from '@core/store/subscription.store';
import { VendorStore } from '@core/store/vendor.store';
import { VendorService } from '@core/services/vendor.service';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Table } from '@shared/components/table/table';
import { Model } from '@shared/components/model/model';


import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-vendor-subscriptions',
  standalone: true,
  imports: [CommonModule, Button, Card, Table, LucideAngularModule, Model],
  templateUrl: './vendor-subscriptions.html',
  styleUrl: './vendor-subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorSubscriptions implements OnInit {
  private readonly subService = inject(SubscriptionService);
  private readonly subStore = inject(SubscriptionStore);
  private readonly vendorStore = inject(VendorStore);
  private readonly vendorService = inject(VendorService);
  protected readonly Math = Math;

  readonly isLoading = this.subStore.isLoading;
  readonly error = this.subStore.error;
  readonly summary = this.subStore.summary;

  search = signal('');
  filter = signal<string>('all');
  selectedSubscription = signal<any>(null);

  // Logic to calculate days left and enrich data
  readonly enrichedSubscriptions = computed(() => {
    const subs = this.subStore.allSubscriptions();
    const vendors = this.vendorStore.vendors();
    const now = new Date();

    return subs.map((sub: any) => {
      const vId = typeof sub.vendorId === 'string' ? sub.vendorId : sub.vendorId?._id;
      const vendorDetails = vendors.find((v: any) => v._id === vId);

      // Calculate days remaining
      const endDate = new Date(sub.endDate);
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check warnings from backend or calculate locally
      const isExpiring = sub.expirationWarning?.expiresWithin15Days || daysLeft <= 15;

      return {
        ...sub,
        vendorDetails: vendorDetails || sub.vendorId,
        daysLeft,
        isExpiring
      };
    });
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
        const vendorName = sub.vendorDetails?.businessName?.toLowerCase() || '';
        const vendorEmail = sub.vendorDetails?.email?.toLowerCase() || '';
        const planName = sub.planSnapshot?.name?.toLowerCase() || '';
        return vendorName.includes(q) || vendorEmail.includes(q) || planName.includes(q);
      }

      return true;
    });
  });

  ngOnInit(): void {
    if (this.vendorStore.vendors().length === 0) {
      this.vendorService.loadAll();
    }
    this.subService.loadAllSubscriptions();
  }

  loadAll() {
    this.subService.loadAllSubscriptions();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'grace': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'expired': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  openDetails(sub: any) {
    this.selectedSubscription.set(sub);
  }

  closeDetails() {
    this.selectedSubscription.set(null);
  }
}
