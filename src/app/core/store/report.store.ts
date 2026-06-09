// Purpose: Store: Manages global/local state and reactivity for reports.
import { Injectable, signal, computed } from '@angular/core';
import { Report, ReportState } from '@core/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportStore {
  // ── State ──
  private readonly _state = signal<ReportState>({
    reports: [],
    selectedReport: null,
    isLoading: false,
    error: null,
  });

  // Filters & Pagination signals
  readonly statusFilter = signal<string>('All'); // 'All', 'Open', 'In Progress', 'Resolved', 'Closed'
  readonly searchTerm = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // ── Selectors (Computed) ──
  readonly reports = computed(() => this._state().reports);
  readonly selectedReport = computed(() => this._state().selectedReport);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Filtered reports based on status and search query
  readonly filteredReports = computed(() => {
    const list = this._state().reports;
    const filter = this.statusFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return list.filter(item => {
      // 1. Status Filter
      if (filter !== 'All' && item.status !== filter) {
        return false;
      }
      // 2. Search Term Filter
      if (term) {
        const titleMatch = item.title?.toLowerCase().includes(term);
        const descMatch = item.description?.toLowerCase().includes(term);
        const userMatch = item.user?.name?.toLowerCase().includes(term);
        const vendorMatch = item.venue?.vendorId?.businessName?.toLowerCase().includes(term) || item.venue?.vendorId?.fullName?.toLowerCase().includes(term);
        const venueMatch = item.venue?.name?.toLowerCase().includes(term) || item.venue?.city?.toLowerCase().includes(term);

        return titleMatch || descMatch || userMatch || vendorMatch || venueMatch;
      }
      return true;
    });
  });

  // Paginated reports
  readonly paginatedReports = computed(() => {
    const list = this.filteredReports();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  // Total pages based on filtered list size
  readonly totalPages = computed(() => {
    const total = this.filteredReports().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  // Dynamic statistics
  readonly resolvedCount = computed(() => {
    return this._state().reports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
  });

  readonly openCount = computed(() => {
    return this._state().reports.filter(r => r.status === 'Open' || r.status === 'In Progress').length;
  });

  // ── Actions/Updaters ──
  setReports(reports: Report[]): void {
    this._state.update(s => ({ ...s, reports, isLoading: false, error: null }));
  }

  setSelectedReport(selectedReport: Report | null): void {
    this._state.update(s => ({ ...s, selectedReport }));
  }

  updateReportStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    this._state.update(s => {
      const list = s.reports.map(r => r._id === id ? { ...r, status } : r);
      let selected = s.selectedReport;
      if (selected && selected._id === id) {
        selected = { ...selected, status };
      }
      return { ...s, reports: list, selectedReport: selected };
    });
  }

  setLoading(isLoading: boolean): void {
    this._state.update(s => ({ ...s, isLoading }));
  }

  setError(error: string | null): void {
    this._state.update(s => ({ ...s, error, isLoading: false }));
  }
}
