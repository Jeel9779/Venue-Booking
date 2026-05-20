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
  Store,
  MapPin,
  Plus,
  HelpCircle,
  LogOut,
  ListChecks,
  Activity
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  // icon-only on mobile & tablet, full on desktop
  // signals used for collapse and expand
  collapsed = signal(window.innerWidth < 1024);
  openGroup = signal<string | null>('main');

  //icon
  icons = {
    dashboard: LayoutDashboard,
    venues: Building2,
    bookings: Calendar,
    analytics: BarChart3,
    settings: Settings,
    users: Users,
    vendors: Store,
    partners: MapPin,
    add: Plus,
    help: HelpCircle,
    logout: LogOut,
    plans: ListChecks,
    subscriptions: Activity
  };

  //constructor for router and window resize
  constructor(private router: Router) {
    // update collapsed state on resize
    window.addEventListener('resize', () => {
      this.collapsed.set(window.innerWidth < 1024);
    });
  }


  //expand/collapse sidebar
  toggleSidebar() {
    this.collapsed.update(v => !v);
  }

  // Open/close sections (Main, Management, etc.)
  toggleGroup(name: string) {
    this.openGroup.update(v => v === name ? null : name);
  }

  // logout
  logout() {
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin');
    this.router.navigate(['/login']);
  }
}