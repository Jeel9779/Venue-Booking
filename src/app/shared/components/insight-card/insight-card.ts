// Purpose: Component/Logic: Handles UI behavior and user interactions for insight-card.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-card.html',
  styleUrl: './insight-card.css',
})
// Defines the structure and behavior of this class
export class InsightCard {
  @Input() insights: { message: string, priority: string }[] = [];
}
