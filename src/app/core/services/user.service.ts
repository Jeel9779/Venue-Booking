import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UsersApi } from '../api/users-api';
import { UsersStore } from '../store/users.store';
import { User, UpdateUserPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(UsersApi);
  private readonly store = inject(UsersStore);
  private readonly uploadsBase = 'http://192.168.1.12:3000';

  loadAll(page: number = 1, limit: number = 10): void {
    this.store.setLoading(true);
    this.api.getAll(page, limit)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          const users = Array.isArray(res) ? res : (res.data || []);
          this.store.setUsers(users);
          
          if (!Array.isArray(res)) {
            this.store.setPagination({
              page: res.page || page,
              limit: res.limit || limit,
              totalRecords: res.totalRecords || users.length,
              totalPages: res.totalPages || 1
            });
          }
        },
        error: (err) => this.store.setError(err?.error?.message || 'Failed to load users'),
      });
  }

  update(id: string, data: UpdateUserPayload): void {
    this.store.setLoading(true);
    this.api.update(id, data)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.store.updateUser(res.user);
        },
        error: (err) => this.store.setError(err?.error?.message || 'Failed to update user'),
      });
  }

  delete(id: string, reason?: string): void {
    this.store.setLoading(true);
    this.api.delete(id, reason)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: () => {
          this.store.removeUser(id);
        },
        error: (err) => this.store.setError(err?.error?.message || 'Failed to delete user'),
      });
  }

  getPhotoUrl(path: string | null | undefined): string {
    if (!path) return '';

    // Fix Windows backslashes
    let normalizedPath = path.replace(/\\/g, '/');

    if (normalizedPath.startsWith('http')) return normalizedPath;

    // If the path contains a full Windows path (backend error), extract the relative part
    if (normalizedPath.includes('uploads/')) {
      const parts = normalizedPath.split('uploads/');
      const relativePath = 'uploads/' + parts[parts.length - 1];
      return `${this.uploadsBase}/${relativePath}`;
    }

    // Ensure no double slash
    return `${this.uploadsBase}/${normalizedPath.replace(/^\/+/, '')}`;
  }
}
