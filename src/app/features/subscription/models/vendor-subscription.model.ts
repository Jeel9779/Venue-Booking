export interface VendorSubscription {
  id: string;

  vendorId: string;
  vendorName: string;

  planId: string;
  planName: string;

  paymentStatus: 'pending' | 'approved' | 'failed';
  status: 'pending' | 'active' | 'rejected';

  startDate: string | null;
  endDate: string | null;
}