// Purpose: Models: Defines the Blog interfaces.
import { Vendor } from './vendor.model';
import { Pagination } from './pagination.model';

export interface BlogComment {
  _id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Blog {
  _id: string;
  vendorId: Vendor;
  title: string;
  content: string;
  tags: string[];
  coverImage: string | null;
  images: string[];
  videoUrl: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  adminNote: string;
  deleted: boolean;
  likes: string[];
  comments: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogResponse {
  data: Blog[];
  totalRecords: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface BlogState {
  blogs: Blog[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}
