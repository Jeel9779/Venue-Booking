// Purpose: Service: Handles business logic and API communication for user.
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UsersApi } from '../api/users-api';
import { UsersStore } from '../store/users.store';
import { User, UpdateUserPayload } from '../models/user.model';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class UserService {
  private readonly api = inject(UsersApi);
  private readonly store = inject(UsersStore);
  private readonly uploadsBase = API_BASE_URL;

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

  private readonly placeholderUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAnklEQVR4Ae3WsQnAMBBD0YWJQ+IxCLnE4EyV5AAEzcT0gJ7O+dukgEBEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREf8B3qFdCnE4vB0AAAAASUVORK5CYII=';

  getPhotoUrl(path: string | null | undefined): string {
    if (!path) return this.placeholderUrl;

    // Normalize Windows backslashes
    let normalizedPath = path.replace(/\\/g, '/');

    // If already an absolute URL, return it
    if (normalizedPath.startsWith('http')) return normalizedPath;

    // If the path already contains the uploads folder, keep the relative part
    if (normalizedPath.includes('uploads/')) {
      const parts = normalizedPath.split('uploads/');
      const relativePath = 'uploads/' + parts.pop();
      return `${this.uploadsBase}/${relativePath}`;
    }

    // Otherwise assume the filename is at the end of the path and prepend uploads/
    const filename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
    const relativePath = filename ? `uploads/${filename}` : '';
    return relativePath ? `${this.uploadsBase}/${relativePath}` : this.placeholderUrl;
  }
}
