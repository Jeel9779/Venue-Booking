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
  ListChecks
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  @Input() isOpen: boolean = true;
  @Output() close = new EventEmitter<void>();

  collapsed = signal(false);
  openGroup = signal<string | null>('main');

  // icon 
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
    subscript: ListChecks
  };

  constructor(private router: Router) { }

  toggleSidebar() {
    this.collapsed.update(v => !v);
  }

  toggleGroup(name: string) {
    this.openGroup.update(v => v === name ? null : name);
  }

  /* log out  */
  logout() {
    localStorage.removeItem('adminId');
    this.router.navigate(['/login']);
  }
}
