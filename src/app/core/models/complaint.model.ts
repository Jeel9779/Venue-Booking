// Purpose: Model: Defines data structures and types for complaints and messages.

export interface ComplaintUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ComplaintVendor {
  _id: string;
  fullName?: string;
  businessName?: string;
  email: string;
}

export interface ComplaintVenue {
  _id: string;
  name: string;
  city: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  user?: ComplaintUser | null;
  vendor?: ComplaintVendor | null;
  venue?: ComplaintVenue | null;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintMessage {
  _id: string;
  complaintId: string;
  senderId: string;
  senderModel: 'User' | 'Vendor' | 'Admin';
  senderName: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ComplaintState {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  messages: ComplaintMessage[];
  isLoading: boolean;
  error: string | null;
}
