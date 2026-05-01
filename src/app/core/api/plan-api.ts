import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plan } from '@core/models/subscription.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlanApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.6:3000/plans';   // cards

  // Public/Vendor: Browse active plans
  getActivePlans(): Observable<{ success: boolean; plans: Plan[] }> {
    return this.http.get<{ success: boolean; plans: Plan[] }>(this.baseUrl);
  }

  // Admin: View all plans
  getAllPlans(): Observable<{ success: boolean; plans: Plan[] }> {
    return this.http.get<{ success: boolean; plans: Plan[] }>(`${this.baseUrl}/all`);
  }

  createPlan(payload: Partial<Plan>): Observable<{ success: boolean; plan: Plan }> {
    return this.http.post<{ success: boolean; plan: Plan }>(this.baseUrl, payload);
  }

  updatePlan(id: string, payload: Partial<Plan>): Observable<{ success: boolean; plan: Plan }> {
    return this.http.put<{ success: boolean; plan: Plan }>(`${this.baseUrl}/${id}`, payload);
  }

  deletePlan(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
