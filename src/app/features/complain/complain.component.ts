// Purpose: Component/Logic: Handles UI behavior and user interactions for complaint management.
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  User, 
  Building2, 
  Store, 
  Image as ImageIcon, 
  RefreshCw, 
  X, 
  MessageSquare, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-angular';
import { ComplaintService } from '@core/services/complaint.service';
import { ComplaintStore } from '@core/store/complaint.store';
import { VendorService } from '@core/services/vendor.service';
import { VendorStore } from '@core/store/vendor.store';
import { Complaint } from '@core/models/complaint.model';
import { Pagination } from '@shared/components/pagination/pagination';
import { API_BASE_URL } from '@core/config/api.config';
import { forkJoin } from 'rxjs';
import { ComplaintApi } from '@core/api/complaint-api';
 
@Component({
  selector: 'app-complain',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Pagination],
  templateUrl: './complain.component.html',
  styleUrls: ['./complain.component.css'],
})
export class ComplainComponent implements OnInit {
  icons = {
    alertTriangle: AlertTriangle,
    checkCircle: CheckCircle2,
    trendingUp: TrendingUp,
    ban: XCircle,
    alertCircle: AlertCircle,
    arrowRight: ArrowRight,
    send: Send,
    user: User,
    building: Building2,
    store: Store,
    image: ImageIcon,
    refresh: RefreshCw,
    close: X,
    message: MessageSquare,
    shieldAlert: ShieldAlert,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronDown: ChevronDown
  };

