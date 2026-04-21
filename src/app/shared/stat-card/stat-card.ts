import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() title!: string;
  @Input() value!: any;
  @Input() change!: string;
  @Input() color!: string;

  get bg() {
    return `bg-${this.color}-100 p-2 rounded-lg`;
  }
  get text() {
    return this.color === 'red' ? 'text-red-500' : 'text-green-600';
  }
  get bar() {
    return `bg-${this.color}-500 w-3/4`;
  }
}
