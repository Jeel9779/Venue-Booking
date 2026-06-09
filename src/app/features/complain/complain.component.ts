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
  ChevronRight
} from 'lucide-angular';
import { ComplaintService } from '@core/services/complaint.service';
import { ComplaintStore } from '@core/store/complaint.store';
import { VendorService } from '@core/services/vendor.service';
import { VendorStore } from '@core/store/vendor.store';
import { Complaint } from '@core/models/complaint.model';
import { API_BASE_URL } from '@core/config/api.config';

@Component({
  selector: 'app-complain',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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
    chevronRight: ChevronRight
  };

  private readonly complaintService = inject(ComplaintService);
  private readonly complaintStore = inject(ComplaintStore);
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);

  // Expose signals from store
  complaints = this.complaintStore.complaints;
  filteredComplaints = this.complaintStore.filteredComplaints;
  paginatedComplaints = this.complaintStore.paginatedComplaints;
  currentPage = this.complaintStore.currentPage;
  totalPages = this.complaintStore.totalPages;
  isLoading = this.complaintStore.isLoading;
  error = this.complaintStore.error;

  clearedCasesCount = this.complaintStore.clearedCasesCount;
  activeCasesCount = this.complaintStore.activeCasesCount;
  activities = this.complaintStore.enforcementActivities;

  // Active filters in local component context
  currentFilter = this.complaintStore.statusFilter;
  searchQuery = signal<string>('');

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

  // Critical banner computed signal (finds the first unresolved complaint)
  criticalComplaint = computed(() => {
    return this.complaints().find(c => c.status === 'Open' || c.status === 'In Progress');
  });

  ngOnInit(): void {
    this.complaintService.loadAll();
    this.vendorService.loadAll(1, 100); // Load vendors to populate dropdowns
  }

  // Refreshes the complaints list
  refreshData(): void {
    this.complaintService.loadAll();
  }

  // Handle filter category selection
  setFilter(status: string): void {
    this.complaintStore.statusFilter.set(status);
    this.complaintStore.currentPage.set(1);
  }

  // Handle search term input change
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.complaintStore.searchTerm.set(value);
    this.complaintStore.currentPage.set(1);
  }

  // Pagination helper actions
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.complaintStore.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.complaintStore.currentPage.set(this.currentPage() + 1);
    }
  }

  // Review Case opens the detail drawer on the right
  openReviewCase(complaint: Complaint): void {
    this.complaintService.loadById(complaint._id);
    this.complaintService.loadMessages(complaint._id);
    this.selectedVendorId.set(complaint.vendor?._id || '');
    this.isDrawerOpen.set(true);
    this.replyText.set('');
  }

  // Closes the detail drawer
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.complaintStore.setSelectedComplaint(null);
  }

  // Handle status dropdown changes
  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    const complaint = this.activeComplaint();
    if (complaint && newStatus) {
      this.complaintService.changeStatus(complaint._id, newStatus);
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
