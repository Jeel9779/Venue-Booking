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

export interface VendorState {
  vendors: Vendor[];
  isLoading: boolean;
  error: string | null;
}
