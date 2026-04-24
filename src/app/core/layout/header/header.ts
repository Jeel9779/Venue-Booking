import { Component, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, Bell, Menu, Search, ChevronDown, Settings, User, LogOut, LifeBuoy, Plus, Sparkles } from 'lucide-angular';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink],
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



  // not done yet logout
  /*   logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  } */
}
