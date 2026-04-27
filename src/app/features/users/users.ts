// users/users.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, UpdateUserPayload } from '../../core/services/user.service';

type SortField = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  constructor(private userService: UserService) {}

  // ── Signals ────────────────────────────────────────────────────────────────
  users       = signal<User[]>([]);
  isLoading   = signal(false);
  isSubmitting= signal(false);
  errorMsg    = signal('');
  successMsg  = signal('');

  search      = signal('');
  filter      = signal<'all' | 'verified' | 'unverified'>('all');
  sortBy      = signal<SortField>('createdAt');
  sortOrder   = signal<SortOrder>('desc');

  selectedUser     = signal<User | null>(null);
  showEditModal    = signal(false);
  showDeleteModal  = signal(false);


  // ── FIX: Plain object (not a signal) for [(ngModel)] two-way binding ───────
  // Signals are immutable — [(ngModel)]="signal().field" binds to a copy and
  // changes are lost. Using a plain object means ngModel mutates it directly.
  editFormData: UpdateUserPayload = {
    name: '', email: '', phone: '', address: '', city: '', pinCode: ''
  };




  // ── Computed ───────────────────────────────────────────────────────────────
  filteredUsers = computed(() => {
    let result = [...this.users()];

    // Search
    const q = this.search().toLowerCase().trim();
    if (q) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(q)  ||
        u.email.toLowerCase().includes(q) ||
        (u.city  || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q)
      );
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
      if (aVal > bVal) return this.sortOrder() === 'asc' ?  1 : -1;
      return 0;
    });

    return result;
  });

  counts = computed(() => {
    const all        = this.users().length;
    const verified   = this.users().filter(u => u.profilePhoto && u.address && u.city).length;
    const unverified = all - verified;
    return { all, verified, unverified };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() { this.loadUsers(); }

  // ── Load ───────────────────────────────────────────────────────────────────
  loadUsers() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.userService.getUsers().subscribe({
      next: (data) => { this.users.set(data); this.isLoading.set(false); },
      error: (err)  => {
        this.errorMsg.set(err?.error?.message || 'Failed to load users.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  openEditModal(user: User) {
    this.selectedUser.set(user);
    // FIX: assign to plain object — ngModel will mutate this directly
    this.editFormData = {
      name:    user.name,
      email:   user.email,
      phone:   user.phone    || '',
      address: user.address  || '',
      city:    user.city     || '',
      pinCode: user.pinCode  || '',
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  submitEdit() {
    if (!this.selectedUser()) return;
    this.isSubmitting.set(true);
    // FIX: updateUser now builds FormData internally (multer requirement)
    this.userService.updateUser(this.selectedUser()!._id, this.editFormData).subscribe({
      next: () => {
        this.showSuccess('User updated successfully!');
        this.loadUsers();
        this.closeEditModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to update user.');
        this.isSubmitting.set(false);
      }
    });
  }

  // ── Delete Modal ───────────────────────────────────────────────────────────
  openDeleteModal(user: User) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
  }

  submitDelete() {
    if (!this.selectedUser()) return;
    this.isSubmitting.set(true);
    // ⚠️ Backend DELETE route not yet added — will 404 until backend implements it
    this.userService.deleteUser(this.selectedUser()!._id).subscribe({
      next: () => {
        this.showSuccess('User deleted.');
        this.loadUsers();
        this.closeDeleteModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(
          err.status === 404
            ? 'Delete route not yet available on backend.'
            : (err?.error?.message || 'Failed to delete user.')
        );
        this.isSubmitting.set(false);
        this.closeDeleteModal();
      }
    });
  }



  



 

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  showSuccess(msg: string) {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  dismissError() { this.errorMsg.set(''); }
}



/* import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../core/services/user.service';

type SortField = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  constructor(private userService: UserService) {}

  // ── State ──────────────────────────────────────────────────────────────────
  users = signal<User[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  search = signal('');
  filter = signal<'all' | 'verified' | 'unverified'>('all');
  sortBy = signal<SortField>('createdAt');
  sortOrder = signal<SortOrder>('desc');
  
  selectedUser = signal<User | null>(null);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  editFormData = signal({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pinCode: '',
  });

  
  filteredUsers = computed(() => {
    let result = this.users();

   
    const searchTerm = this.search().toLowerCase();
    if (searchTerm) {
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          u.city.toLowerCase().includes(searchTerm) ||
          u.phone?.includes(searchTerm)
      );
    }

   
    if (this.filter() === 'verified') {
      result = result.filter(u => u.profilePhoto && u.address && u.city);
    } else if (this.filter() === 'unverified') {
      result = result.filter(u => !u.profilePhoto || !u.address || !u.city);
    }

 
    result.sort((a, b) => {
      let aVal: any = a[this.sortBy()];
      let bVal: any = b[this.sortBy()];

      if (this.sortBy() === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return this.sortOrder() === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder() === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  counts = computed(() => {
    const all = this.users().length;
    const verified = this.users().filter(u => u.profilePhoto && u.address && u.city).length;
    const unverified = all - verified;
    return { all, verified, unverified };
  });

 
  ngOnInit() {
    this.loadUsers();
  }

  
  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.isLoading.set(false);
      },
    });
  }

  openEditModal(user: User) {
    this.selectedUser.set(user);
    this.editFormData.set({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      pinCode: user.pinCode || '',
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  submitEdit() {
    if (!this.selectedUser()) return;
    this.isSubmitting.set(true);

    this.userService.updateUser(this.selectedUser()!._id, this.editFormData()).subscribe({
      next: () => {
        this.loadUsers();
        this.closeEditModal();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Failed to update user:', error);
        this.isSubmitting.set(false);
      },
    });
  }

  openDeleteModal(user: User) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
  }

  submitDelete() {
    if (!this.selectedUser()) return;
    this.isSubmitting.set(true);

    this.userService.deleteUser(this.selectedUser()!._id).subscribe({
      next: () => {
        this.loadUsers();
        this.closeDeleteModal();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.isSubmitting.set(false);
      },
    });
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/400?text=No+Photo';
    if (path.startsWith('http')) return path;
    return `http://192.168.29.122:3000/${path}`;
  }

  toggleSort(field: SortField) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }
}
 */