// Purpose: Component/Logic: Handles UI behavior and user interactions for header.
import { Component, Output, EventEmitter, inject, OnInit, signal, computed, HostListener, ElementRef } from '@angular/core';
import { 
  LucideAngularModule, Bell, Menu, Search, ChevronDown, Settings, User, LogOut, 
  LifeBuoy, Plus, Sparkles, X, ChevronRight, CornerDownLeft, Command, 
  Activity, Building2, Store, Calendar, ListChecks, DollarSign, LayoutDashboard, Users,
  MessageSquare, AlertTriangle, FileText, Handshake, Repeat, CreditCard, BookOpen
} from 'lucide-angular';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { VenueService } from '@core/services/venue.service';
import { VenueStore } from '@core/store/venue.store';
import { VendorService } from '@core/services/vendor.service';
import { VendorStore } from '@core/store/vendor.store';
import { UserService } from '@core/services/user.service';
import { UsersStore } from '@core/store/users.store';
import { ToastService } from '@core/services/toast.service';
import { BookingStore } from '@core/store/booking.store';
import { PaymentStore } from '@core/store/payment.store';
import { ReviewStore } from '@core/store/review.store';
import { ComplaintStore } from '@core/store/complaint.store';
import { BlogStore } from '@core/store/blog.store';
import { PartnerStore } from '@core/store/partner.store';
import { SubscriptionStore } from '@core/store/subscription.store';

// Defines the data model structure
export interface SearchItem {
  title: string;
  subtitle?: string;
  path: string;
  category: string;
  icon: string;
  raw?: any;
}

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
// Defines the structure and behavior of this class
export class Header implements OnInit {
  @Output() menuClick = new EventEmitter<void>();
  
  private router = inject(Router);
  private el = inject(ElementRef);
  private venueService = inject(VenueService);
  private venueStore = inject(VenueStore);
  private vendorService = inject(VendorService);
  private vendorStore = inject(VendorStore);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private usersStore = inject(UsersStore);
  private bookingStore = inject(BookingStore);
  private paymentStore = inject(PaymentStore);
  private reviewStore = inject(ReviewStore);
  private complaintStore = inject(ComplaintStore);
  private blogStore = inject(BlogStore);
  private partnerStore = inject(PartnerStore);
  private subscriptionStore = inject(SubscriptionStore);

  // Real admin data signals
  adminName = signal<string>('Jeel Vadukiya');
  adminEmail = signal<string>('jeel@bookmyvenue.com');
  adminRole = signal<string>('PRINCIPAL ADMIN');

  // Spotlight Omni-Search Palette State
  showSearchPalette = signal(false);
  searchQuery = signal('');
  activeIndex = signal(0);

  // Static Navigation Shortcuts
  readonly navLinks: SearchItem[] = [
    { title: 'Overview Dashboard', path: '/dashboard', category: '✨ Shortcuts', icon: 'layoutDashboard', subtitle: 'System Overview' },
    { title: 'Venues Directory', path: '/venues', category: '✨ Shortcuts', icon: 'building', subtitle: 'Properties List' },
    { title: 'Vendors Directory', path: '/vendors', category: '✨ Shortcuts', icon: 'store', subtitle: 'Partner List' },
    { title: 'User Reviews Moderation', path: '/user-review', category: '✨ Shortcuts', icon: 'users', subtitle: 'Ratings & Reviews' },
    { title: 'Bookings Calendar', path: '/bookings', category: '✨ Shortcuts', icon: 'calendar', subtitle: 'Reservations' },
    { title: 'Pricing & Plans', path: '/plans', category: '✨ Shortcuts', icon: 'listChecks', subtitle: 'Plans & Pricing' },
    { title: 'Subscription Monitor', path: '/admin/vendor-subscriptions', category: '✨ Shortcuts', icon: 'activity', subtitle: 'Partner Subscriptions' },
    { title: 'Payment Analytics', path: '/payment', category: '✨ Shortcuts', icon: 'dollarSign', subtitle: 'Transactions Log' }
  ];

