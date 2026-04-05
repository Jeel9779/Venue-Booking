import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-revenue-chart',
  imports: [BaseChartDirective],
  templateUrl: './revenue-chart.html',
  styleUrl: './revenue-chart.css',
})
export class RevenueChart {
   // ✅ Chart Data (API-ready)
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
  {
    label: 'Bookings',
    data: [120, 190, 150, 220, 180, 250, 300],
    fill: true,
    tension: 0.4,
    borderColor: '#16a34a',
    backgroundColor: 'rgba(34,197,94,0.15)',
    pointBackgroundColor: '#16a34a'
  }
]
  };

  // ✅ Options
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };
}
