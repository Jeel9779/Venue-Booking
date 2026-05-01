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
  private readonly venueService = inject(VenueService);
  private readonly venueStore = inject(VenueStore);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly venues = toSignal(this.venueStore.venues$, { initialValue: [] });
  readonly isLoading = toSignal(this.venueStore.isLoading$, { initialValue: false });
  readonly error = toSignal(this.venueStore.error$, { initialValue: null });

  filter = signal<FilterState>('all');
  search = signal('');

  selectedVenue = signal<Venue | null>(null);
  showDetailsModal = signal(false);
  showRejectModal = signal(false);
  showApproveModal = signal(false);

  rejectReason = '';
  previewImage = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredVenues = computed(() => {
    let list = this.venues();

    if (this.filter() !== 'all') {
      list = list.filter((v) => v.status === this.filter());
    }

    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          v.city.toLowerCase().includes(s) ||
          v.type.toLowerCase().includes(s) ||
          v.state.toLowerCase().includes(s) ||
          v.address.toLowerCase().includes(s) ||
          v.status.toLowerCase().includes(s) ||
          String(v.capacity).includes(s) ||
          String(v.pricePerDay).includes(s) ||
          this.getVendorName(v).toLowerCase().includes(s) ||
          this.getVendorEmail(v).toLowerCase().includes(s) ||
          new Date(v.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase().includes(s),
      );
    }

    return list;
  });

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

  // ── Actions ─────────────────────────────────────────────────────────────────
  openDetails(v: Venue) {
    this.selectedVenue.set(v);
    this.showDetailsModal.set(true);
  }

  closeDetails() {
    this.showDetailsModal.set(false);
    this.selectedVenue.set(null);
  }

  confirmApprove() {
    this.showApproveModal.set(true);
  }

  submitApprove() {
    const venue = this.selectedVenue();
    if (!venue?._id) return;

    this.venueService.updateStatus(venue._id, 'approved');
    this.showApproveModal.set(false);
    this.closeDetails();
  }

  openRejectModal() {
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
  }

  submitReject() {
    const venue = this.selectedVenue();
    if (!venue?._id || !this.rejectReason.trim()) return;

    this.venueService.updateStatus(venue._id, 'rejected', this.rejectReason.trim());
    this.showRejectModal.set(false);
    this.closeDetails();
  }

  // ── Image preview ──────────────────────────────────────────────────────────
  openImage(img: string) {
    this.previewImage.set(this.getImageUrl(img));
  }

  closeImage() {
    this.previewImage.set(null);
  }

  getImageUrl(img?: string): string {
    if (!img) return '';
    let url = img.replace(/\\/g, '/'); // Fix Windows paths
    if (url.startsWith('http')) return url;
    const root = 'http://192.168.1.6:3000'; 
    return root + '/' + url.replace(/^\/+/, '');
  }

  handleImageError(event: any) {
    // Fallback to a placeholder icon if the image URL returns 404
    event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2218%22%20height%3D%2218%22%20rx%3D%222%22%20ry%3D%222%22%3E%3C%2Frect%3E%3Ccircle%20cx%3D%228.5%22%20cy%3D%228.5%22%20r%3D%221.5%22%3E%3C%2Fcircle%3E%3Cpolyline%20points%3D%2221%2015%2016%2010%205%2021%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E';
  }

  // ── Vendor helpers ─────────────────────────────────────────────────────────
  getVendorName(v: Venue): string {
    if (typeof v.vendorId === 'object' && v.vendorId?.fullName) {
      return v.vendorId.fullName;
    }
    return '—';
  }

  getVendorEmail(v: Venue): string {
    if (typeof v.vendorId === 'object' && v.vendorId?.email) {
      return v.vendorId.email;
    }
    return '—';
  }
}
