// Purpose: Service: Handles business logic and API communication for complaints.
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ComplaintApi } from '../api/complaint-api';
import { ComplaintStore } from '../store/complaint.store';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly api = inject(ComplaintApi);
  private readonly store = inject(ComplaintStore);
  private readonly toast = inject(ToastService);

  loadAll(page: number = 1, limit: number = 10, search: string = '', status: string = 'all', sortBy: string = '', sortOrder: string = ''): void {
    this.store.setLoading(true);
    this.api.getComplaints(page, limit, search, status, sortBy, sortOrder)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res: any) => {
          const complaints = Array.isArray(res) ? res : (res.data || []);
          this.store.setComplaints(complaints);
          
          if (!Array.isArray(res)) {
            this.store.setPagination({
              page: res.page || page,
              limit: res.limit || limit,
              totalRecords: res.totalRecords || complaints.length,
              totalPages: res.totalPages || Math.max(1, Math.ceil((res.totalRecords || complaints.length) / (res.limit || limit)))
            });
          } else {
            this.store.setPagination({
              page, limit, totalRecords: complaints.length, totalPages: Math.max(1, Math.ceil(complaints.length / limit))
            });
          }
        },
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to load complaints';
          this.store.setError(errMsg);
          this.toast.error(errMsg);
        }
      });
  }

  loadById(id: string): void {
    this.store.setLoading(true);
    this.api.getComplaintById(id)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => this.store.setSelectedComplaint(res),
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to load complaint details';
          this.store.setError(errMsg);
          this.toast.error(errMsg);
        }
      });
  }

  changeStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    this.store.setLoading(true);
    this.api.updateStatus(id, status)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => {
          this.store.updateComplaintStatus(id, status);
          this.toast.success(`Complaint status updated to ${status}`);
        },
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to update status';
          this.toast.error(errMsg);
        }
      });
  }

  assign(id: string, vendorId: string | null, vendorDetails?: any): void {
    this.store.setLoading(true);
    this.api.assignVendor(id, vendorId)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => {
          this.store.updateComplaintVendor(id, vendorDetails || undefined);
          this.toast.success(vendorId ? 'Complaint assigned to vendor successfully' : 'Complaint unassigned successfully');
        },
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to assign complaint';
          this.toast.error(errMsg);
        }
      });
  }

  loadMessages(id: string): void {
    this.api.getMessages(id)
      .subscribe({
        next: (res) => this.store.setMessages(res || []),
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to load messages';
          this.toast.error(errMsg);
        }
      });
  }

  sendMessage(id: string, message: string, callback?: () => void): void {
    this.api.postMessage(id, message)
      .subscribe({
        next: (res) => {
          this.store.addMessage(res);
          if (callback) callback();
        },
        error: (err) => {
          const errMsg = err?.error?.message || 'Failed to send message';
          this.toast.error(errMsg);
        }
      });
  }
}
