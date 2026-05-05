import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnerStore } from '../../core/store/partner.store'; 
import { PartnerService } from '../../core/services/partner.service';
import { Venue } from '../../core/models/venue.model';
import { Model } from '../../shared/components/model/model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, Model, LucideAngularModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class Partners implements OnInit {
  private readonly store = inject(PartnerStore);
  private readonly service = inject(PartnerService);

  // ── State (Signals Linked to Store) ──
  readonly partners = this.store.partners;
  readonly kpi = this.store.kpi;
  readonly loading = this.store.isLoading;
  readonly error = this.store.error;

  // ── Local UI State ──
  search = signal(''); // Search query for filtering
  expandedMap = signal<Record<string, boolean>>({}); // Track which partners are expanded in the list
  selectedVenue = signal<Venue | null>(null); // Venue currently being viewed in modal
  
  selectedPartner = computed(() => {
    const venue = this.selectedVenue();
    if (!venue) return null;
    return this.partners().find(p => p.spaces.some(s => s._id === venue._id));
  });
  
  // Rejection Modal State
  showRejectModal = signal(false);
  rejectReason = signal('');
  
  // Action State
  actionLoading = signal(false);
  actionError = signal<string | null>(null);
  venueToDelete = signal<Venue | null>(null);

  // ── Computed ──
  /**
   * Filters partners and their venues based on the search query.
   * Matches against: Vendor Name, Email, Business Name, Venue Name, and City.
   */
  filteredPartners = computed(() => {
    const q = this.search().toLowerCase().trim();
    const list = this.partners();
    if (!q) return list;

    return list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.email.toLowerCase().includes(q) || 
      p.businessName?.toLowerCase().includes(q) ||
      p.spaces.some(s => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
    );
  });

  chartData = computed(() =>
    this.partners().map(p => {
      const total = p.spaces.length || 1;
      return {
        label: p.businessName || p.name || ('Vendor ' + p.id.slice(0, 6)),
        value: p.spaces.length,
        approved: p.spaces.filter(s => s.status === 'approved').length,
        pending: p.spaces.filter(s => s.status === 'pending').length,
        rejected: p.spaces.filter(s => s.status === 'rejected').length,
        total
      };
    })
  );



  // ── Lifecycle ──
  ngOnInit() {
    this.service.loadAll();
  }

  // ── Actions ──
  reload() {
    this.service.loadAll();
  }

  toggle(id: string) {
    this.expandedMap.update(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  openModal(venue: Venue, event: Event) {
    event.stopPropagation();
    this.actionError.set(null);
    this.selectedVenue.set(venue);
  }

  closeModal() {
    this.selectedVenue.set(null);
    this.actionError.set(null);
  }

  approve() {
    const venue = this.selectedVenue();
    if (!venue) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    
    this.service.approveVenue(venue._id, 
      () => {
        this.actionLoading.set(false);
        this.closeModal();
      },
      (err) => {
        this.actionError.set(err);
        this.actionLoading.set(false);
      }
    );
  }

  openRejectFlow() {
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.rejectReason.set('');
  }

  submitReject() {
    const venue = this.selectedVenue();
    const reason = this.rejectReason().trim();
    if (!venue || reason.length < 10) return;
    
    this.actionLoading.set(true);
    this.actionError.set(null);

    this.service.rejectVenue(venue._id, reason, 
      () => {
        this.actionLoading.set(false);
        this.closeRejectModal();
        this.closeModal();
      },
      (err) => {
        this.actionError.set(err);
        this.actionLoading.set(false);
      }
    );
  }

  deleteVenue(venue: Venue, event: Event) {
    event.stopPropagation();
    this.venueToDelete.set(venue);
  }

  confirmDelete() {
    const venue = this.venueToDelete();
    if (!venue) return;

    this.actionLoading.set(true);
    this.service.deleteVenue(venue._id, 
      () => {
        this.actionLoading.set(false);
        this.venueToDelete.set(null);
      },
      (err) => {
        this.actionError.set(err);
        this.actionLoading.set(false);
      }
    );
  }

  /**
   * Status mapping to maintain consistent display strings.
   */
  private readonly STATUS_MAP: Record<string, string> = {
    approved: 'APPROVED',
    pending: 'PENDING', 
    rejected: 'REJECTED'
  };

  /**
   * Gets the display string for a venue status.
   */
  getStatus(status: string): string {
    return this.STATUS_MAP[status] ?? status.toUpperCase();
  }

  /**
   * Determines the aggregate status for a vendor based on their venues.
   */
  getVendorStatus(spaces: Venue[]): string {
    if (spaces.some(s => s.status === 'pending')) return this.STATUS_MAP['pending'];
    if (spaces.length > 0 && spaces.every(s => s.status === 'rejected')) return this.STATUS_MAP['rejected'];
    return 'ACTIVE';
  }

  getAmenities(venue: Venue): string[] {
    try {
      const raw = venue.amenities?.[0];
      if (typeof raw === 'string' && raw.startsWith('[')) return JSON.parse(raw);
      return venue.amenities ?? [];
    } catch {
      return venue.amenities ?? [];
    }
  }

  getInitials(name: string): string {
    if (!name?.trim()) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}