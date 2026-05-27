// Purpose: Model: Defines data structures and types for the application.
export interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  totalPages: 1
};
