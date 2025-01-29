import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgChartsModule } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject } from 'rxjs';
import { WorkoutChartComponent } from './workout-chart.component';
import { WorkoutService, User } from '../../services/workout.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WorkoutChartComponent', () => {
  let component: WorkoutChartComponent;
  let fixture: ComponentFixture<WorkoutChartComponent>;
  let workoutService: jasmine.SpyObj<WorkoutService>;
  let selectedUserSubject: BehaviorSubject<User | null>;

  beforeEach(async () => {
    selectedUserSubject = new BehaviorSubject<User | null>(null);
    workoutService = jasmine.createSpyObj('WorkoutService', ['getSelectedUser']);
    workoutService.getSelectedUser.and.returnValue(selectedUserSubject);

    await TestBed.configureTestingModule({
      declarations: [ WorkoutChartComponent ],
      imports: [
        NgChartsModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: WorkoutService, useValue: workoutService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty chart data', () => {
    expect(component.chartData.labels).toEqual([]);
    expect(component.chartData.datasets[0].data).toEqual([]);
  });

  it('should update chart data when user changes', (done) => {
    const testUser: User = {
      id: '1',
      name: 'Test User',
      workouts: [
        { type: 'Running', minutes: 30, date: new Date() },
        { type: 'Running', minutes: 45, date: new Date() },
        { type: 'Cycling', minutes: 60, date: new Date() }
      ]
    };

    selectedUserSubject.next(testUser);
    fixture.detectChanges();

    // Use setTimeout to wait for chart update
    setTimeout(() => {
      expect(component.chartData.labels).toContain('Running');
      expect(component.chartData.labels).toContain('Cycling');
      expect(component.chartData.datasets[0].data).toContain(75); // 30 + 45 minutes for Running
      expect(component.chartData.datasets[0].data).toContain(60); // 60 minutes for Cycling
      done();
    });
  });

  it('should toggle chart type', () => {
    expect(component.isBarChart).toBeTrue();
    
    component.toggleChartType();
    expect(component.isBarChart).toBeFalse();
    
    component.toggleChartType();
    expect(component.isBarChart).toBeTrue();
  });

  it('should handle null user data', (done) => {
    selectedUserSubject.next(null);
    fixture.detectChanges();

    // Use setTimeout to wait for chart update
    setTimeout(() => {
      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets[0].data).toEqual([]);
      done();
    });
  });

  it('should handle empty workouts array', (done) => {
    const testUser: User = {
      id: '1',
      name: 'Test User',
      workouts: []
    };

    selectedUserSubject.next(testUser);
    fixture.detectChanges();

    // Use setTimeout to wait for chart update
    setTimeout(() => {
      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets[0].data).toEqual([]);
      done();
    });
  });

  it('should clean up subscription on destroy', () => {
    const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should update chart when type changes', (done) => {
    const testUser: User = {
      id: '1',
      name: 'Test User',
      workouts: [
        { type: 'Running', minutes: 30, date: new Date() }
      ]
    };

    selectedUserSubject.next(testUser);
    fixture.detectChanges();

    component.toggleChartType();
    fixture.detectChanges();

    // Use setTimeout to wait for chart update
    setTimeout(() => {
      expect(component.chartType).toBe('line');
      expect(component.chartData.labels).toContain('Running');
      expect(component.chartData.datasets[0].data).toContain(30);
      done();
    });
  });
});
