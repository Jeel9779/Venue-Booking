import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentStore } from '../../core/store/payment.store';
import { Payment } from '../../core/models/payment.model';
import { LucideAngularModule, Search, Filter, RotateCcw, Eye, Download, TrendingUp, AlertCircle, CheckCircle2, Clock, X, Calendar, User, Building, Hash, FileText } from 'lucide-angular';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payments implements OnInit {
  private readonly service = inject(PaymentService);
  private readonly store = inject(PaymentStore);

  // State using Signals for better performance and reactivity
  readonly payments = toSignal(this.store.payments$, { initialValue: [] as Payment[] });
  readonly stats = toSignal(this.store.stats$);
  readonly isLoading = toSignal(this.store.isLoading$, { initialValue: false });
  readonly filters = toSignal(this.store.filters$);

  // Derived state
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f?.type || f?.paymentStatus || f?.vendorId);
  });

  // Icons
  readonly icons = {
    search: Search,
    filter: Filter,
    reset: RotateCcw,
    view: Eye,
    download: Download,
    trendingUp: TrendingUp,
    alert: AlertCircle,
    success: CheckCircle2,
    pending: Clock,
    close: X,
    calendar: Calendar,
    user: User,
    building: Building,
    hash: Hash,
    fileText: FileText
  };

  // UI State
  filterValues = {
    type: '',
    paymentStatus: '',
    vendorId: '',
    startDate: '',
    endDate: ''
  };

  selectedPayment: Payment | null = null;
  showModal = signal(false);

  columns = [
    'Vendor & User',
    'Type',
    'Amount',
    'Status',
    'Transaction Details',
    'Date',
    'Actions'
  ];

  ngOnInit(): void {
    this.service.loadInitialData();
    
    // Sync filter values from store
    this.store.filters$.subscribe(f => {
      this.filterValues = { 
        ...this.filterValues,
        type: f.type,
        paymentStatus: f.paymentStatus,
        vendorId: f.vendorId
      };
    });
  }

  applyFilters(): void {
    this.service.applyFilters(this.filterValues);
  }

  resetFilters(): void {
    this.filterValues = {
      type: '',
      paymentStatus: '',
      vendorId: '',
      startDate: '',
      endDate: ''
    };
    this.service.resetFilters();
  }

  viewDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    setTimeout(() => this.selectedPayment = null, 300);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'booking': return 'bg-indigo-100 text-indigo-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      case 'addon': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
