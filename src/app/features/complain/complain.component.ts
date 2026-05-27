// Purpose: Component/Logic: Handles UI behavior and user interactions for complain.component.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, CheckCircle2, TrendingUp, XCircle, AlertCircle, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-complain',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './complain.component.html',
  styleUrls: ['./complain.component.css'],
})
// Defines the structure and behavior of this class
export class ComplainComponent {
  icons = {
    alertTriangle: AlertTriangle,
    checkCircle: CheckCircle2,
    trendingUp: TrendingUp,
    ban: XCircle,
    alertCircle: AlertCircle,
    arrowRight: ArrowRight
  };

  activeComplaints = [
    {
      id: '#CP-9021',
      venueName: 'Skyline Loft & Garden',
      user: 'Sarah Jenkins',
      urgency: 'HIGH URGENCY',
      urgencyClass: 'bg-rose-100 text-rose-600',
      description: '"The venue management failed to provide the agreed-upon security detail, resulting in...',
      progress: 75,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400&h=300'
    },
    {
      id: '#CP-8842',
      venueName: 'The Echo Lounge',
      user: 'David Miller',
      urgency: 'MEDIUM URGENCY',
      urgencyClass: 'bg-teal-100 text-teal-600',
      description: '"Sound system malfunctioned during the keynote speech. Venue technician was...',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&q=80&w=400&h=300'
    }
  ];

  enforcementActivities = [
    {
      action: 'Suspended',
      venue: 'Urban Docklands',
      violation: 'Safety Non-compliance',
      timeAgo: '24 MINS AGO',
      iconClass: 'bg-teal-100 text-teal-600'
    },
    {
      action: 'Formal Warning Issued',
      venue: 'Neon Nights Studio',
      violation: '',
      timeAgo: '2 HOURS AGO',
      iconClass: 'bg-indigo-100 text-indigo-600'
    },
    {
      action: 'Restriction Applied',
      venue: 'Payouts frozen for Vintage Barn',
      violation: '',
      timeAgo: '5 HOURS AGO',
      iconClass: 'bg-rose-100 text-rose-600'
    }
  ];
}
