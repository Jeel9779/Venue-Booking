// Purpose: Service: Handles business logic and API communication for blogs.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Blog, BlogResponse } from '../models/blog.model';
import { API_BASE_URL } from '@core/config/api.config';
import { BlogStore } from '../store/blog.store';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(BlogStore);
  private readonly apiUrl = `${API_BASE_URL}/blogs/admin`;

  loadBlogs(page: number = 1, limit: number = 10, search: string = '', status: string = ''): void {
    this.store.setLoading(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    this.http.get<BlogResponse>(this.apiUrl, { params })
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (response) => {
          this.store.setBlogs(response.data);
          this.store.setPagination({
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            totalRecords: response.totalRecords
          });
          this.store.setError(null);
        },
        error: (err) => {
          this.store.setError(err.error?.message || 'Failed to load blogs');
        }
      });
  }

  approveBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }

  rejectBlog(id: string, reason: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/reject`, { reason }).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }

  suspendBlog(id: string, reason?: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/suspend`, { reason }).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }

  restoreBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/restore`, {}).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }

  deleteBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/delete`, {}).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }

  undeleteBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/undelete`, {}).pipe(
      tap((blog) => this.store.updateBlog(blog))
    );
  }
}
