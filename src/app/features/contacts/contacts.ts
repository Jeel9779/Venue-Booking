import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Search, 
  Loader2, 
  Inbox, 
  Mail, 
  Eye, 
  X, 
  MessageSquare, 
  Reply, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-angular';
import { ContactService } from '@core/services/contact.service';
import { ContactStore } from '@core/store/contact.store';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Contact } from '@core/models/contact.model';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css'
})
export class Contacts implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly store = inject(ContactStore);

  // Expose Math to template for pagination logic
  Math = Math;

  // Store selections
  contacts = this.store.contacts;
  isLoading = this.store.isLoading;
  pagination = this.store.pagination;

  // Search state
  searchTerm = signal('');
  private readonly searchSubject = new Subject<string>();

  // Drawer / Modal State
  isDrawerOpen = signal(false);
  selectedContact = signal<Contact | null>(null);

  // Icons mapping for template
  icons = {
    search: Search,
    loader2: Loader2,
    inbox: Inbox,
    mail: Mail,
    eye: Eye,
    x: X,
    messageSquare: MessageSquare,
    reply: Reply,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight
  };

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadContacts(1);
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(page: number = 1): void {
    const p = this.pagination();
    this.contactService.loadAll(page, p.limit, this.searchTerm());
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }
  
  onSearchChange(event: Event): void {
    this.onSearch(event);
  }

  onPageChange(page: number): void {
    this.loadContacts(page);
  }

  prevPage(): void {
    if (this.pagination().page > 1) {
      this.loadContacts(this.pagination().page - 1);
    }
  }

  nextPage(): void {
    if (this.pagination().page < this.pagination().totalPages) {
      this.loadContacts(this.pagination().page + 1);
    }
  }

  viewDetails(contact: Contact): void {
    this.selectedContact.set(contact);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedContact.set(null);
  }

  getInitials(name: string): string {
    return name?.substring(0, 2).toUpperCase() || 'NA';
  }
  
  trackById(index: number, item: Contact): string {
    return item._id;
  }
}
