// Purpose: Store: Manages global/local state and reactivity for terms.
import { Injectable, signal, computed } from '@angular/core';
import { Term } from '../models/term.model';

@Injectable({
  providedIn: 'root',
})
// Defines the structure and behavior of this class
export class TermStore {
  // ── State (Signals) ────────────────────────────────────────────────────────
  private readonly _terms = signal<Term[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors (Computed) ───────────────────────────────────────────────────
  readonly terms = computed(() => this._terms());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // ── Actions ────────────────────────────────────────────────────────────────
  setTerms(terms: Term[]): void {
    this._terms.set(terms);
    this._isLoading.set(false);
    this._error.set(null);
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null): void {
    this._error.set(error);
    this._isLoading.set(false);
  }

  addTerm(term: Term): void {
    // If the new term is active, mark others as inactive
    if (term.isActive) {
      this._terms.update((terms) => [term, ...terms.map(t => ({ ...t, isActive: false }))]);
    } else {
      this._terms.update((terms) => [term, ...terms]);
    }
  }

  updateTerm(updatedTerm: Term): void {
    if (updatedTerm.isActive) {
      this._terms.update((terms) =>
        terms.map((t) => (t._id === updatedTerm._id ? updatedTerm : { ...t, isActive: false }))
      );
    } else {
      this._terms.update((terms) =>
        terms.map((t) => (t._id === updatedTerm._id ? updatedTerm : t))
      );
    }
  }

  removeTerm(id: string): void {
    this._terms.update((terms) => terms.filter((t) => t._id !== id));
  }
}
