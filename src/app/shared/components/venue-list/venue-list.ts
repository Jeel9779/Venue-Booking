// Purpose: Component/Logic: Handles UI behavior and user interactions for venue-list.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venue-list',
  imports: [CommonModule],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.css',
})
// Defines the structure and behavior of this class
export class VenueList {
  @Input() venues: any[] = [];
}