  // Dynamic Unified Computed Search Selector
  readonly filteredResults = computed<SearchItem[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();

    const venues: SearchItem[] = this.venueStore.venues().map(v => {
      const contact = typeof v.vendorId === 'object' && v.vendorId ? ` • ${v.vendorId.phone || v.vendorId.email}` : '';
      return {
        title: v.name,
        subtitle: `${v.type} • ${v.city}${contact}`,
        path: '/venues',
        category: '🏨 Registered Venues',
        icon: 'building',
        raw: v
      };
    });

    const vendors: SearchItem[] = this.vendorStore.vendors().map(v => ({
      title: v.fullName || v.businessName || 'Unnamed Vendor',
      subtitle: `${v.businessName || 'No business'} • ${v.email} • ${v.phone || 'No phone'}`,
      path: '/vendors',
      category: '🏢 Registered Vendors',
      icon: 'store',
      raw: v
    }));

    const users: SearchItem[] = this.usersStore.snapshot.users.map((u: any) => ({
        title: u.name,
        subtitle: `${u.email} • ${u.phone || 'No phone'}`,
        path: '/users',
        category: '👤 Registered Users',
        icon: 'users',
        raw: u
      }));

    const bookings: SearchItem[] = this.bookingStore.bookings().map((b: any) => ({
        title: `Booking #${b._id?.slice(-6) || 'Unknown'}`,
        subtitle: `${b.status} • ₹${b.cost}`,
        path: '/bookings',
        category: '📅 Bookings',
        icon: 'calendar',
        raw: b
    }));

    const payments: SearchItem[] = this.paymentStore.snapshot.payments.map((p: any) => ({
        title: `Payment #${p._id?.slice(-6) || 'Unknown'}`,
        subtitle: `${p.status} • ₹${p.amount}`,
        path: '/payment',
        category: '💳 Payments',
        icon: 'creditCard',
        raw: p
    }));

    const reviews: SearchItem[] = this.reviewStore.reviews().map((r: any) => ({
        title: r.rating ? `${r.rating} Star Review` : 'User Review',
        subtitle: `${r.reviewText?.slice(0, 50) || 'No text'}`,
        path: '/user-review',
        category: '⭐ Reviews',
        icon: 'messageSquare',
        raw: r
    }));

    const complaints: SearchItem[] = this.complaintStore.complaints().map((c: any) => ({
        title: `Complaint: ${c.subject || 'No Subject'}`,
        subtitle: `${c.status} • ${c.description?.slice(0, 50)}`,
        path: '/complain',
        category: '⚠️ Complaints',
        icon: 'alertTriangle',
        raw: c
    }));

    const blogs: SearchItem[] = this.blogStore.blogs().map((b: any) => ({
        title: b.title,
        subtitle: `By ${b.author || 'Unknown'}`,
        path: '/blogs',
        category: '📝 Blogs',
        icon: 'fileText',
        raw: b
    }));

    const partners: SearchItem[] = this.partnerStore.partners().map((p: any) => ({
        title: p.companyName || p.name,
        subtitle: `${p.email} • ${p.phone || 'No phone'}`,
        path: '/partners',
        category: '🤝 Partners',
        icon: 'handshake',
        raw: p
    }));

    const subscriptions: SearchItem[] = this.subscriptionStore.allSubscriptions().map((s: any) => ({
        title: `Sub: ${s.planName || 'Plan'}`,
        subtitle: `${s.status} • ${s.billingCycle}`,
        path: '/admin/vendor-subscriptions',
        category: '🔄 Subscriptions',
        icon: 'repeat',
        raw: s
    }));

    const allItems: SearchItem[] = [
      ...this.navLinks, ...venues, ...vendors, ...users,
      ...bookings, ...payments, ...reviews, ...complaints,
      ...blogs, ...partners, ...subscriptions
    ];

    if (!q) {
      // If query is empty, show navigation shortcuts as default selection!
      return this.navLinks;
    }

    return allItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle && item.subtitle.toLowerCase().includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      
      // Deep matching on raw entity fields (Phone, Email, Business Name, Pin code, etc.)
      let rawMatch = false;
      if (item.raw) {
        const r = item.raw;
        const fieldsToSearch = [
          r.fullName, r.businessName, r.email, r.phone, r.address, 
          r.city, r.state, r.pincode, r.pinCode, r.name, r.type, r.zip
        ];
        
        // Match on nested vendor details in venue model if present
        if (typeof r.vendorId === 'object' && r.vendorId) {
          fieldsToSearch.push(
            r.vendorId.fullName, r.vendorId.businessName, r.vendorId.email, r.vendorId.phone
          );
        }
        
        rawMatch = fieldsToSearch.some(field => 
          field && String(field).toLowerCase().includes(q)
        );
      }
      
      return titleMatch || subtitleMatch || categoryMatch || rawMatch;
    });
  });

  getIcon(name: string): any {
    return (this.icons as Record<string, any>)[name] || this.icons.search;
  }

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
    sparkles: Sparkles,
    x: X,
    chevronRight: ChevronRight,
    cornerDownLeft: CornerDownLeft,
    command: Command,
    layoutDashboard: LayoutDashboard,
    building: Building2,
    store: Store,
    calendar: Calendar,
    listChecks: ListChecks,
    dollarSign: DollarSign,
    users: Users,
    activity: Activity,
    messageSquare: MessageSquare,
    alertTriangle: AlertTriangle,
    fileText: FileText,
    handshake: Handshake,
    repeat: Repeat,
    creditCard: CreditCard,
    bookOpen: BookOpen
  };

  ngOnInit() {
    // 1. Fetch live admin session details
    const adminDataStr = localStorage.getItem('admin');
    if (adminDataStr) {
      try {
        const admin = JSON.parse(adminDataStr);
        if (admin) {
          const rawName = admin.fullName || admin.name || admin.username || 'admin';
          const displayName = rawName === 'admin' ? 'Jeel Vadukiya' : rawName.charAt(0).toUpperCase() + rawName.slice(1);
          this.adminName.set(displayName);

          const email = admin.email || (admin.username === 'admin' ? 'jeel@bookmyvenue.com' : `${admin.username}@bookmyvenue.com`);
          this.adminEmail.set(email);

          const role = admin.role || 'admin';
          this.adminRole.set(role === 'admin' ? 'PRINCIPAL ADMIN' : `${role.toUpperCase()} ADMIN`);
        }
      } catch (e) {
        console.error('Error parsing admin data', e);
      }
    }

    // 2. Pre-cache Venues, Vendors and Users into memory for instant global search!
    this.venueService.loadAll();
    this.vendorService.loadAll(1, 100);
    this.userService.loadAll(1, 100);
  }

  // ⌨️ KEYBOARD SHORTCUT HOST LISTENER (Ctrl+K / Cmd+K / Arrows / Enter / Esc)
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Toggle Search Palette with Ctrl + K or Cmd + K
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleSearchPalette();
    }
    
    // Process keyboard navigation if palette is active
    if (this.showSearchPalette()) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.activeIndex.update(idx => (idx === this.filteredResults().length - 1 ? 0 : idx + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.activeIndex.update(idx => (idx === 0 ? this.filteredResults().length - 1 : idx - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selected = this.filteredResults()[this.activeIndex()];
        if (selected) {
          this.selectItem(selected);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.closeSearchPalette();
      }
    }
  }

  toggleSearchPalette() {
    this.showSearchPalette.update(val => !val);
    if (this.showSearchPalette()) {
      this.searchQuery.set('');
      this.activeIndex.set(0);
      setTimeout(() => {
        const el = document.getElementById('palette-input');
        if (el) el.focus();
      }, 50);
    }
  }

  closeSearchPalette() {
    this.showSearchPalette.set(false);
  }

  selectItem(item: any) {
    this.closeSearchPalette();
    this.router.navigate([item.path]);
  }

  // Modal state
  showLogoutModal = signal(false);
  isDropdownOpen = signal(false);

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }

  // Restored logout method for template binding
  logout() {
    this.isDropdownOpen.set(false);
    this.showLogoutModal.set(true);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin');
    this.showLogoutModal.set(false);
    this.router.navigate(['/login']);
  }
}
