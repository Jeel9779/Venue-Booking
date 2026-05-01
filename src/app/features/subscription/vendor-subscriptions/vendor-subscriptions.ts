import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { SubscriptionApi } from '@core/api/subscription-api';    // Subscription API
import { VendorStore } from '@core/store/vendor.store';          // Vendor Store
import { VendorService } from '@core/services/vendor.service';  // Vendor Service
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Table } from '@shared/components/table/table';


@Component({
  selector: 'app-vendor-subscriptions',
  standalone: true,
  imports: [CommonModule, Button, Card, Table],
  templateUrl: './vendor-subscriptions.html',
  styleUrl: './vendor-subscriptions.css',
})
export class VendorSubscriptions implements OnInit {
  private readonly subApi = inject(SubscriptionApi);
  private readonly vendorStore = inject(VendorStore);
  private readonly vendorService = inject(VendorService);

  readonly subscriptions = signal<any[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Join subscriptions with vendor data from store
  readonly enrichedSubscriptions = computed(() => {
    const subs = this.subscriptions();
    const vendors = this.vendorStore.vendors();

    return subs.map((sub: any) => {
      // If vendorId is a string, look it up. If it's an object, use it.
      const vId = typeof sub.vendorId === 'string' ? sub.vendorId : sub.vendorId?._id;
      const vendorDetails = vendors.find((v: any) => v._id === vId);

      return {
        ...sub,
        vendorDetails: vendorDetails || sub.vendorId // Fallback to whatever we have
      };
    });
  });

  // Stats for the header cards
  readonly stats = computed(() => {
    const subs = this.enrichedSubscriptions();
    return {
      total: subs.length,
      active: subs.filter((s: any) => s.status === 'active').length,
      expired: subs.filter((s: any) => s.status === 'expired').length,
      grace: subs.filter((s: any) => s.status === 'grace').length,
      revenue: subs.reduce((acc: number, curr: any) => acc + (curr.planId?.price || 0), 0)
    };
  });

  ngOnInit(): void {
    if (this.vendorStore.vendors().length === 0) {
      this.vendorService.loadAll();
    }
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    this.error.set(null);
    this.subApi.adminGetAllSubscriptions()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => this.subscriptions.set(res.subscriptions),
        error: (err: any) => this.error.set(err.error?.message || 'Failed to load subscriptions')
      });
  }

  // Helper to get status color
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'grace': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'expired': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }
}
