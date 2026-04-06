import { Component, computed, OnInit, signal } from '@angular/core';
import { UserService, User } from './user-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  // ✅ keep empty → API will fill
  users = signal<User[]>([]);

  isLoading = signal(false);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  // ✅ LOAD USERS (API READY)
  /* loadUsers() {
    this.isLoading.set(true);

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  } */

  // load data
  loadUsers() {
    this.isLoading.set(true);

    this.userService.getUsers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.users.set(data);
        } else {
          this.setMockUsers(); // 👈 HERE
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.setMockUsers(); // 👈 HERE ALSO
        this.isLoading.set(false);
      },
    });
  }
  setMockUsers() {
    this.users.set([
      {
        id: 'U1',
        fullName: 'Amit Joshi',
        email: 'amit@example.com',
        phone: '9876543210',
        role: 'user',
        status: 'active',
        lastLogin: '2026-04-05',
      },
      {
        id: 'U2',
        fullName: 'Priya Shah',
        email: 'priya@example.com',
        phone: '9123456780',
        role: 'vendor',
        status: 'blocked',
        lastLogin: '',
      },
    ]);
  }

  //  BLOCK USER
  block(u: User) {
    this.userService
      .updateUser(u.id, {
        status: 'blocked',
      })
      .subscribe(() => this.loadUsers());
  }

  //  ACTIVATE USER
  activate(u: User) {
    this.userService
      .updateUser(u.id, {
        status: 'active',
      })
      .subscribe(() => this.loadUsers());
  }

  //  DELETE USER (ONLY ONE FUNCTION )
  delete(u: User) {
    const confirmDelete = confirm('Are you sure to delete this user?');

    if (confirmDelete) {
      this.userService.deleteUser(u.id).subscribe(() => this.loadUsers());
    }
  }

  

  /* add search  */
  searchTerm = signal('');
  selectedStatus = signal('');
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();

    return this.users().filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone.includes(term);

      const matchesStatus = !status || u.status === status;

      return matchesSearch && matchesStatus;
    });
  });


  // add edit user modal popup 
  isModalOpen = signal(false);
selectedUser = signal<User | null>(null);

// edit btn
edit(u: User) {
  this.selectedUser.set({ ...u }); // clone
  this.isModalOpen.set(true);
}

// close modal 
closeModal() {
  this.isModalOpen.set(false);
  this.selectedUser.set(null);
}

// save .. update user
saveUser() {
  const user = this.selectedUser();

  if (!user) return;

  this.userService.updateUser(user.id, user)
    .subscribe(() => {
      this.closeModal();
      this.loadUsers();
    });
}
}
