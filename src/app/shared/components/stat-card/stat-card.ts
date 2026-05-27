// Purpose: Component/Logic: Handles UI behavior and user interactions for stat-card.
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
// Defines the structure and behavior of this class
export class StatCard {
  @Input() title!: string;
  @Input() value!: any;
  @Input() change!: string;
  @Input() color!: string;
  @Input() icon: string = 'activity';

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
