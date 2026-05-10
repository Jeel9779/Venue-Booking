export interface Review {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    vendorId: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  rating: number;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  averageRating: number;
}
