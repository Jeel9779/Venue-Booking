export interface VendorSubscription {

  id: string;

  vendorId: string;
  vendorName: string;

  planId: string;
  planName: string;
  planDuration: number;

  amount: number;
  currency: string;

  paymentMethod: string;
  paymentGateway: string;
  transactionId: string;
  paymentProof: string | null;

  paymentStatus: 'pending' | 'approved' | 'failed';
  status: 'pending' | 'active' | 'rejected';

  requestedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;

  startDate: string | null;
  endDate: string | null;

  username: string | null;
  password: string | null;
  credentialsGeneratedAt: string | null;

  remarks: string;

  renewalStatus: string;
  warningStage: number;

  createdAt: string;
  updatedAt: string;
}