import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewApi {
  private readonly http = inject(HttpClient);
  /*  private readonly baseUrl = 'http://localhost:3000/ratings'; */
  private readonly baseUrl = 'http://192.168.1.9:3000/admin/reviews';

  /**
   * Fetches all reviews, optionally filtered by status.
   */
  getAll(status?: string): Observable<Review[]> {
    const url = status ? `${this.baseUrl}?status=${status}` : this.baseUrl;
    return this.http.get<any>(url).pipe(
      map(res => Array.isArray(res) ? res : (res.data || []))
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
