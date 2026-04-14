import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorService } from '../../vendor-service';
import { Vendor } from '../../vendor.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.css',
})
export class AddVendor {

  private fb = inject(FormBuilder);
  private vendorService = inject(VendorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  vendorId: string | null = null;

  vendorForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

    businessName: ['', Validators.required],
    businessType: ['', Validators.required],
    governmentId: ['', Validators.required],

    //password: [''],

    address: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    state: ['', Validators.required],
  });

  ngOnInit() {
    this.vendorId = this.route.snapshot.paramMap.get('id');

    if (this.vendorId) {
      this.isEdit = true;

      this.vendorService.getVendorById(this.vendorId).subscribe((data) => {
        this.vendorForm.patchValue(data);
      });
    }
  }

  submit() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }

    const f = this.vendorForm.value;

    // SAFE DATA (fix null issue)
    const data: Partial<Vendor> = {
      fullName: f.fullName || '',
      email: f.email || '',
      phone: f.phone || null,

      businessName: f.businessName || '',
      businessType: f.businessType || '',
      governmentId: f.governmentId || '',

      //password: f.password || '',

      address: f.address || null,
      pincode: f.pincode || '',
      state: f.state || '',

      updatedAt: new Date().toISOString(),
    };

    if (this.isEdit && this.vendorId) {
      // ✏️ EDIT
      this.vendorService.updateVendor(this.vendorId, data).subscribe(() => {
        alert('Vendor Updated ✅');
        this.router.navigate(['/vendors']);
      });
    } else {
      // ➕ ADD
      const newVendor: Partial<Vendor> = {
        _id: Date.now().toString(),
        ...data,
        status: 'pending',
        adminMessage: '',
        licenseDoc: null,
        rating: 0,
        createdAt: new Date().toISOString(),
      };

      this.vendorService.addVendor(newVendor).subscribe(() => {
        alert('Vendor Added ✅');
        this.router.navigate(['/vendors']);
      });
    }
  }

  goToVendors() {
  this.router.navigate(['/vendors']);
}
}