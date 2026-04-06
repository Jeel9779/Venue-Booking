import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string;
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // ✅ READ
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  // ✅ CREATE
  addUser(user: User) {
    return this.http.post(this.api, user);
  }

  // ✅ UPDATE
  updateUser(id: string, data: any) {
    return this.http.patch(`${this.api}/${id}`, data);
  }

  // ✅ DELETE
  deleteUser(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
