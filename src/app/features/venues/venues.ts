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
          v.type.toLowerCase().includes(s),
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
    if (img.startsWith('http')) return img;
    const root = 'http://192.168.1.11:3000'; 
    return root + '/' + img.replace(/^\/+/, '');
  }
}
