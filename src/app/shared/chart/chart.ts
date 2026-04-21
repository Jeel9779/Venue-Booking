import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  imports: [CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class Chart {
  @Input() data: number[] = [40, 60, 55, 70, 85, 65, 45, 50, 90, 30];
}