  private readonly complaintService = inject(ComplaintService);
  private readonly complaintStore = inject(ComplaintStore);
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);
  private readonly complaintApi = inject(ComplaintApi);

  filterCounts = signal<{ [key: string]: number }>({
    'All': 0,
    'Open': 0,
    'In Progress': 0,
    'Resolved': 0,
    'Closed': 0
  });

  // Expose signals from store
  allComplaints = this.complaintStore.complaints;
  pagination = this.complaintStore.pagination;
  isLoading = this.complaintStore.isLoading;
  error = this.complaintStore.error;

  clearedCasesCount = this.complaintStore.clearedCasesCount;
  activeCasesCount = this.complaintStore.activeCasesCount;
  activities = this.complaintStore.enforcementActivities;

  // Active filters in local component context
  currentFilter = this.complaintStore.statusFilter;
  searchQuery = signal<string>('');

  // Frontend filtering to guarantee search/filter works perfectly
  complaints = computed(() => {
    let list = this.allComplaints();
    const search = this.searchQuery().toLowerCase().trim();
    const status = this.currentFilter();

    if (status !== 'All') {
      list = list.filter(c => c.status === status);
    }

    if (search) {
      list = list.filter(c => {
        const venueName = c.venue?.name || 'General Platform Service';
        const userName = c.user?.name || 'Unknown Client';
        
        return c.title?.toLowerCase().includes(search) || 
               c.description?.toLowerCase().includes(search) ||
               venueName.toLowerCase().includes(search) ||
               userName.toLowerCase().includes(search) ||
               c._id?.toLowerCase().includes(search) ||
               c.status?.toLowerCase().includes(search);
      });
    }

    const page = this.pagination()?.page || 1;
    const limit = this.pagination()?.limit || 10;
    return list.length > limit ? list.slice((page - 1) * limit, page * limit) : list;
  });

  // Dropdown list of vendors for assignment
  vendors = computed(() => this.vendorStore.vendors().filter(v => v.status === 'approved'));

  // Drawer / Modals & States
  isDrawerOpen = signal<boolean>(false);
  viewingImageUrl = signal<string | null>(null);
  activeComplaint = this.complaintStore.selectedComplaint;
  messages = this.complaintStore.messages;
  
  // Chat message model
  replyText = signal<string>('');
  
  // Select vendor ID for assignment dropdown
  selectedVendorId = signal<string>('');

  // Dropdown UI states for premium custom selects (resolving OS-picker visual constraints)
  isVendorDropdownOpen = signal<boolean>(false);
  isStatusDropdownOpen = signal<boolean>(false);

  toggleVendorDropdown(): void {
    this.isVendorDropdownOpen.update(o => !o);
    this.isStatusDropdownOpen.set(false);
  }

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen.update(o => !o);
    this.isVendorDropdownOpen.set(false);
  }

  getSelectedVendorName(): string {
    const id = this.selectedVendorId();
    if (!id) return 'Unassigned (No Vendor Allocated)';
    const foundVendor = this.vendors().find(v => v._id === id);
    if (!foundVendor) return 'Unassigned (No Vendor Allocated)';
    return this.formatVendorOption(foundVendor);
  }

  getSelectedStatusName(): string {
    const status = this.activeComplaint()?.status;
    if (status === 'Open') return 'Open (Pending Assignment)';
    if (status === 'In Progress') return 'In Progress (Investigation)';
    if (status === 'Resolved') return 'Resolved (Settled)';
    if (status === 'Closed') return 'Closed (Archived)';
    return 'Select Stage';
  }

  selectStatus(newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    const complaint = this.activeComplaint();
    if (complaint && newStatus) {
      this.complaintService.changeStatus(complaint._id, newStatus);
      setTimeout(() => this.loadFilterCounts(), 600);
    }
    this.isStatusDropdownOpen.set(false);
  }

  selectVendor(vendorId: string): void {
    const complaint = this.activeComplaint();
    if (complaint) {
      if (!vendorId) {
        this.complaintService.assign(complaint._id, null, null);
        this.selectedVendorId.set('');
      } else {
        const foundVendor = this.vendors().find(v => v._id === vendorId);
        const vendorDetails = foundVendor ? {
          _id: foundVendor._id,
          fullName: foundVendor.fullName,
          businessName: foundVendor.businessName,
          email: foundVendor.email
        } : undefined;

        this.complaintService.assign(complaint._id, vendorId, vendorDetails);
        this.selectedVendorId.set(vendorId);
      }
    }
    this.isVendorDropdownOpen.set(false);
  }

  // Formats vendor option text to keep layout clean and responsive
  formatVendorOption(vendor: any): string {
    const name = vendor.businessName || vendor.fullName || 'Unknown Vendor';
    const email = vendor.email || '';
    
    // Check if we have long text and truncate appropriately
    const displayName = name.length > 20 ? name.substring(0, 18) + '...' : name;
    const displayEmail = email.length > 18 ? email.substring(0, 15) + '...' : email;
    
    return email ? `${displayName} (${displayEmail})` : displayName;
  }



  loadFilterCounts(): void {
    this.complaintApi.getComplaints(1, 1000, '', 'all').subscribe({
      next: (res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res.data || []);
        this.filterCounts.set({
          'All': list.length,
          'Open': list.filter(c => c.status === 'Open').length,
          'In Progress': list.filter(c => c.status === 'In Progress').length,
          'Resolved': list.filter(c => c.status === 'Resolved').length,
          'Closed': list.filter(c => c.status === 'Closed').length
        });
      }
    });
  }

  ngOnInit(): void {
    const apiStatus = this.currentFilter() === 'All' ? 'all' : this.currentFilter();
    const limit = this.searchQuery() ? 1000 : this.pagination().limit;
    this.complaintService.loadAll(this.pagination().page, limit, '', apiStatus);
    this.vendorService.loadAll(1, 100); // Load vendors to populate dropdowns
    this.loadFilterCounts();
  }

  // Refreshes the complaints list
  refreshData(): void {
    const apiStatus = this.currentFilter() === 'All' ? 'all' : this.currentFilter();
    const limit = this.searchQuery() ? 1000 : this.pagination().limit;
    this.complaintService.loadAll(this.pagination().page, limit, '', apiStatus);
  }

  // Handle filter category selection
  setFilter(status: string): void {
    this.complaintStore.statusFilter.set(status);
    const apiStatus = status === 'All' ? 'all' : status;
    const limit = this.searchQuery() ? 1000 : this.pagination().limit;
    this.complaintService.loadAll(1, limit, '', apiStatus);
  }

  private searchTimeout: any;
  // Handle search term input change
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchQuery.set(value);
      this.complaintStore.searchTerm.set(value);
      const apiStatus = this.currentFilter() === 'All' ? 'all' : this.currentFilter();
      const limit = value ? 1000 : 10;
      this.complaintService.loadAll(1, limit, '', apiStatus);
    }, 500);
  }

  onPageChange(page: number) {
    const apiStatus = this.currentFilter() === 'All' ? 'all' : this.currentFilter();
    const limit = this.searchQuery() ? 1000 : 10;
    this.complaintService.loadAll(page, limit, '', apiStatus);
  }

  // Review Case opens the detail drawer on the right
  openReviewCase(complaint: Complaint): void {
    this.complaintService.loadById(complaint._id);
    this.complaintService.loadMessages(complaint._id);
    this.selectedVendorId.set(complaint.vendor?._id || '');
    this.isDrawerOpen.set(true);
    this.replyText.set('');

    // Scroll layout viewport to top on open so Case Details starts at the top
    setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
      window.scrollTo({ top: 0 });
    }, 80);
  }

  // Closes the detail drawer
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.isStatusDropdownOpen.set(false);
    this.isVendorDropdownOpen.set(false);
    this.complaintStore.setSelectedComplaint(null);
  }

  // Handle status dropdown changes
  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    const complaint = this.activeComplaint();
    if (complaint && newStatus) {
      this.complaintService.changeStatus(complaint._id, newStatus);
      setTimeout(() => this.loadFilterCounts(), 600);
    }
  }

  // Handles vendor assignment dropdown change
  onVendorAssignChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const vendorId = target.value;
    const complaint = this.activeComplaint();
    
    if (complaint) {
      if (!vendorId) {
        // Unassign vendor
        this.complaintService.assign(complaint._id, null, null);
        this.selectedVendorId.set('');
      } else {
        // Find vendor details to optimistically update the store
        const foundVendor = this.vendors().find(v => v._id === vendorId);
        const vendorDetails = foundVendor ? {
          _id: foundVendor._id,
          fullName: foundVendor.fullName,
          businessName: foundVendor.businessName,
          email: foundVendor.email
        } : undefined;

        this.complaintService.assign(complaint._id, vendorId, vendorDetails);
        this.selectedVendorId.set(vendorId);
      }
    }
  }

  // Sends message to the ticket thread
  onSendMessage(): void {
    const text = this.replyText().trim();
    const complaint = this.activeComplaint();
    if (text && complaint) {
      this.complaintService.sendMessage(complaint._id, text, () => {
        this.replyText.set('');
        
        // Scroll the message list to bottom
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      });
    }
  }

  // TrackBy function for complaints array loop
  trackByComplaintId(index: number, item: Complaint): string {
    return item._id;
  }

  // Status utility color formatting
  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }

  // Filter tab color formatting
  getFilterTabClass(filter: string, isCurrent: boolean): string {
    const baseClass = 'px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap ';
    if (!isCurrent) {
      return baseClass + 'font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50';
    }
    
    const activeBase = baseClass + 'font-bold text-white shadow-sm ';
    switch (filter) {
      case 'All':
        return activeBase + 'bg-indigo-600 dark:bg-indigo-500';
      case 'Open':
        return activeBase + 'bg-amber-500 dark:bg-amber-600';
      case 'In Progress':
        return activeBase + 'bg-blue-500 dark:bg-blue-600';
      case 'Resolved':
        return activeBase + 'bg-emerald-500 dark:bg-emerald-600';
      case 'Closed':
        return activeBase + 'bg-slate-600 dark:bg-slate-700';
      default:
        return activeBase + 'bg-indigo-600 dark:bg-indigo-500';
    }
  }

  // Status mapping to progress percentage
  getProgressPercentage(status: string): number {
    switch (status) {
      case 'Open': return 25;
      case 'In Progress': return 60;
      case 'Resolved': return 100;
      case 'Closed': return 100;
      default: return 0;
    }
  }

  getImageUrl(img?: string): string {
    if (!img) return '';
    let url = img.replace(/\\/g, '/');
    if (url.startsWith('http')) return url;
    if (url.startsWith('assets/')) return url;
    const root = API_BASE_URL.replace(/\/+$/, '');
    return `${root}/${url.replace(/^\/+/, '')}`;
  }

  openImageViewer(url: string | null | undefined): void {
    if (url) {
      this.viewingImageUrl.set(this.getImageUrl(url));
    }
  }

  closeImageViewer(): void {
    this.viewingImageUrl.set(null);
  }
}
