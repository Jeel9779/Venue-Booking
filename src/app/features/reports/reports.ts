// Purpose: Component/Logic: Handles UI behavior and user interactions for report management.
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  User,
  Paperclip,
  X
} from 'lucide-angular';
import { ReportService } from '@core/services/report.service';
import { ReportStore } from '@core/store/report.store';
import { Report } from '@core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  Math = Math;

  icons = {
    alertTriangle: AlertTriangle,
    checkCircle: CheckCircle2,
    fileText: FileText,
    ban: XCircle,
    alertCircle: AlertCircle,
    refresh: RefreshCw,
    search: Search,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    shieldAlert: ShieldAlert,
    building: Building2,
    user: User,
    paperclip: Paperclip,
    close: X
  };

  private readonly reportService = inject(ReportService);
  private readonly reportStore = inject(ReportStore);

  // Signals from store
  reports = this.reportStore.reports;
  filteredReports = this.reportStore.paginatedReports;
  currentPage = this.reportStore.currentPage;
  totalPages = this.reportStore.totalPages;
  isLoading = this.reportStore.isLoading;
  error = this.reportStore.error;

  resolvedCount = this.reportStore.resolvedCount;
  openCount = this.reportStore.openCount;

  statusCounts = computed(() => {
    const list = this.reports();
    return {
      All: list.length,
      Open: list.filter(r => r.status === 'Open').length,
      'In Progress': list.filter(r => r.status === 'In Progress').length,
      Resolved: list.filter(r => r.status === 'Resolved').length,
      Closed: list.filter(r => r.status === 'Closed').length
    } as Record<string, number>;
  });

  currentFilter = this.reportStore.statusFilter;
  searchQuery = signal<string>('');

  // Drawer / Modal states
  isDrawerOpen = signal<boolean>(false);
  activeReport = this.reportStore.selectedReport;
  viewingImageUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.reportService.loadReports();
  }

  refreshData(): void {
    this.reportService.loadReports();
  }

  setFilter(status: string): void {
    this.reportService.updateStatusFilter(status);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.reportService.updateSearchTerm(value);
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.reportService.updatePage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.reportService.updatePage(this.currentPage() + 1);
    }
  }



  openReviewCase(report: Report): void {
    this.reportService.loadReportById(report._id);
    this.isDrawerOpen.set(true);
    setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.reportStore.setSelectedReport(null);
  }

  onStatusChange(event: Event, reportId?: string): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    const id = reportId || this.activeReport()?._id;
    
    if (id && newStatus) {
      this.reportService.updateStatus(id, newStatus);
    }
  }

  trackByReportId(index: number, item: Report): string {
    return item._id;
  }

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

  openImageViewer(url: string | null | undefined): void {
    if (url) {
      this.viewingImageUrl.set(url);
    }
  }

  closeImageViewer(): void {
    this.viewingImageUrl.set(null);
  }
}
