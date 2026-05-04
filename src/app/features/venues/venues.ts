import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { VenueService } from '../../core/services/venue.service';
import { VenueStore } from '../../core/store/venue.store';
import { Venue, FilterState } from '../../core/models/venue.model';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Table } from '../../shared/components/table/table';
import { Model } from '../../shared/components/model/model';
import { FormInput } from '../../shared/components/form-input/form-input';

@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Table, Model, FormInput],
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues implements OnInit {

  // ── Dependencies ─────────────────────────────────────────────────────────
  /** Service for performing CRUD operations on venues */
  private readonly venueService = inject(VenueService);
  /** SignalStore for managing and persisting venue state */
  private readonly venueStore = inject(VenueStore);


  // ── State (Reactive Signals) ─────────────────────────────────────────────
  /** The full list of venues synced from the Store */
  readonly venues = toSignal(this.venueStore.venues$, { initialValue: [] });

  /** Loading state indicator for API calls */
  readonly isLoading = toSignal(this.venueStore.isLoading$, { initialValue: false });

  /** Error message if any operation fails */
  readonly error = toSignal(this.venueStore.error$, { initialValue: null });

  /** Current active filter ('all', 'pending', 'approved', 'rejected') */
  filter = signal<FilterState>('all');
  /** Current search query string */
  search = signal('');

  /** Currently selected venue for viewing details or taking action */
  selectedVenue = signal<Venue | null>(null);

  /** Modal visibility states */
  showDetailsModal = signal(false);
  showRejectModal = signal(false);
  showApproveModal = signal(false);

  /** Reason for rejecting a venue (required for rejection) */
  rejectReason = '';

  /** URL for the image currently being previewed in full-screen */
  previewImage = signal<string | null>(null);

  // ── Computed Signals (Derived State) ─────────────────────────────────────
  /** 
   * Dynamically filters and searches the venue list based on the 
   * 'filter' and 'search' signals. This updates automatically.
   */
  filteredVenues = computed(() => {
    let list = this.venues();

    // 1. Filter by Status (Pending/Approved/Rejected)
    if (this.filter() !== 'all') {
      list = list.filter((v) => v.status === this.filter());
    }

    // 2. Filter by Search Query (Case-insensitive search across multiple fields)
    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          v.city.toLowerCase().includes(s) ||
          v.type.toLowerCase().includes(s) ||
          v.state.toLowerCase().includes(s) ||
          v.address.toLowerCase().includes(s) ||
          v.zip?.toLowerCase().includes(s) ||
          v.country?.toLowerCase().includes(s) ||
          v.description?.toLowerCase().includes(s) ||
          v.status.toLowerCase().includes(s) ||
          String(v.capacity).includes(s) ||
          String(v.pricePerDay).includes(s) ||
          this.getVendorName(v).toLowerCase().includes(s) ||
          this.getVendorEmail(v).toLowerCase().includes(s) ||
          v.amenities?.some(a => a.toLowerCase().includes(s)) ||
          new Date(v.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase().includes(s),
      );
    }

    return list;
  });

  /** Calculates the count of venues for each status chip in the header. */
  counts = computed(() => {
    const list = this.venues();
    return {
      all: list.length,
      pending: list.filter((v) => v.status === 'pending').length,
      approved: list.filter((v) => v.status === 'approved').length,
      rejected: list.filter((v) => v.status === 'rejected').length,
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.venueService.loadAll();
  }

  // ── Actions (Methods) ───────────────────────────────────────────────────────
  /** Opens the full details modal for a specific venue. */
  openDetails(v: Venue) {
    this.selectedVenue.set(v);
    this.showDetailsModal.set(true);
  }

  /**  Closes the details modal and clears the selection.*/
  closeDetails() {
    this.showDetailsModal.set(false);
    this.selectedVenue.set(null);
  }

  /**  Opens the confirmation modal for approving a venue. */
  confirmApprove() {
    this.showApproveModal.set(true);
  }

  /** Finalizes the approval process by calling the service. */
  submitApprove() {
    const venue = this.selectedVenue();
    if (!venue?._id) return;

    this.venueService.updateStatus(venue._id, 'approved');
    this.showApproveModal.set(false);
    this.closeDetails();
  }

  /**  Opens the rejection modal to collect a reason. */
  openRejectModal() {
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  /** Closes the rejection modal. */
  closeRejectModal() {
    this.showRejectModal.set(false);
  }

  /**  Finalizes the rejection process by calling the service with a reason. */
  submitReject() {
    const venue = this.selectedVenue();
    if (!venue?._id || !this.rejectReason.trim()) return;

    this.venueService.updateStatus(venue._id, 'rejected', this.rejectReason.trim());
    this.showRejectModal.set(false);
    this.closeDetails();
  }

  // ── Image Helpers ──────────────────────────────────────────────────────────
  /** 
   * Sets the image for full-screen preview.
   */
  openImage(img: string) {
    this.previewImage.set(this.getImageUrl(img));
  }

  /** 
   * Closes the image preview.
   */
  closeImage() {
    this.previewImage.set(null);
  }

  /** 
   * Sanitizes and constructs the full image URL.
   * Fixes backslashes and ensures the root server URL is prefixed.
   */
  getImageUrl(img?: string): string {
    if (!img) return '';
    let url = img.replace(/\\/g, '/'); // Fix Windows paths for cross-platform compatibility
    if (url.startsWith('http')) return url;
    const root = 'http://192.168.1.6:3000';
    return root + '/' + url.replace(/^\/+/, '');
  }

  /** 
   * Fallback handler if an image fails to load. Sets a placeholder SVG.
   */
  handleImageError(event: any) {
    event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2218%22%20height%3D%2218%22%20rx%3D%222%22%20ry%3D%222%22%3E%3C%2Frect%3E%3Ccircle%20cx%3D%228.5%22%20cy%3D%228.5%22%20r%3D%221.5%22%3E%3C%2Fcircle%3E%3Cpolyline%20points%3D%2221%2015%2016%2010%205%2021%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E';
  }

  // ── Vendor Data Helpers ────────────────────────────────────────────────────
  /** 
   * Safely extracts the vendor's full name, handling both string IDs and populated objects.
   */
  getVendorName(v: Venue): string {
    if (typeof v.vendorId === 'object' && v.vendorId?.fullName) {
      return v.vendorId.fullName;
    }
    return '—';
  }

  /** 
   * Safely extracts the vendor's email address.
   */
  getVendorEmail(v: Venue): string {
    if (typeof v.vendorId === 'object' && v.vendorId?.email) {
      return v.vendorId.email;
    }
    return '—';
  }
}
