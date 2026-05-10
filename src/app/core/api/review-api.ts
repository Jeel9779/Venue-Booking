import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/ratings';

  /**
   * Fetches all reviews, optionally filtered by status.
   */
  getAll(status?: string): Observable<Review[]> {
    const url = status ? `${this.baseUrl}?status=${status}` : this.baseUrl;
    return this.http.get<Review[]>(url);
  }

  /**
   * Approves a specific review.
   */
  approve(id: string): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${id}/approve`, {});
  }

  /**
   * Rejects a specific review.
   */
  reject(id: string): Observable<Review> {
    return this.http.patch<Review>(`${this.baseUrl}/${id}/reject`, {});
  }

  /**
   * Deletes a review permanently.
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
