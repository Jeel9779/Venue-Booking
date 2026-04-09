export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'reopen';

export interface Vendor {
  id: string;

  fullName: string;
  email: string;
  phone?: string | null;

  businessName: string;
  businessType: string;
  governmentId: string;

  password?: string;

  status: VendorStatus;
  adminMessage?: string;

  licenseDoc?: string | null;
  address?: string | null;
  rating?: number | null;

  createdAt?: string;
  updatedAt?: string;

  pincode?: string;
  state?: string;
}
