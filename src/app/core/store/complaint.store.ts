// Purpose: Store: Manages global/local state and reactivity for complaints.
import { Injectable, signal, computed } from '@angular/core';
import { Complaint, ComplaintMessage, ComplaintState } from '@core/models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ComplaintStore {
  // ── State ──
  private readonly _state = signal<ComplaintState>({
    complaints: [],
    selectedComplaint: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  // Filters & Pagination signals
  readonly statusFilter = signal<string>('All'); // 'All', 'Open', 'In Progress', 'Resolved', 'Closed'
  readonly searchTerm = signal<string>('');
  readonly pagination = signal({ page: 1, limit: 10, totalRecords: 0, totalPages: 1 });

  // ── Selectors (Computed) ──
  readonly complaints = computed(() => this._state().complaints);
  readonly selectedComplaint = computed(() => this._state().selectedComplaint);
  readonly messages = computed(() => this._state().messages);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Dynamic statistics
  readonly clearedCasesCount = computed(() => {
    return this._state().complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  });

  readonly activeCasesCount = computed(() => {
    return this._state().complaints.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  });

  // Recent activity log: constructs an audit trail of changes
  readonly enforcementActivities = computed(() => {
    // Generate chronological activities based on complaints metadata
    return this._state().complaints
      .slice(0, 5) // Limit to top 5
      .map(c => {
        let action = 'Complaint Submitted';
        let iconClass = 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400';
        
        if (c.status === 'In Progress') {
          action = 'Under Active Investigation';
          iconClass = 'bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400';
        } else if (c.status === 'Resolved') {
          action = 'Resolved / Settlement Approved';
          iconClass = 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400';
        } else if (c.status === 'Closed') {
          action = 'Case Closed';
          iconClass = 'bg-gray-50 text-gray-500 dark:bg-gray-800/40 dark:text-gray-400';
        }

        return {
          id: c._id,
          action,
          venue: c.venue?.name || 'General Platform Complaint',
          violation: c.title,
          iconClass,
          timeAgo: this.getTimeAgo(c.createdAt)
        };
      });
  });

  // Helper function to format time ago
  private getTimeAgo(dateString: string): string {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // ── Actions/Updaters ──
  setComplaints(complaints: Complaint[]): void {
    this._state.update(s => ({ ...s, complaints, isLoading: false, error: null }));
  }

  setSelectedComplaint(selectedComplaint: Complaint | null): void {
    this._state.update(s => ({ ...s, selectedComplaint }));
  }

  setMessages(messages: ComplaintMessage[]): void {
    this._state.update(s => ({ ...s, messages }));
  }

  addMessage(message: ComplaintMessage): void {
    this._state.update(s => ({ ...s, messages: [...s.messages, message] }));
  }

  updateComplaintStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    this._state.update(s => {
      const list = s.complaints.map(c => c._id === id ? { ...c, status } : c);
      let selected = s.selectedComplaint;
      if (selected && selected._id === id) {
        selected = { ...selected, status };
      }
      return { ...s, complaints: list, selectedComplaint: selected };
    });
  }

  updateComplaintVendor(id: string, vendor: any): void {
    this._state.update(s => {
      const list = s.complaints.map(c => c._id === id ? { ...c, vendor } : c);
      let selected = s.selectedComplaint;
      if (selected && selected._id === id) {
        selected = { ...selected, vendor };
      }
      return { ...s, complaints: list, selectedComplaint: selected };
    });
  }

  setLoading(isLoading: boolean): void {
    this._state.update(s => ({ ...s, isLoading }));
  }

  setError(error: string | null): void {
    this._state.update(s => ({ ...s, error, isLoading: false }));
  }

  setPagination(data: { page: number; limit: number; totalRecords: number; totalPages: number }) {
    this.pagination.set(data);
  }
}
