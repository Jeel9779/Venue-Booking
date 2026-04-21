import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  stats = signal([
    { title: 'Total Bookings', value: 1284, change: '+12.5%', color: 'indigo' },
    { title: 'Net Revenue', value: '$42.8k', change: '+8.2%', color: 'green' },
    { title: 'Active Venues', value: 86, change: 'Stable', color: 'purple' },
    { title: 'Cancellations', value: 14, change: '-3.1%', color: 'red' },
  ]);

  venues = signal([
    { name: 'Grand Ballroom', bookings: 42, revenue: 12400, img: 'https://picsum.photos/50?1' },
    { name: 'Skyline Hub', bookings: 28, revenue: 8900, img: 'https://picsum.photos/50?2' }
  ]);

  // 🔥 Future API
  loadDashboard() {
    // this.http.get(...);
  }
}
