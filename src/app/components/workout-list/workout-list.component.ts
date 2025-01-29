import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { WorkoutService, User, Workout } from '../../services/workout.service';

@Component({
  selector: 'app-workout-list',
  template: `
    <div class="card animate-slide-up">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Workout List</h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Total Users: {{dataSource.data.length}}</span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <mat-form-field appearance="outline" class="animate-fade-in">
          <mat-label>Search by name</mat-label>
          <div class="flex items-center">
            <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
            <input matInput 
                   (keyup)="applyFilter($event)" 
                   placeholder="Type to search" 
                   #input
                   class="py-1">
          </div>
        </mat-form-field>

        <mat-form-field appearance="outline" class="animate-fade-in">
          <mat-label>Filter by workout type</mat-label>
          <mat-select (selectionChange)="filterByWorkoutType($event.value)" [value]="'All'">
            <mat-option value="All">All Types</mat-option>
            <mat-option *ngFor="let type of workoutTypes" [value]="type">
              {{type}}
            </mat-option>
          </mat-select>
          <mat-icon matSuffix class="text-gray-400">filter_list</mat-icon>
        </mat-form-field>
      </div>

      <div class="overflow-hidden rounded-xl shadow-lg animate-scale-in">
        <table mat-table [dataSource]="dataSource" matSort class="w-full workout-table">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> 
              <div class="flex items-center space-x-2">
                <mat-icon class="text-gray-400">person</mat-icon>
                <span>Name</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let row" class="font-medium"> {{row.name}} </td>
          </ng-container>

          <!-- Workouts Column -->
          <ng-container matColumnDef="workouts">
            <th mat-header-cell *matHeaderCellDef>
              <div class="flex items-center space-x-2">
                <mat-icon class="text-gray-400">fitness_center</mat-icon>
                <span>Workouts</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let row"> 
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let workout of row.workouts" 
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      [ngClass]="getWorkoutTypeClass(workout.type)">
                  {{workout.type}} ({{workout.minutes}} min)
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Total Workouts Column -->
          <ng-container matColumnDef="totalWorkouts">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              <div class="flex items-center space-x-2">
                <mat-icon class="text-gray-400">format_list_numbered</mat-icon>
                <span>Total Workouts</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let row"> 
              <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                {{row.workouts.length}}
              </span>
            </td>
          </ng-container>

          <!-- Total Minutes Column -->
          <ng-container matColumnDef="totalMinutes">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              <div class="flex items-center space-x-2">
                <mat-icon class="text-gray-400">schedule</mat-icon>
                <span>Total Minutes</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let row"> 
              <span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {{calculateTotalMinutes(row.workouts)}}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
              (click)="selectUser(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell text-center py-8" colspan="4">
              <div class="flex flex-col items-center justify-center space-y-3">
                <mat-icon class="text-gray-400 text-4xl">search_off</mat-icon>
                <span class="text-gray-500">No data matching the filter "{{input.value}}"</span>
              </div>
            </td>
          </tr>
        </table>

        <mat-paginator class="bg-gray-50"
                      [pageSizeOptions]="[5, 10, 25]"
                      [pageSize]="10"
                      showFirstLastButtons
                      aria-label="Select page of users"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WorkoutListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'workouts', 'totalWorkouts', 'totalMinutes'];
  dataSource: MatTableDataSource<User>;
  workoutTypes: string[];

  constructor(private workoutService: WorkoutService) {
    this.dataSource = new MatTableDataSource();
    this.workoutTypes = this.workoutService.getWorkoutTypes();
  }

  ngOnInit() {
    this.workoutService.getUsers().subscribe(users => {
      this.dataSource.data = users;
      this.setupFilters();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupFilters() {
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.name.toLowerCase().includes(searchStr) ||
             data.workouts.some(w => w.type.toLowerCase().includes(searchStr));
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByWorkoutType(type: string) {
    if (type === 'All') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (data: User) => {
        return data.workouts.some(w => w.type === type);
      };
      this.dataSource.filter = type;
    }
  }

  getWorkoutTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'Running': 'bg-green-100 text-green-700',
      'Cycling': 'bg-blue-100 text-blue-700',
      'Swimming': 'bg-cyan-100 text-cyan-700',
      'Yoga': 'bg-purple-100 text-purple-700',
      'Weightlifting': 'bg-orange-100 text-orange-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
  }

  calculateTotalMinutes(workouts: Workout[]): number {
    return workouts.reduce((total, workout) => total + workout.minutes, 0);
  }

  selectUser(user: User) {
    this.workoutService.setSelectedUser(user);
  }
}
