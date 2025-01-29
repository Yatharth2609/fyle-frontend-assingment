import { Component, OnInit } from '@angular/core';
import { WorkoutService } from './services/workout.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-gray-900">Workout Tracker</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <app-workout-form></app-workout-form>
          </div>
          <div>
            <app-workout-chart></app-workout-chart>
          </div>
        </div>
        <div class="mt-6">
          <app-workout-list></app-workout-list>
        </div>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    // Load initial data if no data exists
    const savedData = localStorage.getItem('workoutData');
    if (!savedData) {
      this.workoutService.initializeDefaultData();
    }
  }
}
