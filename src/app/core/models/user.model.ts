export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pinCode?: string;
}

export interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}
