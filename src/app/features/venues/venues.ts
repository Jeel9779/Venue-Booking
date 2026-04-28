import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../../core/services/venue.service';
import { Venue } from '../../core/models/venue.model';

type FilterState = 'all' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues implements OnInit {
  
  private baseUrl = 'http://192.168.1.11:3000/venues';

  constructor(private venueService: VenueService) {}

  // ── State ──────────────────────────────────────────────────────────────────

  venues = signal<Venue[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  filter = signal<FilterState>('all');
  search = signal('');

  selectedVenue = signal<Venue | null>(null);
  showDetailsModal = signal(false);
  showRejectModal = signal(false);
  showApproveModal = signal(false);

  rejectReason = '';
  previewImage = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────

  filteredVenues = computed(() => {
    let list = this.venues();

    if (this.filter() !== 'all') {
      list = list.filter((v) => v.status === this.filter());
    }

    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          v.city.toLowerCase().includes(s) ||
          v.type.toLowerCase().includes(s),
      );
    }

    return list;
  });

  counts = computed(() => {
    const list = this.venues();
    return {
      all: list.length,
      pending: list.filter((v) => v.status === 'pending').length,
      approved: list.filter((v) => v.status === 'approved').length,
      rejected: list.filter((v) => v.status === 'rejected').length,
    };
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit() {
    this.loadVenues();
  }

  // ── Data Loading ─────────────────────────────────────────────────────────────────

  loadVenues() {
    this.isLoading.set(true);

    this.venueService.getVenues().subscribe({
      next: (data) => {
        const venues: Venue[] = data.map((v) => ({
          ...v,
          amenities: this.parseAmenities(v.amenities),
        }));
        this.venues.set(venues);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load venues:', err);
        this.isLoading.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Normalise the various shapes amenities can arrive in from the API */
  private parseAmenities(raw: unknown): string[] {
    if (Array.isArray(raw)) {
      // Backend sometimes wraps the JSON array inside a single-element array
      if (raw.length === 1 && typeof raw[0] === 'string') {
        try {
          return JSON.parse(raw[0]);
        } catch {
          return [];
        }
      }
      return raw.filter((x): x is string => typeof x === 'string');
    }
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  openDetails(v: Venue) {
    this.selectedVenue.set({ ...v, amenities: this.parseAmenities(v.amenities) });
    this.showDetailsModal.set(true);
  }

  closeDetails() {
    this.showDetailsModal.set(false);
    this.selectedVenue.set(null);
  }

  // ── Approve flow ───────────────────────────────────────────────────────────

  confirmApprove() {
    this.showApproveModal.set(true);
  }

  submitApprove() {
    const venue = this.selectedVenue();
    if (!venue?._id) return;

    this.isSubmitting.set(true);

    this.venueService.updateVenue(venue._id, { status: 'approved' }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showApproveModal.set(false);
        this.closeDetails();
        this.loadVenues();
      },
      error: (err) => {
        console.error('Approve failed:', err);
        this.isSubmitting.set(false);
      },
    });
  }

  // ── Reject flow ────────────────────────────────────────────────────────────

  openRejectModal() {
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
  }

  submitReject() {
    const venue = this.selectedVenue();
    if (!venue?._id || !this.rejectReason.trim()) return;

    this.isSubmitting.set(true);

    this.venueService
      .updateVenue(venue._id, {
        status: 'rejected',
        adminDescription: this.rejectReason.trim(),
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showRejectModal.set(false);
          this.closeDetails();
          this.loadVenues();
        },
        error: (err) => {
          console.error('Reject failed:', err);
          this.isSubmitting.set(false);
        },
      });
  }

  // ── Image preview ──────────────────────────────────────────────────────────

  openImage(img: string) {
    this.previewImage.set(this.getImageUrl(img));
  }

  closeImage() {
    this.previewImage.set(null);
  }

  // image url..  Converts relative path → full URL
  getImageUrl(img?: string): string {
    if (!img) return '';

    if (img.startsWith('http')) return img;

    const root = this.baseUrl.replace('/venues', '');

    return root + '/' + img.replace(/^\/+/, '');
  }
}

/*  No unsubscribe
Business logic in component
No auth token
Hardcoded API URL
No error UI*/
