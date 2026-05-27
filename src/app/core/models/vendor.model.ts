// Purpose: Model: Defines data structures and types for the application.
import { Pagination, initialPagination } from './pagination.model';

// Defines the data model structure
export interface Vendor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  state: string;
  pincode: string;
  address: string;
  governmentId: string; // Matches backend
  licenseDoc: string;   // Matches backend
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  username?: string;
  password?: string;
  adminMessage?: string;
}

// Defines the data model structure
export interface VendorState {
  vendors: Vendor[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}
