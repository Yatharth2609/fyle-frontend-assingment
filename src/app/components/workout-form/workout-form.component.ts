import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workout-form',
  template: `
    <div class="card fade-in">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Add Workout</h2>
      
      <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>User Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter name">
            <mat-error *ngIf="workoutForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Workout Type</mat-label>
            <mat-select formControlName="workoutType">
              <mat-option *ngFor="let type of workoutTypes" [value]="type">
                {{type}}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="workoutForm.get('workoutType')?.hasError('required')">
              Workout type is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Minutes</mat-label>
            <input matInput type="number" formControlName="minutes" placeholder="Enter minutes">
            <mat-error *ngIf="workoutForm.get('minutes')?.hasError('required')">
              Minutes are required
            </mat-error>
            <mat-error *ngIf="workoutForm.get('minutes')?.hasError('min')">
              Minutes must be greater than 0
            </mat-error>
          </mat-form-field>
        </div>

        <div class="flex justify-end">
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="workoutForm.invalid"
                  class="btn-primary">
            Add Workout
          </button>
        </div>
      </form>
    </div>
  `
})
export class WorkoutFormComponent {
  workoutForm: FormGroup;
  workoutTypes: string[];

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService
  ) {
    this.workoutTypes = this.workoutService.getWorkoutTypes();
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      workoutType: ['', Validators.required],
      minutes: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.workoutForm.valid) {
      const { name, workoutType, minutes } = this.workoutForm.value;
      this.workoutService.addWorkout(name, workoutType, minutes);
      this.workoutForm.reset();
    }
  }
}
