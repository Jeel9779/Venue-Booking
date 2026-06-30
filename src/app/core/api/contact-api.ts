import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Contact } from '../models/contact.model';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContactApi {
  private readonly http = inject(HttpClient);
  private readonly actualBaseUrl = `${API_BASE_URL}/contacts`;

  getAll(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<PaginatedResponse<Contact>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Contact>>(this.actualBaseUrl, { params });
  }
}
