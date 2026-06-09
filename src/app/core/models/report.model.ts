// Purpose: Defines the interfaces for the Report feature.
export interface Report {
  _id: string;
  title: string;
  description: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  venue?: {
    _id?: string;
    name?: string;
    city?: string;
    vendorId?: {
      _id?: string;
      fullName?: string;
      businessName?: string;
      email?: string;
    };
  };
  attachments: string[];
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt?: string;
}

export interface ReportState {
  reports: Report[];
  selectedReport: Report | null;
  isLoading: boolean;
  error: string | null;
}
