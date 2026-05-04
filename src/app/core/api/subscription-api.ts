import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, SubscriptionQueue } from '../models/subscription.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://192.168.1.7:3000/subscription';

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
  adminGetAllSubscriptions(): Observable<{ success: boolean; subscriptions: any[] }> {
    return this.http.get<{ success: boolean; subscriptions: any[] }>(`${this.baseUrl}/all`);
  }
}
