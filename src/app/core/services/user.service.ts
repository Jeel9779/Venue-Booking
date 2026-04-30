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
  private readonly uploadsBase = 'http://192.168.1.11:3000';

  loadAll(): void {
    this.store.setLoading(true);
    this.api.getAll()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (users) => this.store.setUsers(users),
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

  delete(id: string): void {
    this.store.setLoading(true);
    this.api.delete(id)
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
    if (path.startsWith('http')) return path;
    return `${this.uploadsBase}/${path}`;
  }
}
