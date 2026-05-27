// Purpose: Component/Logic: Handles UI behavior and user interactions for chart.
import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
// Defines the structure and behavior of this class
export class Chart {
  @Input() title: string = 'Analytics';
  @Input() description: string = 'Overview of data';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];

  // ── Derived Analytics ──
  get maxVal(): number {
    return Math.max(...this.data, 10); // Minimum scale of 10
  }

  get yAxisLabels(): number[] {
    const max = this.maxVal;
    return [max, Math.floor(max * 0.75), Math.floor(max * 0.5), Math.floor(max * 0.25), 0];
  }

  getPercentage(val: number): number {
    return (val / this.maxVal) * 100;
  }
}
