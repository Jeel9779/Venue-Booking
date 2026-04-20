import { Component, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Bell, Menu, Search, ChevronDown, Settings, User, LogOut, LifeBuoy, Plus, Sparkles } from 'lucide-angular';
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
    menu: Menu,
    search: Search,
    chevronDown: ChevronDown,
    settings: Settings,
    user: User,
    logOut: LogOut,
    lifeBuoy: LifeBuoy,
    plus: Plus,
    sparkles: Sparkles
  };
}
