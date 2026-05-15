import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-card.html',
  styleUrl: './insight-card.css',
})
export class InsightCard {
  @Input() insights: { message: string, priority: string }[] = [];
}
