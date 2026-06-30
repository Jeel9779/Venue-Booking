import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, HelpCircle, ChevronDown, ChevronUp, BookOpen, MessageSquare } from 'lucide-angular';
import { Model } from '@shared/components/model/model';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-help-center',
  imports: [CommonModule, LucideAngularModule, Model, ReactiveFormsModule],
  templateUrl: './help-center.html',
  styleUrl: './help-center.css'
})
export class HelpCenter {
  icons = {
    helpCircle: HelpCircle,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    bookOpen: BookOpen,
    messageSquare: MessageSquare
  };

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  expandedFaq = signal<number | null>(null);
  
  showSupportModal = signal(false);
  isSubmitting = signal(false);

  supportForm = this.fb.group({
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  openSupport() {
    this.showSupportModal.set(true);
    this.supportForm.reset();
  }

  closeSupport() {
    this.showSupportModal.set(false);
  }

  submitSupport() {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.closeSupport();
      this.toastService.success('Support ticket submitted successfully. Our team will contact you shortly.');
    }, 1200);
  }

  faqs = [
    {
      question: 'How do I onboard a new venue partner (vendor)?',
      answer: 'To onboard a new partner, navigate to the "Vendors" tab and click "Add Vendor". You must fill in their Business Information, Owner Details, and securely upload verification documents (Gov ID and Business License). Once submitted, the system automatically creates their account and dispatches login credentials to their registered email.'
    },
    {
      question: 'How do I manage and verify listed venues?',
      answer: 'Go to the "Venues" section from the sidebar. Here you can view all properties listed by our partners. As an admin, you have the authority to suspend a venue if it violates our guidelines or manually approve new venue listings before they go live on the user-facing app.'
    },
    {
      question: 'What happens when a vendor subscription expires?',
      answer: 'Partners must maintain an active plan to keep their venues visible. You can manage tier limits under the "Plans" tab. When a subscription expires, the vendor\'s venues are automatically hidden from public search results until they renew. You can track this under "Vendor Subscriptions".'
    },
    {
      question: 'How are customer complaints and disputes handled?',
      answer: 'All grievances submitted via the user app are logged in the "Complain" section. You can view the status of each ticket, resolve disputes between users and venue owners, and take necessary disciplinary actions against vendors with repeated infractions.'
    },
    {
      question: 'Where can I track payments and process booking refunds?',
      answer: 'The "Payment" module provides a real-time ledger of all transactions. For cancelled bookings, the system calculates eligible refund amounts based on the venue\'s specific cancellation policy. Refunds can be monitored and manually overridden here if required.'
    },
    {
      question: 'How do I moderate user reviews for venues?',
      answer: 'Under the "User Review" tab, you will find a feed of all recent feedback left by customers. You can filter by "Flagged" to quickly identify reviews containing inappropriate language and remove them to maintain platform integrity.'
    }
  ];

  toggleFaq(index: number) {
    this.expandedFaq.update(current => current === index ? null : index);
  }
}
