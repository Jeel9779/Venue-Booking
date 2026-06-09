// Purpose: Handles API calls for Report Management.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Report } from '@core/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/reports`;

  // Get all reports (Admin sees all)
  getReports(): Observable<Report[]> {
    // Note: HttpInterceptor should automatically attach adminId/token headers.
    return this.http.get<Report[]>(this.baseUrl);
  }

  // Get single report details
  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`);
  }

  // Update status (Admin Only)
  updateStatus(id: string, status: string): Observable<{ message: string; report: Report }> {
    return this.http.put<{ message: string; report: Report }>(`${this.baseUrl}/${id}/status`, { status });
  }
}
