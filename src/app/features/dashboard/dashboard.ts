import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { Chart } from '@shared/components/chart/chart';
import { DonutChart } from '@shared/components/donut-chart/donut-chart';
import { VenueList } from '@shared/components/venue-list/venue-list';
import { InsightCard } from '@shared/components/insight-card/insight-card';




@Component({
  selector: 'app-dashboard',
  imports: [NgFor, StatCard, Chart, DonutChart, VenueList, InsightCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  service = inject(DashboardService);
}