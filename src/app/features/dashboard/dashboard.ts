import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DashboardService } from './dashboard-service';
import { StatCard } from '../../shared/stat-card/stat-card';
import { Chart } from '../../shared/chart/chart';
import { DonutChart } from '../../shared/donut-chart/donut-chart';
import { VenueList } from '../../shared/venue-list/venue-list';
import { InsightCard } from '../../shared/insight-card/insight-card';




@Component({
  selector: 'app-dashboard',
  imports: [NgFor, StatCard, Chart, DonutChart, VenueList, InsightCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  service = inject(DashboardService);
}