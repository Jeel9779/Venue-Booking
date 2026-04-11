import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorSubscriptionServices } from '../service/vendor-subscription.services';
import { VendorSubscription } from '../models/vendor-subscription.model';
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

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.subscriptions$ = this.service.getAll();
  }

  // ✅ APPROVE FUNCTION (PUT CODE HERE)
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

  // ✅ HELPER FUNCTIONS
  generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
  


/* private service = inject(VendorSubscriptionServices);

  subscriptions$!: Observable<VendorSubscription[]>;

  const username = this.generateUsername(sub.vendorName);
  const password = this.generatePassword();
  
  ngOnInit(): void {
    this.load();
  }

  load() {
    this.subscriptions$ = this.service.getAll();
  }

  approve(sub: VendorSubscription) {
    const updated = {
      ...sub,
      paymentStatus: 'approved',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: this.addDays(30),
      username : username,
      password : password
    };

    this.service.update(sub.id, updated).subscribe(() => {
      alert(`Credentials:\nUsername: ${username}\nPassword: ${password}`);
      this.load();
    });
  }

  reject(sub: VendorSubscription) {
    const updated = {
      ...sub,
      paymentStatus: 'failed',
      status: 'rejected',
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

  // user name / password
  generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
  }

  generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  } */