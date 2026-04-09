import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorService } from '../../vendor-service';
import { Vendor } from '../../vendor.model';
import { LucideAngularModule, User, Mail, Phone, Building2, IdCard, MapPin } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.css',
})
export class AddVendor {
 
  /* icon  */
  /*   readonly User = User;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly Building2 = Building2;
  readonly IdCard = IdCard;
  readonly MapPin = MapPin;
 */

  private fb = inject(FormBuilder);
  private vendorService = inject(VendorService);
  private router = inject(Router);

  vendorForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

    businessName: ['', Validators.required],
    businessType: ['', Validators.required],
    governmentId: ['', Validators.required],

    password: [''],

    address: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    state: ['', Validators.required],
  });

   submit() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }

    const f = this.vendorForm.value;

    const newVendor: Partial<Vendor> = {
      id: Date.now().toString(),
      fullName: f.fullName!,
      email: f.email!,
      phone: f.phone || null,
      businessName: f.businessName!,
      businessType: f.businessType!,
      governmentId: f.governmentId!,
      password: f.password || '',
      address: f.address || null,

      pincode: f.pincode!,
      state: f.state!,

      status: 'pending', // ✅ FIXED TYPE
      adminMessage: '',
      licenseDoc: null,
      rating: 0,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.vendorService.addVendor(newVendor).subscribe({
      next: () => {
        alert('Vendor Added ✅');
        this.router.navigate(['/vendors']); // go back to list
      },
      error: (err) => console.error(err),
    });
  } 



  
}
