import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PartnerStore } from '../../core/store/partner.store'; 
import { PartnerService } from '../../core/services/partner.service';
import { Venue } from '../../core/models/venue.model';
import { Model } from '../../shared/components/model/model';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, Model, Button, Card],
  templateUrl: './partners.html',
  styleUrl: './partners.css',
})
export class Partners implements OnInit {
  private readonly store = inject(PartnerStore);
  private readonly service = inject(PartnerService);

  readonly partners = this.store.partners;
  readonly kpi = this.store.kpi;
  readonly loading = this.store.isLoading;
  readonly error = this.store.error;

  expandedMap: Record<string, boolean> = {};
  selectedVenue = signal<Venue | null>(null);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  chartData = computed(() =>
    this.partners().map(p => ({
      label: p.name || ('Vendor ' + p.id.slice(0, 6)),
      value: p.spaces.length,
      approved: p.spaces.filter(s => s.status === 'approved').length,
      pending: p.spaces.filter(s => s.status === 'pending').length,
      rejected: p.spaces.filter(s => s.status === 'rejected').length,
    }))
  );

  maxVenues = computed(() =>
    Math.max(...this.partners().map(p => p.spaces.length), 1)
  );

  ngOnInit() {
    this.service.loadAll();
  }

  reload() {
    this.service.loadAll();
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

  reject() {
    const venue = this.selectedVenue();
    if (!venue) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    this.actionLoading.set(true);
    this.actionError.set(null);

    this.service.rejectVenue(venue._id, reason, 
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

  deleteVenue(venue: Venue, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${venue.name}"? This cannot be undone.`)) return;
    
    this.service.deleteVenue(venue._id, 
      () => {},
      (err) => alert(err)
    );
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