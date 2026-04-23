import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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

  // icon-only on mobile & tablet, full on desktop
  collapsed = signal(window.innerWidth < 1024);

  openGroup = signal<string | null>('main');

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

  constructor(private router: Router) {
    // update collapsed state on resize
    window.addEventListener('resize', () => {
      this.collapsed.set(window.innerWidth < 1024);
    });
  }

  toggleSidebar() {
    this.collapsed.update(v => !v);
  }

  toggleGroup(name: string) {
    this.openGroup.update(v => v === name ? null : name);
  }

  logout() {
    localStorage.removeItem('adminId');
    this.router.navigate(['/login']);
  }
}