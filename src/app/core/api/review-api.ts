// Purpose: Component/Logic: Handles UI behavior and user interactions for review-api.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../models/review.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
// Defines the structure and behavior of this class
export class ReviewApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/reviews`;

  /**
   * Fetches all reviews, optionally filtered by status.
   */
  getAll(page: number = 1, limit: number = 10, search: string = '', status: string = 'all', sortBy: string = '', sortOrder: string = ''): Observable<any> {
    let url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
    if (sortOrder) url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    return this.http.get<any>(url).pipe(
      map(res => res)
    );
  }

  /**
   * Approves a specific review.
   */
  approve(venueId: string, reviewId: string): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${venueId}/${reviewId}/status`, { status: 'approved' });
  }

  /**
   * Rejects a specific review.
   */
  reject(venueId: string, reviewId: string): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${venueId}/${reviewId}/status`, { status: 'rejected' });
  }

  /**
   * Deletes a review permanently.
   */
  delete(venueId: string, reviewId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${venueId}/${reviewId}`);
  }
}
