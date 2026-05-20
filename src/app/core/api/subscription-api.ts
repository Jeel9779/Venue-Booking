import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, SubscriptionQueue } from '../models/subscription.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
export class SubscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/subscription`;

  purchasePlan(planId: string): Observable<{ success: boolean; message: string; subscription?: Subscription; queueEntry?: SubscriptionQueue; queued: boolean }> {
    return this.http.post<{ success: boolean; message: string; subscription?: Subscription; queueEntry?: SubscriptionQueue; queued: boolean }>(`${this.baseUrl}/purchase`, { planId });
  }

  getCurrentSubscription(): Observable<{ success: boolean; subscription: Subscription }> {
    return this.http.get<{ success: boolean; subscription: Subscription }>(this.baseUrl);
  }

  getQueue(): Observable<{ success: boolean; queue: SubscriptionQueue[] }> {
    return this.http.get<{ success: boolean; queue: SubscriptionQueue[] }>(`${this.baseUrl}/queue`);
  }

  // Admin: Monitor all vendor subscriptions
  adminGetAllSubscriptions(): Observable<{ success: boolean; warningWindowDays: number; summary: any; subscriptions: any[] }> {
    return this.http.get<any>(`${this.baseUrl}/all`).pipe(
      map(res => {
        // Normalize paginated response to the format expected by the service
        if (res.data && !res.subscriptions) {
          return {
            success: true,
            warningWindowDays: res.warningWindowDays || 15,
            summary: res.summary || {},
            subscriptions: res.data
          };
        }
        return res;
      })
    );
  }

  // Admin: Get expiring soon
  adminGetExpiringSoon(): Observable<{ success: boolean; count: number; subscriptions: any[] }> {
    return this.http.get<{ success: boolean; count: number; subscriptions: any[] }>(`${this.baseUrl}/expiring-soon`);
  }

  // Admin: Assign subscription
  adminAssign(data: { vendorId: string; planId: string; startDate?: string; endDate?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/assign`, data);
  }

  // Admin: Record full payment
  adminFullPayment(data: { vendorId: string; planId: string; startDate?: string; endDate?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/full-payment`, data);
  }
}
