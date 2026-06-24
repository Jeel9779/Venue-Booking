// Purpose: Component/Logic: Handles UI behavior and user interactions for payment.
import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentStore } from '../../core/store/payment.store';
import { Payment } from '../../core/models/payment.model';
import {
  LucideAngularModule,
  Search, Filter, RotateCcw, Eye,
  TrendingUp, AlertCircle, CheckCircle2, Clock, X,
  Calendar, User, Building, Hash, FileText
} from 'lucide-angular';

import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Pagination],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
// Defines the structure and behavior of this class
export class Payments implements OnInit, OnDestroy {
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
    type:          '',
    paymentStatus: '',
  };

  selectedPayment: Payment | null = null;
  showModal = signal(false);

  columns = ['Vendor', 'Plan / Type', 'Amount', 'Status', 'Transaction ID', 'Date', 'Actions'];

  readonly pagination = toSignal(this.store.pagination$, { initialValue: { page: 1, limit: 10, totalRecords: 0, totalPages: 1 } });
  readonly kpiStats = toSignal(this.store.stats$, { initialValue: {
    totalRevenue: 0, revenueChange: 0, pendingAmount: 0, pendingCount: 0, failedCount: 0, successfulAmount: 0, successfulCount: 0, subscriptionRevenue: 0, addonRevenue: 0
  } });

  // ── Deduplication ──────────────────────────────────────────────────────────
  // Backend sometimes creates two records per payment attempt (SUB-xxx + TXN-xxx).
  // Group by relatedId (Subscription/Add-on ID) to resolve duplicates robustly.
  readonly deduplicatedPayments = computed(() => {
    const all = this.payments();
    const seen = new Map<string, Payment>();

    for (const p of all) {
      if (p.type !== 'subscription' && p.type !== 'addon' && p.type !== 'full payment') continue;

      const key = p.relatedId ? String(p.relatedId) : p._id;

      if (!seen.has(key)) {
        seen.set(key, p);
      } else {
        const existing = seen.get(key)!;
        const newIsSub = p.transactionId?.startsWith('SUB-') || p.paymentStatus === 'success';
        const existingIsSub = existing.transactionId?.startsWith('SUB-') || existing.paymentStatus === 'success';
        if (newIsSub && !existingIsSub) {
          seen.set(key, p);
        }
      }
    }

    let list = Array.from(seen.values());
    
    // ── Client-side filtering ────────────────────────────────────────────────
    const term = this.searchQuery().toLowerCase().trim();
    if (term) {
      list = list.filter(p => {
         const vName = (p.vendorId?.fullName || p.vendorId?.name || '').toLowerCase();
         const vEmail = (p.vendorId?.email || '').toLowerCase();
         const tId = (p.transactionId || '').toLowerCase();
         const type = (p.type || '').toLowerCase();
         const status = (p.paymentStatus || '').toLowerCase();
         const amount = String(p.amount);
         return vName.includes(term) || vEmail.includes(term) || tId.includes(term) || type.includes(term) || status.includes(term) || amount.includes(term);
      });
    }

    const page = this.pagination()?.page || 1;
    const limit = 10; // Keep display limit at 10 regardless of what the store says
    return list.length > limit ? list.slice((page - 1) * limit, page * limit) : list;
  });

  // ── Active filter badge ────────────────────────────────────────────────────
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    const isCustomType = f?.type && f.type !== 'subscription';
    return !!(isCustomType || f?.paymentStatus || this.searchQuery());
  });

  // ──────────────────────────────────────────────────────────────────────────
  private pollingInterval: any;

  ngOnInit(): void {
    this.service.loadInitialData();

    // Keep form model in sync with store
    this.store.filters$.subscribe(f => {
      this.filterValues = {
        type:          f.type          ?? '',
        paymentStatus: f.paymentStatus ?? '',
      };
    });

    // Auto-refresh the page data every 10 seconds safely
    this.pollingInterval = setInterval(() => {
      this.applyApiFilters(false);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private searchTimeout: any;
  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchQuery.set(value);
      this.applyApiFilters(true);
    }, 500);
  }

  // Triggered by type / status / date dropdowns → API re-fetch
  applyApiFilters(resetPage: boolean = true): void {
    this.service.applyFilters({
      type:          this.filterValues.type,
      paymentStatus: this.filterValues.paymentStatus,
      search:        this.searchQuery()
    }, resetPage);
  }

  // Reset everything: API filters + client-side search
  resetFilters(): void {
    this.filterValues = { type: '', paymentStatus: '' };
    this.searchQuery.set('');
    this.service.applyFilters({ type: '', paymentStatus: '', search: '' });
  }

  onPageChange(page: number) {
    this.service.setPage(page);
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
