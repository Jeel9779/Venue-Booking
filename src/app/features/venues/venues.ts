import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VenueService, Venue } from './venue-service';



@Component({
  selector: 'app-venues',
  imports: [CommonModule],
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues implements OnInit {
  /*    openRejectModal(_t18: Venue) {
      throw new Error('Method not implemented.');
    }  */

  showRejectModal = signal(false);
  rejectReason = signal('');
  selectedVenue = signal<Venue | null>(null);
  venues = signal<Venue[]>([]);
  isLoading = signal(false);


  constructor(private venueService: VenueService) { }

  openRejectModal(v: Venue) {
    this.selectedVenue.set(v);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }
  ngOnInit() {
    this.loadVenues();
  }

  loadVenues() {
    this.isLoading.set(true);

    this.venueService.getVenues().subscribe(data => {
      this.venues.set(data);
      this.isLoading.set(false);
    });
  }

  approve(v: Venue) {
    this.venueService.updateVenue(v.id, {
      status: 'approved',
      adminMessage: 'Approved by admin'
    }).subscribe(() => this.loadVenues());
  }

  reject(v: Venue) {
    this.venueService.updateVenue(v.id, {
      status: 'rejected',
      adminMessage: 'Rejected by admin'
    }).subscribe(() => this.loadVenues());
  }

  reopen(v: Venue) {
    this.venueService.updateVenue(v.id, {
      status: 'pending',
      adminMessage: ''
    }).subscribe(() => this.loadVenues());
  }
  confirmReject() {
    const v = this.selectedVenue();

    if (!v) return;

    this.venueService.updateVenue(v.id, {
      status: 'rejected',
      adminMessage: this.rejectReason() || 'Rejected by admin'
    }).subscribe(() => {
      this.showRejectModal.set(false);
      this.loadVenues();
    });
  }

}
