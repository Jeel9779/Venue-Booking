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

type SortField = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Table, Model, FormInput, Pagination],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
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
  filter = signal<'all' | 'verified' | 'unverified'>('all');
  sortBy = signal<SortField>('createdAt');
  sortOrder = signal<SortOrder>('desc');

  selectedUser = signal<User | null>(null);
  showEditModel = signal(false);
  showDeleteModel = signal(false);
  deleteReason = signal('');

  editFormData: UpdateUserPayload = {
    name: '', email: '', phone: '', address: '', city: '', pinCode: ''
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  filteredUsers = computed(() => {
    // Filter out soft-deleted users first
    let result = this.users().filter(u => !u.deleted);

    // Search
    const q = this.search().toLowerCase().trim();
    if (q) {
      result = result.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const cityMatch = (u.city || '').toLowerCase().includes(q);
        const phoneMatch = (u.phone || '').includes(q);
        const pinMatch = (u.pinCode || '').toLowerCase().includes(q);
        const addressMatch = (u.address || '').toLowerCase().includes(q);
        
        let dateMatch = false;
        if (u.createdAt) {
          const dateObj = new Date(u.createdAt);
          const formattedDateUS = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).toLowerCase();
          const formattedDateIN = dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).toLowerCase();
          dateMatch = formattedDateUS.includes(q) || formattedDateIN.includes(q) || u.createdAt.toLowerCase().includes(q);
        }

        return nameMatch || emailMatch || cityMatch || phoneMatch || pinMatch || addressMatch || dateMatch;
      });
    }

    // Status filter
    if (this.filter() === 'verified') {
      result = result.filter(u => u.profilePhoto && u.address && u.city);
    } else if (this.filter() === 'unverified') {
      result = result.filter(u => !u.profilePhoto || !u.address || !u.city);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[this.sortBy() as keyof User];
      let bVal: any = b[this.sortBy() as keyof User];
      if (this.sortBy() === 'createdAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return this.sortOrder() === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder() === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  counts = computed(() => {
    const list = this.users().filter(u => !u.deleted);
    const verified = list.filter(u => u.profilePhoto && u.address && u.city).length;
    return {
      all: list.length,
      verified,
      unverified: list.length - verified
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.userService.loadAll(this.pagination().page);
  }

  onPageChange(page: number) {
    this.userService.loadAll(page, this.pagination().limit);
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
  }

  dismissError() {
    this.usersStore.setError(null);
  }
}