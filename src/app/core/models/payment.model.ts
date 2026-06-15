// Purpose: Model: Defines data structures and types for the application.
export interface Payment {
  _id: string;
  vendorId: {
    _id: string;
    name?: string;
    fullName?: string;   // backend may populate either name or fullName
    email: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
    username?: string;
  };
  type: 'booking' | 'subscription' | 'full payment' | 'addon';
  relatedId: string;
  amount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  transactionId: string;
  paymentTimestamp: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Defines the data model structure
export interface PaymentStats {
  totalRevenue: number;
  revenueChange: number;
  pendingAmount: number;
  pendingCount: number;
  failedCount: number;
  successfulAmount: number;
  successfulCount: number;
  subscriptionRevenue: number;
  addonRevenue: number;
}

// Defines the data model structure
export interface PaymentFilters {
  type: string;
  paymentStatus: string;
  vendorId: string;
  search?: string;
}
