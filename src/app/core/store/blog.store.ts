// Purpose: Store: Manages global/local state and reactivity for blogs.
import { Injectable, signal, computed } from '@angular/core';
import { Blog } from '../models/blog.model';
import { initialPagination, Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class BlogStore {
  // ── State (Signals) ────────────────────────────────────────────────────────
  private readonly _blogs = signal<Blog[]>([]);
  private readonly _pagination = signal<Pagination>(initialPagination);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ───────────────────────────────────────────────────
  readonly blogs = computed(() => this._blogs());
  readonly pagination = computed(() => this._pagination());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Actions ────────────────────────────────────────────────────────────────
  setBlogs(blogs: Blog[]): void {
    this._blogs.set(blogs);
    this._isLoading.set(false);
    this._error.set(null);
  }

  setPagination(pagination: Pagination): void {
    this._pagination.set(pagination);
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null): void {
    this._error.set(error);
    if (error) this._isLoading.set(false);
  }

  updateBlog(updatedBlog: Blog): void {
    this._blogs.update(blogs => 
      blogs.map(blog => blog._id === updatedBlog._id ? updatedBlog : blog)
    );
  }
}
