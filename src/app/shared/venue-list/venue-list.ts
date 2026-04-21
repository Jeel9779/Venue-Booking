import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venue-list',
  imports: [CommonModule],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.css',
})
export class VenueList {
  @Input() venues: any[] = [];
}
