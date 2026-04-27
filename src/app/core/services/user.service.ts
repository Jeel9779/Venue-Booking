
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;        // required: false in backend schema
  address?: string;      // required: false in backend schema
  city?: string;         // required: false in backend schema
  pinCode?: string;      // required: false in backend schema
  profilePhoto?: string | null;
  createdAt: string;     // from mongoose timestamps: true
  updatedAt: string;
}

// Only fields backend allows in PUT /users/:id
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
}



// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // ✅ Update this to your backend IP/domain
  /* private api = 'http://192.168.29.122:3000/users'; */
  private api = 'http://192.168.1.11:3000/users';

  // ✅ Update this to serve profile photos (must be static in Express)
  /* private uploadsBase = 'http://192.168.29.122:3000'; */
    private uploadsBase = 'http://192.168.1.11:3000';

  // ── GET all users ──────────────────────────────────────────────────────────
  // Backend: GET /users  →  User[] (password excluded)
  getUsers() {
    return this.http.get<User[]>(this.api);
  }

  // ── GET user by ID ─────────────────────────────────────────────────────────
  // Backend: GET /users/:id
  getUserById(id: string) {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  // ── UPDATE user ────────────────────────────────────────────────────────────
  // Backend: PUT /users/:id  →  multipart/form-data (multer)
  // FIX: Must send FormData, NOT JSON — backend uses multer middleware
  updateUser(id: string, data: UpdateUserPayload) {
    const formData = new FormData();
    (Object.keys(data) as (keyof UpdateUserPayload)[]).forEach(key => {
      const val = data[key];
      if (val !== null && val !== undefined && val !== '') {
        formData.append(key, val as string);
      }
    });
    return this.http.put<{ message: string; user: User }>(
      `${this.api}/${id}`,
      formData
    );
  }

 

  // ── DELETE user ────────────────────────────────────────────────────────────
  // ⚠️  Backend DELETE route not implemented yet — will return 404 until added.
  // When backend adds:  DELETE /users/:id  — this is ready to use.
  deleteUser(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  // ── HELPER: Full photo URL ─────────────────────────────────────────────────
  // Backend stores "uploads/users/filename.jpg" — prefix with server base
  getPhotoUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.uploadsBase}/${path}`;
  }
}


/* import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private api = 'http://192.168.29.122:3000/users';


  getUsers() {
    return this.http.get<User[]>(this.api);
  }


  getUserById(id: string) {
    return this.http.get<User>(`${this.api}/${id}`);
  }


  updateUser(id: string, data: any) {
    return this.http.put<{ message: string; user: User }>(`${this.api}/${id}`, data);
  }


  deleteUser(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }


  registerUser(formData: FormData) {
    return this.http.post<{ message: string; user: User }>(`${this.api}/register`, formData);
  }
}
 */
