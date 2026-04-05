import { Component, signal } from '@angular/core';
import { StatCard } from '../../shared/stat-card/stat-card';
import { Table } from '../../shared/table/table';
import { RevenueChart } from '../../shared/revenue-chart/revenue-chart';



@Component({
  selector: 'app-dashboard',
  imports: [StatCard, Table, RevenueChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // ✅ Stats (API ready)
  stats = signal([
    {
      title: 'Total Platform Revenue',
      value: '$4,281,090',
      change: '+12.5%',
      icon: '💰'
    },
    {
      title: 'New User Signups',
      value: '1,842',
      change: '+4.2%',
      icon: '👤'
    },
    {
      title: 'Active Vendors',
      value: '428',
      change: '10',
      icon: '🏢'
    },
    {
      title: 'Pending Verifications',
      value: '24',
      change: '',
      icon: '📋',
      highlight: true
    }
  ]);

  // ✅ Table data (API ready)
  tableData = [
  {
    id: 1,
    name: 'Glass House Retreat',
    location: 'Aspen, Colorado',
    owner: 'Marcus Sterling',
    company: 'Luxury Stays LLC',
    date: 'Oct 24, 2023',
    status: 'files',
    files: 4,
    image: 'https://picsum.photos/50?1'
  },
  {
    id: 2,
    name: 'Azure Coast Resort',
    location: 'Amalfi, Italy',
    owner: 'Elena Rossi',
    company: 'Heritage Villas',
    date: 'Oct 25, 2023',
    status: 'files',
    files: 6,
    image: 'https://picsum.photos/50?2'
  },
  {
    id: 3,
    name: 'The Obsidian Loft',
    location: 'New York, NY',
    owner: 'David Chen',
    company: 'Urban Edge Dev',
    date: 'Oct 26, 2023',
    status: 'missing',
    image: 'https://picsum.photos/50?3'
  }
];
  
}
