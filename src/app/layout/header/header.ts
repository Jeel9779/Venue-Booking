import { Component, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Bell , Menu } from 'lucide-angular';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
   @Output() menuClick = new EventEmitter<void>();
    icons = {
    bell: Bell,
    menu: Menu 
  };
}
