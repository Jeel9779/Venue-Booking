import { Injectable, signal, computed } from '@angular/core';
import { Contact } from '../models/contact.model';
import { Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ContactStore {
  // State
  private readonly contactsSignal = signal<Contact[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  
  private readonly paginationSignal = signal<Pagination>({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1
  });

  // Selectors
  readonly contacts = computed(() => this.contactsSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly pagination = computed(() => this.paginationSignal());

  // Actions
  setContacts(contacts: Contact[]): void {
    this.contactsSignal.set(contacts);
  }

  setLoading(isLoading: boolean): void {
    this.loadingSignal.set(isLoading);
  }

  setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  setPagination(pagination: Pagination): void {
    this.paginationSignal.set(pagination);
  }
}
