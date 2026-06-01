// Purpose: Handles API calls for plan management.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Plan } from '@core/models/subscription.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
export class PlanApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/plans`;

  // Public: Browse active plans (no pagination)
  getActivePlans(): Observable<{ success: boolean; plans: Plan[] }> {
    return this.http.get<{ success: boolean; plans: Plan[] }>(this.baseUrl);
  }

  // Admin: Get plans with optional pagination and search
  getPlans(page: number = 1, size: number = 10, search: string = ''): Observable<{ success: boolean; plans: Plan[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http
      .get<any>(`${this.baseUrl}/all`, { params })
      .pipe(
        map(res => {
          // Expected shape: { success, plans, total } or { success, data, total }
          if (res.data && !res.plans) {
            return { success: true, plans: res.data, total: res.total ?? 0 };
          }
          return { success: true, plans: res.plans ?? [], total: res.total ?? 0 };
        })
      );
  }

  // Compatibility method without pagination (delegates to getPlans)
  getAllPlans(): Observable<{ success: boolean; plans: Plan[] }> {
    return this.getPlans().pipe(map(r => ({ success: r.success, plans: r.plans })));
  }

  // Create a new plan
  createPlan(payload: Partial<Plan>): Observable<{ success: boolean; plan: Plan }> {
    return this.http.post<{ success: boolean; plan: Plan }>(this.baseUrl, payload);
  }

  // Update an existing plan
  updatePlan(id: string, payload: Partial<Plan>): Observable<{ success: boolean; plan: Plan }> {
    return this.http.put<{ success: boolean; plan: Plan }>(`${this.baseUrl}/${id}`, payload);
  }

  // Delete a plan
  deletePlan(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
