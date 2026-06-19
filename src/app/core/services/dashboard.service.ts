// Purpose: Service: Handles business logic and API communication for dashboard.
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardSummaryResponse } from '@core/models/dashboard.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  
  summary = signal<DashboardSummaryResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadDashboard() {
    this.isLoading.set(true);
    this.error.set(null);
    this.http.get<DashboardSummaryResponse>(`${API_BASE_URL}/api/dashboard/summary`).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load dashboard summary');
        this.isLoading.set(false);
      }
    });
  }
}
