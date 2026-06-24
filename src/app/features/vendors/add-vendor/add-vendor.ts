// Purpose: Component/Logic: Handles UI behavior and user interactions for add-vendor.
import { Component, inject, signal, effect, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorStore } from '../../../core/store/vendor.store';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { Model } from '../../../shared/components/model/model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, Card, FormInput, RouterLink, Model, LucideAngularModule],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.css',
})
// Defines the structure and behavior of this class
export class AddVendor {
  private readonly vendorService = inject(VendorService);
  private readonly vendorStore = inject(VendorStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ── State (Signals) ────────────────────────────────────────────────────────
  readonly isLoading = this.vendorStore.isLoading;
  readonly error = this.vendorStore.error;
  readonly vendors = this.vendorStore.vendors;

  vendorForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/\S+@\S+\.\S+/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    businessName: ['', Validators.required],
    businessType: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    address: ['', Validators.required]
  });

  selectedGovFile = signal<File | null>(null);
  selectedLicenseFile = signal<File | null>(null);
  isSubmitted = signal(false);
  showSuccessModal = signal(false);

  get errors() {
    if (!this.isSubmitted()) return {} as Record<string, string>;
    const errs: Record<string, string> = {};
    const controls = this.vendorForm.controls;
    
    if (controls['username'].errors?.['required']) errs['username'] = 'Username is required';
    
    if (controls['password'].errors?.['required']) errs['password'] = 'Password is required';
    else if (controls['password'].errors?.['minlength']) errs['password'] = 'Password must be at least 6 chars';
    
    if (controls['businessName'].errors?.['required']) errs['businessName'] = 'Business Name is required';
    if (controls['businessType'].errors?.['required']) errs['businessType'] = 'Type is required';
    if (controls['address'].errors?.['required']) errs['address'] = 'Full Address is required';
    if (controls['state'].errors?.['required']) errs['state'] = 'State is required';
    
    if (controls['pincode'].errors?.['required']) errs['pincode'] = 'Pincode is required';
    else if (controls['pincode'].errors?.['pattern']) errs['pincode'] = 'Invalid 6-digit Pincode';
    
    if (controls['fullName'].errors?.['required']) errs['fullName'] = 'Owner Name is required';
    
    if (controls['email'].errors?.['required']) errs['email'] = 'Email is required';
    else if (controls['email'].errors?.['pattern']) errs['email'] = 'Invalid Email address';
    
    if (controls['phone'].errors?.['required']) errs['phone'] = 'Phone is required';
    else if (controls['phone'].errors?.['pattern']) errs['phone'] = 'Invalid 10-digit number';

    return errs;
  }

  get isFormValid() {
    return this.vendorForm.valid && !!this.selectedGovFile() && !!this.selectedLicenseFile();
  }

  constructor() {
    let initialCount = this.vendors().length;
    effect(() => {
      if (this.vendors().length > initialCount && !this.error() && !this.isLoading()) {
        this.showSuccessModal.set(true);
        initialCount = this.vendors().length; // Update to prevent re-triggering
      }
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  
  closeModal() {
    this.showSuccessModal.set(false);
    this.router.navigate(['/vendors']);
  }
  onFileSelected(event: Event, type: 'gov' | 'license') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (type === 'gov') this.selectedGovFile.set(file);
      else this.selectedLicenseFile.set(file);
    }
  }

  onSubmit() {
    this.isSubmitted.set(true);
    if (!this.isFormValid) return;

    const data = this.vendorForm.value;
    const govFile = this.selectedGovFile()!;
    const licenseFile = this.selectedLicenseFile()!;

    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
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