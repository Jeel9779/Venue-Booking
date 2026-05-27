// Purpose: Component/Logic: Handles UI behavior and user interactions for donut-chart.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.css',
})
// Defines the structure and behavior of this class
export class DonutChart {
  @Input() totalAmount: number = 0;
  @Input() activeAmount: number = 0;
  @Input() graceAmount: number = 0;

  get activeDashOffset(): number {
    if (!this.totalAmount) return 377; // empty circle
    // SVG stroke-dasharray is 377. 0 means full circle.
    const activeRatio = this.activeAmount / this.totalAmount;
    return 377 - (377 * activeRatio);
  }

  get graceDashOffset(): number {
    if (!this.totalAmount) return 377;
    // We want the grace circle to represent its slice
    const graceRatio = this.graceAmount / this.totalAmount;
    return 377 - (377 * graceRatio);
  }
}
