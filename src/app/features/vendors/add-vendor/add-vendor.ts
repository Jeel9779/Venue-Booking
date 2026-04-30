import { Component, inject, signal, effect, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorStore } from '../../../core/store/vendor.store';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { FormInput } from '../../../shared/components/form-input/form-input';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Card, FormInput, RouterLink],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.css',
})
export class AddVendor {
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);
  private readonly router = inject(Router);

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly isLoading = this.vendorStore.isLoading;
  readonly error = this.vendorStore.error;
  readonly vendors = this.vendorStore.vendors;

  vendorData = signal({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    state: '',
    pincode: '',
    address: ''
  });

  selectedGovFile = signal<File | null>(null);
  selectedLicenseFile = signal<File | null>(null);
  isSubmitted = signal(false);

  // Validation Signals
  errors = computed(() => {
    if (!this.isSubmitted()) return {} as Record<string, string>;
    const data = this.vendorData();
    const errs: Record<string, string> = {};
    
    if (!data.businessName.trim()) errs['businessName'] = 'Business Name is required';
    if (!data.businessType.trim()) errs['businessType'] = 'Type is required';
    if (!data.address.trim()) errs['address'] = 'Full Address is required';
    if (!data.state.trim()) errs['state'] = 'State is required';
    if (!data.pincode.trim()) errs['pincode'] = 'Pincode is required';
    else if (!/^\d{6}$/.test(data.pincode)) errs['pincode'] = 'Invalid 6-digit Pincode';
    
    if (!data.fullName.trim()) errs['fullName'] = 'Owner Name is required';
    if (!data.email.trim()) errs['email'] = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errs['email'] = 'Invalid Email address';
    
    if (!data.phone.trim()) errs['phone'] = 'Phone is required';
    else if (!/^\d{10}$/.test(data.phone)) errs['phone'] = 'Invalid 10-digit number';

    return errs;
  });

  isFormValid = computed(() => {
    const data = this.vendorData();
    return !!(
      data.fullName.trim() &&
      /\S+@\S+\.\S+/.test(data.email) &&
      /^\d{10}$/.test(data.phone) &&
      data.businessName.trim() &&
      data.address.trim() &&
      /^\d{6}$/.test(data.pincode) &&
      this.selectedGovFile() &&
      this.selectedLicenseFile()
    );
  });

  constructor() {
    let initialCount = this.vendors().length;
    effect(() => {
      if (this.vendors().length > initialCount && !this.error() && !this.isLoading()) {
        this.router.navigate(['/vendors']);
      }
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  updateField(field: string, value: string) {
    this.vendorData.update(prev => ({ ...prev, [field]: value }));
  }

  onFileSelected(event: any, type: 'gov' | 'license') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'gov') this.selectedGovFile.set(file);
      else this.selectedLicenseFile.set(file);
    }
  }

  onSubmit() {
    this.isSubmitted.set(true);
    if (!this.isFormValid()) return;

    const data = this.vendorData();
    const govFile = this.selectedGovFile()!;
    const licenseFile = this.selectedLicenseFile()!;

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('businessName', data.businessName);
    formData.append('businessType', data.businessType);
    formData.append('state', data.state);
    formData.append('pincode', data.pincode);
    formData.append('address', data.address);
    
    formData.append('governmentId', govFile, govFile.name);
    formData.append('licenseDoc', licenseFile, licenseFile.name);

    this.vendorService.create(formData);
  }

  dismissError() {
    this.vendorStore.setError(null);
  }
}