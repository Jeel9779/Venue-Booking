import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueStoreService } from '../../core/store/venue-store.service';
import { AdminVenueService } from '../../core/services/admin-venue.service';
import { Venue } from '../../core/models/venue-types.modal';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css',
})
export class Partners implements OnInit {

  /*   store = inject(VenueStoreService);
    adminService = inject(AdminVenueService); */

  private store = inject(VenueStoreService);
  private adminService = inject(AdminVenueService);

  vm = this.store.vm;
  loading = this.store.loading;
  error = this.store.error;
  reload() {
    this.store.load();
  }

  expandedMap: Record<string, boolean> = {};
  selectedVenue = signal<Venue | null>(null);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  chartData = computed(() =>
    this.vm().partners.map(p => ({
      label: p.name || ('Vendor ' + p.id.slice(0, 6)),
      value: p.spaces.length,
      approved: p.spaces.filter(s => s.status === 'approved').length,
      pending: p.spaces.filter(s => s.status === 'pending').length,
      rejected: p.spaces.filter(s => s.status === 'rejected').length,
    }))
  );

  maxVenues = computed(() =>
    Math.max(...this.vm().partners.map(p => p.spaces.length), 1)
  );

  ngOnInit() {
    this.store.load();


  }

  toggle(id: string) {
    this.expandedMap[id] = !this.expandedMap[id];
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
    this.adminService.approveVenue(venue._id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.store.refresh();
        this.closeModal();
      },
      error: err => {
        this.actionError.set(err?.message || 'Approve failed.');
        this.actionLoading.set(false);
      },
    });
  }

  reject() {
    const venue = this.selectedVenue();
    if (!venue) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    this.actionLoading.set(true);
    this.actionError.set(null);
    this.adminService.rejectVenue(venue._id, reason).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.store.refresh();
        this.closeModal();
      },
      error: err => {
        this.actionError.set(err?.message || 'Reject failed.');
        this.actionLoading.set(false);
      },
    });
  }

  deleteVenue(venue: Venue, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${venue.name}"? This cannot be undone.`)) return;
    this.adminService.deleteVenue(venue._id).subscribe({
      next: () => this.store.refresh(),
      error: err => alert(err?.message || 'Delete failed.'),
    });
  }

  getStatus(status: string): string {
    const map: Record<string, string> = {
      approved: 'APPROVED',
      pending: 'PENDING',
      rejected: 'REJECTED',
    };
    return map[status] ?? status.toUpperCase();
  }

  getVendorStatus(spaces: Venue[]): string {
    if (spaces.some(s => s.status === 'pending')) return 'PENDING';
    if (spaces.every(s => s.status === 'rejected')) return 'REJECTED';
    return 'ACTIVE';
  }

  getVendorInitial(id: string): string {
    return id.slice(0, 1).toUpperCase();
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
}