import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
/* import { BarChart3, Building2, Calendar, HelpCircle, LayoutDashboard, LogOut, LucideAngularModule, Plus, Settings, Users } from 'lucide-angular/src/icons'; */
import { Router } from '@angular/router';

import {
  LucideAngularModule,
  LayoutDashboard,
  Building2,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Plus,
  HelpCircle,
  LogOut,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  icons = {
    dashboard: LayoutDashboard,
    venues: Building2,
    bookings: Calendar,
    analytics: BarChart3,
    settings: Settings,
    users: Users,
    add: Plus,
    help: HelpCircle,
    logout: LogOut,
  };

  /*   toggle() {
    this.isOpen.update((v) => !v);
  } */

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();


  /* Login  */
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('admin');
    this.router.navigate(['/login']);
  }
}
