import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ContactApi } from '../api/contact-api';
import { ContactStore } from '../store/contact.store';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly api = inject(ContactApi);
  private readonly store = inject(ContactStore);

  loadAll(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): void {
    this.store.setLoading(true);
    this.api.getAll(page, limit, search)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          const isArray = Array.isArray(res);
          const contacts = isArray ? res : (res.data || []);
          this.store.setContacts(contacts);
          
          this.store.setPagination({
            page: isArray ? page : Number(res.page || page),
            limit: isArray ? limit : Number(res.limit || limit),
            totalRecords: isArray ? contacts.length : Number(res.totalRecords !== undefined ? res.totalRecords : contacts.length),
            totalPages: isArray ? (Math.ceil(contacts.length / limit) || 1) : Number(res.totalPages || Math.ceil(contacts.length / (res.limit || limit)) || 1)
          });
        },
        error: (err) => this.store.setError(err?.error?.message || 'Failed to load inquiries'),
      });
  }
}
