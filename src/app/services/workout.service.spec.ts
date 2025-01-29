import { TestBed } from '@angular/core/testing';
import { WorkoutService } from './workout.service';

describe('WorkoutService', () => {
  let service: WorkoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty users array when no data in localStorage', (done) => {
    service.getUsers().subscribe(users => {
      expect(users).toEqual([]);
      done();
    });
  });

  it('should add a new user', (done) => {
    service.addUser('John Doe');

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('John Doe');
      expect(users[0].workouts).toEqual([]);
      done();
    });
  });

  it('should not add user with empty name', (done) => {
    service.addUser('');

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(0);
      done();
    });
  });

  it('should not add duplicate user', (done) => {
    service.addUser('John Doe');
    service.addUser('John Doe');

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('John Doe');
      done();
    });
  });

  it('should add workout to existing user', (done) => {
    service.addUser('John Doe');
    service.addWorkout('John Doe', 'Running', 30);

    service.getUsers().subscribe(users => {
      expect(users[0].workouts.length).toBe(1);
      expect(users[0].workouts[0].type).toBe('Running');
      expect(users[0].workouts[0].minutes).toBe(30);
      done();
    });
  });

  it('should not add workout with invalid data', (done) => {
    service.addUser('John Doe');
    service.addWorkout('John Doe', '', 30);
    service.addWorkout('John Doe', 'Running', 0);
    service.addWorkout('John Doe', 'Running', -1);

    service.getUsers().subscribe(users => {
      expect(users[0].workouts.length).toBe(0);
      done();
    });
  });

  it('should create new user when adding workout to non-existent user', (done) => {
    service.addWorkout('Jane Smith', 'Yoga', 45);

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('Jane Smith');
      expect(users[0].workouts.length).toBe(1);
      expect(users[0].workouts[0].type).toBe('Yoga');
      expect(users[0].workouts[0].minutes).toBe(45);
      done();
    });
  });

  it('should set and get selected user', (done) => {
    service.addUser('John Doe');
    
    service.getUsers().subscribe(users => {
      service.setSelectedUser(users[0]);
      
      service.getSelectedUser().subscribe(selectedUser => {
        expect(selectedUser).toBeTruthy();
        expect(selectedUser?.name).toBe('John Doe');
        done();
      });
    });
  });

  it('should not set selected user that does not exist', (done) => {
    const nonExistentUser = {
      id: '999',
      name: 'Non Existent',
      workouts: []
    };

    service.setSelectedUser(nonExistentUser);
    
    service.getSelectedUser().subscribe(selectedUser => {
      expect(selectedUser).toBeNull();
      done();
    });
  });

  it('should clear selected user when setting to null', (done) => {
    service.addUser('John Doe');
    service.getUsers().subscribe(users => {
      service.setSelectedUser(users[0]);
      service.setSelectedUser(null);
      
      service.getSelectedUser().subscribe(selectedUser => {
        expect(selectedUser).toBeNull();
        done();
      });
    });
  });

  it('should persist data to localStorage', () => {
    service.addUser('John Doe');
    service.addWorkout('John Doe', 'Running', 30);

    const savedData = localStorage.getItem('workoutData');
    expect(savedData).toBeTruthy();
    
    const parsedData = JSON.parse(savedData!);
    expect(parsedData[0].name).toBe('John Doe');
    expect(parsedData[0].workouts[0].type).toBe('Running');
    expect(parsedData[0].workouts[0].minutes).toBe(30);
  });

  it('should persist selected user to localStorage', (done) => {
    service.addUser('John Doe');
    
    service.getUsers().subscribe(users => {
      service.setSelectedUser(users[0]);
      
      const savedUserId = localStorage.getItem('selectedUserId');
      expect(savedUserId).toBe(users[0].id);
      done();
    });
  });

  it('should load data from localStorage on initialization', (done) => {
    const testDate = new Date().toISOString();
    const testData = [{
      id: '1',
      name: 'Test User',
      workouts: [
        { type: 'Running', minutes: 30, date: testDate }
      ]
    }];

    localStorage.setItem('workoutData', JSON.stringify(testData));
    localStorage.setItem('selectedUserId', '1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(WorkoutService);
    
    newService.getSelectedUser().subscribe(selectedUser => {
      expect(selectedUser).toBeTruthy();
      expect(selectedUser?.name).toBe('Test User');
      expect(selectedUser?.workouts[0].date.toISOString()).toBe(testDate);
      done();
    });
  });

  it('should handle invalid data in localStorage', (done) => {
    localStorage.setItem('workoutData', 'invalid json');
    localStorage.setItem('selectedUserId', '1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(WorkoutService);
    
    newService.getUsers().subscribe(users => {
      expect(users).toEqual([]);
      done();
    });
  });

  it('should handle non-array data in localStorage', (done) => {
    localStorage.setItem('workoutData', JSON.stringify({ invalid: 'object' }));
    localStorage.setItem('selectedUserId', '1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(WorkoutService);
    
    newService.getUsers().subscribe(users => {
      expect(users).toEqual([]);
      done();
    });
  });

  it('should handle invalid user data in localStorage', (done) => {
    localStorage.setItem('workoutData', JSON.stringify([{ invalid: 'user' }]));
    localStorage.setItem('selectedUserId', '1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(WorkoutService);
    
    newService.getUsers().subscribe(users => {
      expect(users).toEqual([]);
      done();
    });
  });

  it('should handle invalid workout data in localStorage', (done) => {
    const testData = [{
      id: '1',
      name: 'Test User',
      workouts: [{ invalid: 'workout' }]
    }];

    localStorage.setItem('workoutData', JSON.stringify(testData));
    localStorage.setItem('selectedUserId', '1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(WorkoutService);
    
    newService.getUsers().subscribe(users => {
      expect(users).toEqual([]);
      done();
    });
  });

  it('should return workout types', () => {
    const types = service.getWorkoutTypes();
    expect(types).toContain('Running');
    expect(types).toContain('Cycling');
    expect(types).toContain('Swimming');
    expect(types).toContain('Yoga');
    expect(types).toContain('Weightlifting');
  });

  it('should initialize default data correctly', (done) => {
    service.initializeDefaultData();

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('Demo User');
      expect(users[0].workouts.length).toBe(3);
      expect(users[0].workouts[0].type).toBe('Running');
      expect(users[0].workouts[1].type).toBe('Cycling');
      expect(users[0].workouts[2].type).toBe('Swimming');
      done();
    });
  });
});
