// Purpose: Model: Defines data structures and types for the application.
import { Pagination, initialPagination } from './pagination.model';

// Defines the data model structure
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  profilePhoto?: string | null;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Defines the data model structure
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
}

// Defines the data model structure
export interface UserState {
  users: User[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}
