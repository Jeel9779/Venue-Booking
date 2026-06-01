import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, HelpCircle, ChevronDown, ChevronUp, BookOpen, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-help-center',
  imports: [CommonModule, LucideAngularModule],
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

  expandedFaq = signal<number | null>(null);

  faqs = [
    {
      question: 'How do I approve a new vendor?',
      answer: 'Go to the "Vendors" tab from the main navigation. Find the vendor with a "Pending" status in the list. Click on their row to view their application details, then click the "Approve" button. This will automatically generate their temporary login credentials and notify them via email.'
    },
    {
      question: 'How do I process a refund for a cancelled booking?',
      answer: 'Navigate to the "Bookings" calendar or list view. Locate the specific booking and open the details panel. If the booking is eligible for a refund according to our policy, you will see a "Process Refund" button. Clicking this will reverse the transaction in the payment gateway.'
    },
    {
      question: 'What happens when a vendor subscription expires?',
      answer: 'When a vendor\'s subscription expires, their venues are automatically hidden from the public platform. They will still be able to log in to their vendor dashboard to renew their plan. You can monitor expiring plans from the "Subscription Monitor" in the Shortcuts menu.'
    },
    {
      question: 'How do I moderate user reviews?',
      answer: 'Under the "Reviews" tab, you will see a feed of all recent user feedback. You can filter by "Flagged" or "Pending". Click on any review to either "Approve" it (making it public on the venue page) or "Reject" it if it violates community guidelines.'
    }
  ];

  toggleFaq(index: number) {
    this.expandedFaq.update(current => current === index ? null : index);
  }
}
