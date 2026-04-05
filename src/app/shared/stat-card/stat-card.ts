import { Component, input,  } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  title = input<string>();
  value = input<string>();
  change = input<string>();
  icon = input<string>();
  highlight = input<boolean>(false);
}
