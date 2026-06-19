// Purpose: Component/Logic: Handles UI behavior and user interactions for users.
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { UsersStore } from '../../core/store/users.store';
import { User, UpdateUserPayload } from '../../core/models/user.model';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Table } from '../../shared/components/table/table';
import { Model } from '../../shared/components/model/model';
import { FormInput } from '../../shared/components/form-input/form-input';
import { Pagination } from '../../shared/components/pagination/pagination';
import { initialPagination } from '../../core/models/pagination.model';
import { LucideAngularModule } from 'lucide-angular';

type SortField = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Table, Model, FormInput, Pagination, LucideAngularModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
// Defines the structure and behavior of this class
export class Users implements OnInit {
  private readonly userService = inject(UserService);
  private readonly usersStore = inject(UsersStore);

  // ── State (Reactive) ───────────────────────────────────────────────────────
  readonly users = toSignal(this.usersStore.users$, { initialValue: [] });
  readonly isLoading = toSignal(this.usersStore.isLoading$, { initialValue: false });
  readonly error = toSignal(this.usersStore.error$, { initialValue: null });
  readonly pagination = toSignal(this.usersStore.pagination$, { initialValue: initialPagination });

  // ── UI State ───────────────────────────────────────────────────────────────
  search = signal('');
  filter = signal<string>('all');
  sortBy = signal<SortField>('createdAt');
  sortOrder = signal<SortOrder>('desc');

  backendStats = signal<{all: number; verified: number; unverified: number; suspended: number}>({
    all: 0,
    verified: 0,
    unverified: 0,
    suspended: 0
  });

  selectedUser = signal<User | null>(null);
  showEditModel = signal(false);
  showDeleteModel = signal(false);
  showSuspendModel = signal(false);
  deleteReason = signal('');

  editFormData: UpdateUserPayload = {
    name: '', email: '', phone: '', address: '', city: '', pinCode: ''
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredUsers = computed(() => {
    return this.users().filter(u => !u.deleted);
  });

  counts = this.backendStats.asReadonly();

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.fetchData(this.pagination().page);
  }

  loadStats() {
    this.userService.getStats().subscribe({
      next: (stats) => {
        if (stats) this.backendStats.set({
          all: stats.total,
          verified: stats.verified,
          unverified: stats.unverified,
          suspended: stats.suspended
        });
      }
    });
  }

  fetchData(page: number) {
    this.userService.loadAll(page, this.pagination().limit, this.search(), this.filter(), this.sortBy(), this.sortOrder());
    this.loadStats();
  }

  onPageChange(page: number) {
    this.fetchData(page);
  }

  setFilter(filter: string) {
    this.filter.set(filter);
    this.fetchData(1);
  }

  private searchTimeout: any;
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search.set(input.value);
      this.fetchData(1);
    }, 400);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  openEditModel(user: User) {
    this.selectedUser.set(user);
    this.editFormData = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      pinCode: user.pinCode || '',
    };
    this.showEditModel.set(true);
  }

  closeEditModel() {
    this.showEditModel.set(false);
    this.selectedUser.set(null);
  }

  submitEdit() {
    const user = this.selectedUser();
    if (!user) return;
    this.userService.update(user._id, this.editFormData);
    this.closeEditModel();
  }

  openDeleteModel(user: User) {
    this.selectedUser.set(user);
    this.deleteReason.set('');
    this.showDeleteModel.set(true);
  }

  closeDeleteModel() {
    this.showDeleteModel.set(false);
    this.selectedUser.set(null);
  }

  submitDelete() {
    const user = this.selectedUser();
    if (!user) return;
    this.userService.delete(user._id);
    this.closeDeleteModel();
    // Clear reason for next use
    this.deleteReason.set('');
  }

  openSuspendModel(user: User) {
    this.selectedUser.set(user);
    this.showSuspendModel.set(true);
  }

  closeSuspendModel() {
    this.showSuspendModel.set(false);
    this.selectedUser.set(null);
  }

  toggleSuspend() {
    const user = this.selectedUser();
    if (!user) return;
    
    if (user.status === 'suspended') {
      this.userService.unsuspend(user._id);
    } else {
      this.userService.suspend(user._id);
    }
    
    this.closeSuspendModel();
  }

  getImageUrl(path: string | null | undefined): string {
    return this.userService.getPhotoUrl(path);
  }

  toggleSort(field: SortField) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.fetchData(1);
  }

  dismissError() {
    this.usersStore.setError(null);
  }
}