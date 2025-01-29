import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { WorkoutService, User } from '../../services/workout.service';

@Component({
  selector: 'app-workout-chart',
  template: `
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-semibold text-gray-900">
            {{ selectedUser ? selectedUser.name + "'s" : '' }} Workout Statistics
          </h2>
        </div>
        <div class="flex items-center space-x-4">
          <button mat-button (click)="toggleChartType()">
            <mat-icon>swap_horiz</mat-icon>
            {{ isBarChart ? 'Switch to Line' : 'Switch to Bar' }}
          </button>
        </div>
      </div>

      <div class="relative min-h-[300px]">
        <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && (!selectedUser || !chartData.datasets[0].data.length)" 
             class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <mat-icon class="text-4xl mb-2">fitness_center</mat-icon>
          <p>{{ selectedUser ? 'No workout data available' : 'Please select a user to view statistics' }}</p>
        </div>

        <canvas *ngIf="!loading && selectedUser && chartData.datasets[0].data.length" 
                baseChart
                #chart="base-chart"
                [type]="chartType"
                [data]="chartData"
                [options]="chartOptions">
        </canvas>
      </div>
    </div>
  `
})
export class WorkoutChartComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart?: BaseChartDirective;
  
  private subscription = new Subscription();
  selectedUser: User | null = null;
  loading = true;
  isBarChart = true;

  get chartType(): ChartType {
    return this.isBarChart ? 'bar' : 'line';
  }

  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Minutes',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      fill: true
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    // Subscribe to selected user changes
    this.subscription.add(
      this.workoutService.getSelectedUser().subscribe(user => {
        console.log('Selected user changed:', user?.name); // Debug log
        this.selectedUser = user;
        this.updateChartData();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleChartType(): void {
    this.isBarChart = !this.isBarChart;
    // Force chart update after type change
    setTimeout(() => {
      this.updateChartData();
    });
  }

  private updateChartData(): void {
    this.loading = true;
    console.log('Updating chart data for user:', this.selectedUser?.name); // Debug log

    if (!this.selectedUser || !this.selectedUser.workouts.length) {
      this.chartData.labels = [];
      this.chartData.datasets[0].data = [];
      this.updateChart();
      this.loading = false;
      return;
    }

    // Group workouts by type and calculate total minutes
    const workoutsByType = this.selectedUser.workouts.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + workout.minutes;
      return acc;
    }, {} as { [key: string]: number });

    // Sort workout types by total minutes in descending order
    const sortedTypes = Object.entries(workoutsByType)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);

    const colors = this.generateColors(sortedTypes.length);

    // Create a new chart data object to force update
    this.chartData = {
      labels: sortedTypes,
      datasets: [{
        data: sortedTypes.map(type => workoutsByType[type]),
        label: 'Minutes',
        backgroundColor: colors.map(color => `rgba(${color}, 0.2)`),
        borderColor: colors.map(color => `rgba(${color}, 1)`),
        borderWidth: 1,
        fill: true
      }]
    };

    this.updateChart();
    this.loading = false;
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  private generateColors(count: number): string[] {
    const baseColors = [
      '75, 192, 192',  // Teal
      '255, 99, 132',  // Red
      '255, 205, 86',  // Yellow
      '54, 162, 235',  // Blue
      '153, 102, 255', // Purple
      '255, 159, 64'   // Orange
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }
}
