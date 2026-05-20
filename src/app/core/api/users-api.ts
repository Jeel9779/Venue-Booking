import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UpdateUserPayload } from '../models/user.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/users`;

  getAll(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&limit=${limit}`).pipe(
      map(res => {
        // Return full response so service can extract pagination
        return res;
      })
    );
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  update(id: string, data: UpdateUserPayload): Observable<{ message: string; user: User }> {
    const formData = new FormData();
    (Object.keys(data) as (keyof UpdateUserPayload)[]).forEach((key) => {
      const val = data[key];
      if (val !== null && val !== undefined && val !== '') {
        formData.append(key, val as string);
      }
    });
    return this.http.put<{ message: string; user: User }>(
      `${this.baseUrl}/${id}`,
      formData
    );
  }

  delete(id: string, reason?: string): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    const options = reason ? { body: { reason } } : {};
    return this.http.delete<void>(url, options);
  }
}
