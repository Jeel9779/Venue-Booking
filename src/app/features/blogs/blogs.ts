// Purpose: Component: Manages and displays the list of blogs for admin monitoring.
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  PenTool, Search, Filter, RotateCcw, 
  Eye, CheckCircle2, XCircle, AlertTriangle, 
  Trash2, RefreshCw, X, FileText, User
} from 'lucide-angular';
import { BlogStore } from '@core/store/blog.store';
import { BlogService } from '@core/services/blog.service';
import { Blog } from '@core/models/blog.model';
import { Pagination } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, Pagination],
  templateUrl: './blogs.html',
})
export class Blogs implements OnInit {
  private readonly store = inject(BlogStore);
  private readonly blogService = inject(BlogService);

  // Store signals
  readonly rawBlogs = this.store.blogs;

  // KPI Stats
  readonly totalBlogs = computed(() => this.rawBlogs().length);
  readonly pendingBlogs = computed(() => this.rawBlogs().filter(b => b.status === 'pending').length);
  readonly approvedBlogs = computed(() => this.rawBlogs().filter(b => b.status === 'approved').length);
  readonly rejectedBlogs = computed(() => this.rawBlogs().filter(b => b.status === 'rejected' || b.status === 'suspended').length);

  readonly blogs = computed(() => {
    let list = this.rawBlogs();
    const search = this.searchQuery().toLowerCase().trim();

    if (search) {
      list = list.filter(b => {
        const vendorName = b.vendorId?.businessName || b.vendorId?.fullName || 'Unknown';
        const vendorEmail = b.vendorId?.email || '';
        const status = b.status || '';
        const title = b.title || '';
        const content = b.content || '';
        const tags = b.tags ? b.tags.join(', ') : '';

        return title.toLowerCase().includes(search) ||
               content.toLowerCase().includes(search) ||
               vendorName.toLowerCase().includes(search) ||
               vendorEmail.toLowerCase().includes(search) ||
               status.toLowerCase().includes(search) ||
               tags.toLowerCase().includes(search);
      });
    }

    const page = this.pagination()?.page || 1;
    const limit = this.pagination()?.limit || 10;
    return list.length > limit ? list.slice((page - 1) * limit, page * limit) : list;
  });
  readonly pagination = this.store.pagination;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  // Icons
  readonly icons = {
    penTool: PenTool,
    search: Search,
    filter: Filter,
    reset: RotateCcw,
    view: Eye,
    success: CheckCircle2,
    reject: XCircle,
    suspend: AlertTriangle,
    delete: Trash2,
    restore: RefreshCw,
    close: X,
    fileText: FileText,
    user: User
  };

  // State
  filterStatus = signal<string>('');
  searchQuery = signal<string>('');
  
  // Modals
  showPreviewModal = signal<boolean>(false);
  showReasonModal = signal<boolean>(false);
  selectedBlog = signal<Blog | null>(null);
  reasonAction = signal<'reject' | 'suspend' | ''>('');
  reasonText = signal<string>('');

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(page: number = 1): void {
    const limit = this.searchQuery() ? 1000 : this.pagination().limit;
    this.blogService.loadBlogs(
      page, 
      limit, 
      '', 
      this.filterStatus()
    );
  }

  onPageChange(page: number): void {
    this.loadBlogs(page);
  }

  applyFilters(): void {
    this.loadBlogs(1);
  }

  resetFilters(): void {
    this.filterStatus.set('');
    this.searchQuery.set('');
    this.loadBlogs(1);
  }

  private searchTimeout: any;

  onSearchChange(term: string): void {
    this.searchQuery.set(term);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  // Actions
  previewBlog(blog: Blog): void {
    this.selectedBlog.set(blog);
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.selectedBlog.set(null);
  }

  approveBlog(id: string): void {
    this.blogService.approveBlog(id).subscribe();
  }

  openReasonModal(blog: Blog, action: 'reject' | 'suspend'): void {
    this.selectedBlog.set(blog);
    this.reasonAction.set(action);
    this.reasonText.set('');
    this.showReasonModal.set(true);
  }

  closeReasonModal(): void {
    this.showReasonModal.set(false);
    this.selectedBlog.set(null);
    this.reasonAction.set('');
  }

  submitReason(): void {
    const blog = this.selectedBlog();
    const action = this.reasonAction();
    const reason = this.reasonText().trim();
    if (!blog || !action || !reason) return;

    if (action === 'reject') {
      this.blogService.rejectBlog(blog._id, reason).subscribe(() => this.closeReasonModal());
    } else if (action === 'suspend') {
      this.blogService.suspendBlog(blog._id, reason).subscribe(() => this.closeReasonModal());
    }
  }

  restoreBlog(id: string): void {
    this.blogService.restoreBlog(id).subscribe();
  }

  // Delete Modal State
  showDeleteModal = signal<boolean>(false);
  blogToDelete = signal<string | null>(null);

  confirmDelete(id: string): void {
    this.blogToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.blogToDelete.set(null);
  }

  executeDelete(): void {
    const id = this.blogToDelete();
    if (id) {
      this.blogService.deleteBlog(id).subscribe(() => {
        this.closeDeleteModal();
      });
    }
  }

  undeleteBlog(id: string): void {
    this.blogService.undeleteBlog(id).subscribe();
  }

  // Helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'suspended': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }
}
