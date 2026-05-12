import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentStore } from '../../core/store/payment.store';
import { Payment } from '../../core/models/payment.model';
import {
  LucideAngularModule,
  Search, Filter, RotateCcw, Eye, Download,
  TrendingUp, AlertCircle, CheckCircle2, Clock, X,
  Calendar, User, Building, Hash, FileText
} from 'lucide-angular';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payments implements OnInit {
  private readonly service = inject(PaymentService);
  private readonly store = inject(PaymentStore);
  private readonly router = inject(Router);

  // ── Store streams via Signals ──────────────────────────────────────────────
  readonly payments  = toSignal(this.store.payments$,   { initialValue: [] as Payment[] });
  readonly isLoading = toSignal(this.store.isLoading$,  { initialValue: false });
  readonly filters   = toSignal(this.store.filters$);

  // ── Client-side search (vendor name / email / txn id) ─────────────────────
  readonly searchQuery = signal('');

  // ── Icons ─────────────────────────────────────────────────────────────────
  readonly icons = {
    search:     Search,
    filter:     Filter,
    reset:      RotateCcw,
    view:       Eye,
    download:   Download,
    trendingUp: TrendingUp,
    alert:      AlertCircle,
    success:    CheckCircle2,
    pending:    Clock,
    close:      X,
    calendar:   Calendar,
    user:       User,
    building:   Building,
    hash:       Hash,
    fileText:   FileText,
  };

  // ── Filter form model (type + status sent to API; search stays client-side) ─
  filterValues = {
    type:          'subscription',
    paymentStatus: '',
    startDate:     '',
    endDate:       '',
  };

  selectedPayment: Payment | null = null;
  showModal = signal(false);

  columns = ['Vendor', 'Plan / Type', 'Amount', 'Status', 'Transaction ID', 'Date', 'Actions'];

  // ── Deduplication ──────────────────────────────────────────────────────────
  // Backend creates two records per subscription payment (SUB-xxx + TXN-xxx).
  // Group by vendorId + amount + 5-minute bucket; keep the SUB- prefixed one.
  readonly deduplicatedPayments = computed(() => {
    const all = this.payments();
    const seen = new Map<string, Payment>();

    for (const p of all) {
      // Safe key: vendorId can be an object OR a plain string
      const vendorKey =
        p.vendorId && typeof p.vendorId === 'object'
          ? p.vendorId._id
          : String(p.vendorId);

      const bucket = Math.floor(new Date(p.createdAt).getTime() / (5 * 60 * 1000));
      const key    = `${vendorKey}_${p.amount}_${bucket}`;

      if (!seen.has(key)) {
        seen.set(key, p);
      } else {
        const existing    = seen.get(key)!;
        const newIsSub    = p.transactionId?.startsWith('SUB-');
        const existingIsSub = existing.transactionId?.startsWith('SUB-');
        if (newIsSub && !existingIsSub) seen.set(key, p);
      }
    }

    return Array.from(seen.values());
  });

  // ── Client-side search filter (applied on top of deduped list) ────────────
  readonly filteredPayments = computed(() => {
    const q     = this.searchQuery().toLowerCase().trim();
    const items = this.deduplicatedPayments();
    if (!q) return items;

    return items.filter(p => {
      const name  = this.vendorName(p).toLowerCase();
      const email = (p.vendorId?.email || '').toLowerCase();
      const txn   = (p.transactionId   || '').toLowerCase();
      return name.includes(q) || email.includes(q) || txn.includes(q);
    });
  });

  // ── KPI cards — computed from LOCAL deduped data ──────────────────────────
  // Admin revenue = subscription payments collected from vendors.
  // We don't trust the backend /stats endpoint for KPIs because it may include
  // booking payments and doesn't respect the active type filter.
  readonly kpiStats = computed(() => {
    const all = this.deduplicatedPayments();   // use the full deduped set, not filtered
    let totalRevenue      = 0;
    let pendingAmount     = 0;
    let pendingCount      = 0;
    let failedCount       = 0;
    let successfulAmount  = 0;
    let successfulCount   = 0;
    let subscriptionRevenue = 0;
    let addonRevenue      = 0;

    for (const p of all) {
      if (p.paymentStatus === 'success') {
        totalRevenue     += p.amount;
        successfulAmount += p.amount;
        successfulCount++;
        if (p.type === 'subscription') subscriptionRevenue += p.amount;
        else if (p.type === 'addon')   addonRevenue        += p.amount;
      } else if (p.paymentStatus === 'pending') {
        pendingAmount += p.amount;
        pendingCount++;
      } else if (p.paymentStatus === 'failed') {
        failedCount++;
      }
    }

    return {
      totalRevenue, pendingAmount, pendingCount,
      failedCount,  successfulAmount, successfulCount,
      subscriptionRevenue, addonRevenue,
    };
  });

  // ── Active filter badge ────────────────────────────────────────────────────
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    const isCustomType = f?.type && f.type !== 'subscription';
    return !!(isCustomType || f?.paymentStatus || f?.startDate || f?.endDate || this.searchQuery());
  });

  // ──────────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.service.loadInitialData();

    // Keep form model in sync with store
    this.store.filters$.subscribe(f => {
      this.filterValues = {
        type:          f.type          ?? 'subscription',
        paymentStatus: f.paymentStatus ?? '',
        startDate:     f.startDate     ?? '',
        endDate:       f.endDate       ?? '',
      };
    });
  }

  // Triggered by type / status / date dropdowns → API re-fetch
  applyApiFilters(): void {
    this.service.applyFilters({
      type:          this.filterValues.type,
      paymentStatus: this.filterValues.paymentStatus,
      startDate:     this.filterValues.startDate || undefined,
      endDate:       this.filterValues.endDate   || undefined,
    });
  }

  // Reset everything: API filters + client-side search
  resetFilters(): void {
    this.filterValues = { type: 'subscription', paymentStatus: '', startDate: '', endDate: '' };
    this.searchQuery.set('');
    this.service.applyFilters(this.filterValues);
  }

  viewDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    setTimeout(() => (this.selectedPayment = null), 300);
  }

  navigateToRelated(payment: Payment): void {
    if (!payment.relatedId) return;
    if (payment.type === 'booking' || payment.type === 'full payment') {
      this.router.navigate(['/bookings'], { queryParams: { id: payment.relatedId } });
    } else if (payment.type === 'subscription') {
      this.router.navigate(['/admin/vendor-subscriptions'], { queryParams: { id: payment.relatedId } });
    }
    this.closeModal();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed':  return 'bg-rose-100 text-rose-700 border-rose-200';
      default:        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'booking':      return 'bg-indigo-100 text-indigo-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      case 'full payment': return 'bg-emerald-100 text-emerald-700';
      case 'addon':        return 'bg-cyan-100 text-cyan-700';
      default:             return 'bg-slate-100 text-slate-700';
    }
  }

  /** Resolves vendor display name — backend may return fullName or name */
  vendorName(payment: Payment): string {
    return payment.vendorId?.fullName || payment.vendorId?.name || 'Unknown Vendor';
  }

  vendorInitial(payment: Payment): string {
    return this.vendorName(payment).substring(0, 1).toUpperCase();
  }
}
