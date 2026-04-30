import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserState } from '../models/user.model';

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  private readonly state$ = new BehaviorSubject<UserState>(initialState);

  readonly stateView$ = this.state$.asObservable();

  readonly users$ = this.stateView$.pipe(map((s) => s.users));
  readonly isLoading$ = this.stateView$.pipe(map((s) => s.isLoading));
  readonly error$ = this.stateView$.pipe(map((s) => s.error));

  get snapshot(): UserState {
    return this.state$.getValue();
  }

  setUsers(users: User[]): void {
    this.state$.next({
      ...this.snapshot,
      users,
      isLoading: false,
      error: null,
    });
  }

  setLoading(isLoading: boolean): void {
    this.state$.next({
      ...this.snapshot,
      isLoading,
    });
  }

  setError(error: string | null): void {
    this.state$.next({
      ...this.snapshot,
      error,
      isLoading: false,
    });
  }

  updateUser(updatedUser: User): void {
    const users = this.snapshot.users.map((u) =>
      u._id === updatedUser._id ? updatedUser : u
    );
    this.state$.next({
      ...this.snapshot,
      users,
    });
  }

  removeUser(id: string): void {
    const users = this.snapshot.users.filter((u) => u._id !== id);
    this.state$.next({
      ...this.snapshot,
      users,
    });
  }
}
