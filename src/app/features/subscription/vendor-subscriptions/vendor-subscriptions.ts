import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorSubscriptionServices } from '@core/services/vendor-subscription.service';
import { VendorSubscription } from '@core/models/vendor-subscription.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vendor-subscriptions',
  imports: [CommonModule],
  templateUrl: './vendor-subscriptions.html',
  styleUrl: './vendor-subscriptions.css',
})
export class VendorSubscriptions implements OnInit {

  private service = inject(VendorSubscriptionServices);

  subscriptions$!: Observable<VendorSubscription[]>;
  selected: VendorSubscription | null = null;

  // runs when component loads
  ngOnInit(): void {
    this.load();
  }

  // Fetch all subscriptions
  load() {
    this.subscriptions$ = this.service.getAll();
  }

  // Approves a vendor subscription
  approve(sub: VendorSubscription) {

    const username = this.generateUsername(sub.vendorName);
    const password = this.generatePassword();

    const updated = {
      ...sub,
      paymentStatus: 'approved',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: this.addDays(30),
      username: username,
      password: password
    };

    this.service.update(sub.id, updated).subscribe(() => {
      alert(`Credentials:\nUsername: ${username}\nPassword: ${password}`);
      this.load();
    });
  }

  // Marks subscription as failed/rejected.
  reject(sub: VendorSubscription) {
    const updated = {
      ...sub,
      paymentStatus: 'failed',
      status: 'rejected'
    };

    this.service.update(sub.id, updated).subscribe(() => {
      this.load();
    });
  }

  addDays(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  // Helpers to create login credentials.
  generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  // For previewing images in a modal.
  previewImage: string | null = null;

  openModal(url: string) {
    this.previewImage = url;
  }

  closeModal() {
    this.previewImage = null;
  }
}
  

