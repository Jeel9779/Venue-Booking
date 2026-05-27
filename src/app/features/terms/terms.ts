// Purpose: Component: Manages the Terms and Conditions UI.
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TermService } from '../../core/services/term.service';
import { TermStore } from '../../core/store/term.store';
import { Term, CreateTermPayload, UpdateTermPayload } from '../../core/models/term.model';
import { LucideAngularModule } from 'lucide-angular';
import { Button } from '../../shared/components/button/button';
import { Card } from '../../shared/components/card/card';
import { Model } from '../../shared/components/model/model';
import { FormInput } from '../../shared/components/form-input/form-input';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, Model, FormInput, LucideAngularModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
// Defines the structure and behavior of this class
export class Terms implements OnInit {
  private readonly termService = inject(TermService);
  private readonly termStore = inject(TermStore);

  // ── State (Reactive) ───────────────────────────────────────────────────────
  readonly terms = this.termStore.terms;
  readonly isLoading = this.termStore.isLoading;
  readonly error = this.termStore.error;

  // ── UI State ───────────────────────────────────────────────────────────────
  showModel = signal(false);
  showDeleteModel = signal(false);
  isEditing = signal(false);
  selectedTerm = signal<Term | null>(null);

  formData: CreateTermPayload = {
    content: '',
    version: '',
    isActive: false
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.termService.loadAll();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  openCreateModel() {
    this.isEditing.set(false);
    this.selectedTerm.set(null);
    this.formData = { content: '', version: '', isActive: true };
    this.showModel.set(true);
  }

  openEditModel(term: Term) {
    this.isEditing.set(true);
    this.selectedTerm.set(term);
    this.formData = {
      content: term.content,
      version: term.version,
      isActive: term.isActive
    };
    this.showModel.set(true);
  }

  closeModel() {
    this.showModel.set(false);
    this.selectedTerm.set(null);
  }

  submitForm() {
    if (this.isEditing() && this.selectedTerm()) {
      this.termService.update(this.selectedTerm()!._id, this.formData);
    } else {
      this.termService.create(this.formData);
    }
    this.closeModel();
  }

  openDeleteModel(term: Term) {
    this.selectedTerm.set(term);
    this.showDeleteModel.set(true);
  }

  closeDeleteModel() {
    this.showDeleteModel.set(false);
    this.selectedTerm.set(null);
  }

  submitDelete() {
    const term = this.selectedTerm();
    if (term) {
      this.termService.delete(term._id);
    }
    this.closeDeleteModel();
  }

  dismissError() {
    this.termStore.setError(null);
  }
}
