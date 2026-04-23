import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-vendor.html',
  styleUrl: './add-vendor.css',
})
export class AddVendor {


  vendor: any = {
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    state: '',
    pincode: '',
    address: ''
  };



  // ✅ FILE STORAGE
  selectedGovFile!: File;
  selectedLicenseFile!: File;

  // ✅ UI STATES
  showSuccess = false;
  isLoading = false;
  errorMsg = '';

  // ✅ FILE NAMES (UX)
  govFileName = '';
  licenseFileName = '';

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) { }

  // ✅ FILE HANDLERS
  onGovFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedGovFile = file;
      this.govFileName = file.name;
    }
  }

  onLicenseFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLicenseFile = file;
      this.licenseFileName = file.name;
    }
  }

  // ✅ SUBMIT (PRO VERSION)
  submit(form: NgForm) {

    if (form.invalid || !this.selectedGovFile || !this.selectedLicenseFile) {
      this.errorMsg = 'Please fill all fields and upload required documents';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const formData = new FormData();

    // ✅ append text fields
    Object.keys(this.vendor).forEach((key: any) => {
      formData.append(key, this.vendor[key]);
    });

    // ✅ append files
    formData.append('governmentId', this.selectedGovFile);
    formData.append('licenseDoc', this.selectedLicenseFile);

    this.vendorService.addVendor(formData).subscribe({
      next: () => {
        this.isLoading = false;

        // ✅ SHOW SUCCESS UI (instead of alert)
        this.showSuccess = true;

        setTimeout(() => {
          this.showSuccess = false;

          // ✅ RESET FORM
          form.resetForm();
          this.govFileName = '';
          this.licenseFileName = '';

          // ✅ NAVIGATE AFTER SUCCESS
          this.router.navigate(['/admin/vendors']);
        }, 1800);
      },

      error: (err: any) => {
        this.isLoading = false;

        // ✅ SMART ERROR HANDLING
        if (err.status === 400) {
          this.errorMsg = err?.error?.message || 'Invalid data provided';
        } else if (err.status === 500) {
          this.errorMsg = 'Server error. Please try again later';
        } else {
          this.errorMsg = 'Something went wrong. Please retry';
        }

        console.error(err);
      }
    });
  }
}