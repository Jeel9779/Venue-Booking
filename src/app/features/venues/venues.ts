import { Component , OnInit , signal } from '@angular/core';
import { CommonModule } from '@angular/common';
 
import { VenueService, Venue } from './venue-service';



@Component({
  selector: 'app-venues',
  imports: [CommonModule],
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues implements OnInit {

  venues = signal<Venue[]>([]);
  isLoading = signal(false);

  constructor(private venueService: VenueService) {}

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

}
