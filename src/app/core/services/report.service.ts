// Purpose: Service to orchestrate the report API and report Store.
import { inject, Injectable } from '@angular/core';
import { ReportApi } from '@core/api/report-api';
import { ReportStore } from '@core/store/report.store';
import { ToastService } from '@core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ReportApi);
  private readonly store = inject(ReportStore);
  private readonly toast = inject(ToastService);

  // Load all reports
  loadReports(): void {
    this.store.setLoading(true);
    this.api.getReports().subscribe({
      next: (data) => {
        this.store.setReports(data);
      },
      error: (err) => {
        this.store.setError(err.message || 'Failed to load reports');
        this.toast.error('Failed to load reports');
      }
    });
  }

  // Load single report by ID
  loadReportById(id: string): void {
    this.store.setLoading(true);
    this.api.getReportById(id).subscribe({
      next: (data) => {
        this.store.setSelectedReport(data);
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.setError(err.message || 'Failed to load report details');
        this.toast.error('Failed to load report details');
      }
    });
  }

  // Update report status
  updateStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    this.store.setLoading(true);
    this.api.updateStatus(id, status).subscribe({
      next: (response) => {
        this.store.updateReportStatus(id, status);
        this.store.setLoading(false);
        this.toast.success(response.message || 'Status updated successfully');
      },
      error: (err) => {
        this.store.setError(err.message || 'Failed to update status');
        this.toast.error('Failed to update status');
      }
    });
  }

  // Filter Actions
  updateStatusFilter(status: string): void {
    this.store.statusFilter.set(status);
    this.store.currentPage.set(1);
  }

  updateSearchTerm(term: string): void {
    this.store.searchTerm.set(term);
    this.store.currentPage.set(1);
  }

  updatePage(page: number): void {
    this.store.currentPage.set(page);
  }
}
