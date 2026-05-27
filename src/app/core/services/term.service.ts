// Purpose: Service: Handles business logic and API communication for terms.
import { inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { TermApi } from '../api/term-api';
import { TermStore } from '../store/term.store';
import { CreateTermPayload, UpdateTermPayload } from '../models/term.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class TermService {
  private readonly api = inject(TermApi);
  private readonly store = inject(TermStore);

  loadAll(): void {
    this.store.setLoading(true);
    this.api.getAll()
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.store.setTerms(res.data);
          } else {
            this.store.setTerms([]);
          }
        },
        error: (err) => this.store.setError(err?.message || 'Failed to load terms'),
      });
  }

  create(data: CreateTermPayload): void {
    this.store.setLoading(true);
    this.api.create(data)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.store.addTerm(res.data);
          }
        },
        error: (err) => this.store.setError(err?.message || 'Failed to create terms'),
      });
  }

  update(id: string, data: UpdateTermPayload): void {
    this.store.setLoading(true);
    this.api.update(id, data)
      .pipe(finalize(() => this.store.setLoading(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.store.updateTerm(res.data);
          }
        },
        error: (err) => this.store.setError(err?.message || 'Failed to update terms'),
      });
  }

  delete(id: string): void {
    // Optimistic UI update
    const originalTerms = [...this.store.terms()];
    this.store.removeTerm(id);

    this.api.delete(id).subscribe({
      error: (err) => {
        // Rollback on error
        this.store.setTerms(originalTerms);
        this.store.setError(err?.message || 'Failed to delete terms');
      }
    });
  }
}
