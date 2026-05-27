// Purpose: API: Handles HTTP communication for Terms.
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Term, CreateTermPayload, UpdateTermPayload } from '../models/term.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class TermApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/terms`;

  getAll(): Observable<{success: boolean, data: Term[]}> {
    return this.http.get<{success: boolean, terms: Term[]}>(this.baseUrl).pipe(
      map(response => ({ success: response.success, data: response.terms }))
    );
  }

  getActive(): Observable<{success: boolean, data: Term}> {
    return this.http.get<{success: boolean, terms: Term}>(`${this.baseUrl}/active`).pipe(
      map(response => ({ success: response.success, data: response.terms }))
    );
  }

  create(term: CreateTermPayload): Observable<{success: boolean, data: Term}> {
    return this.http.post<{success: boolean, terms: Term}>(this.baseUrl, term).pipe(
      map(response => ({ success: response.success, data: response.terms }))
    );
  }

  update(id: string, term: UpdateTermPayload): Observable<{success: boolean, data: Term}> {
    return this.http.put<{success: boolean, terms: Term}>(`${this.baseUrl}/${id}`, term).pipe(
      map(response => ({ success: response.success, data: response.terms }))
    );
  }

  delete(id: string): Observable<{success: boolean}> {
    return this.http.delete<{success: boolean}>(`${this.baseUrl}/${id}`);
  }
}
