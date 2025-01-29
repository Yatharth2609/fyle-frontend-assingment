import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  workouts: Workout[];
}

export interface Workout {
  type: string;
  minutes: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private users = new BehaviorSubject<User[]>([]);
  private selectedUser = new BehaviorSubject<User | null>(null);
  private readonly workoutTypes = ['Running', 'Cycling', 'Swimming', 'Yoga', 'Weightlifting'];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    try {
      const savedData = localStorage.getItem('workoutData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (!Array.isArray(parsedData)) {
          throw new Error('Invalid data format');
        }

        const users = parsedData.map((user: any) => {
          if (!user || typeof user !== 'object' || !user.id || !user.name || !Array.isArray(user.workouts)) {
            throw new Error('Invalid user data format');
          }
          return {
            ...user,
            workouts: user.workouts.map((workout: any) => {
              if (!workout || typeof workout !== 'object' || !workout.type || typeof workout.minutes !== 'number' || !workout.date) {
                throw new Error('Invalid workout data format');
              }
              return {
                ...workout,
                date: new Date(workout.date)
              };
            })
          };
        });

        this.users.next(users);
        
        const selectedUserId = localStorage.getItem('selectedUserId');
        if (selectedUserId) {
          const selectedUser = users.find((u: User) => u.id === selectedUserId);
          if (selectedUser) {
            this.selectedUser.next(selectedUser);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      this.clearData();
    }
  }

  private saveData(): void {
    try {
      const users = this.users.getValue();
      localStorage.setItem('workoutData', JSON.stringify(users));
      
      const selectedUser = this.selectedUser.getValue();
      if (selectedUser) {
        localStorage.setItem('selectedUserId', selectedUser.id);
      } else {
        localStorage.removeItem('selectedUserId');
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  getUsers(): Observable<User[]> {
    return this.users.asObservable();
  }

  addUser(name: string): void {
    const currentUsers = this.users.getValue();
    if (!name || currentUsers.some(u => u.name === name)) {
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      workouts: []
    };
    
    this.users.next([...currentUsers, newUser]);
    
    if (currentUsers.length === 0) {
      this.selectedUser.next(newUser);
    }
    
    this.saveData();
  }

  addWorkout(name: string, type: string, minutes: number): void {
    if (!name || !type || minutes <= 0) {
      return;
    }

    const currentUsers = this.users.getValue();
    let user = currentUsers.find(u => u.name === name);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        name,
        workouts: []
      };
      currentUsers.push(user);
    }

    const workout: Workout = {
      type,
      minutes,
      date: new Date()
    };

    user.workouts.push(workout);
    this.users.next([...currentUsers]);
    
    if (!this.selectedUser.getValue()) {
      this.selectedUser.next(user);
    }
    
    this.saveData();
  }

  setSelectedUser(user: User | null): void {
    if (user === null || this.users.getValue().some(u => u.id === user.id)) {
      this.selectedUser.next(user);
      this.saveData();
    }
  }

  getSelectedUser(): Observable<User | null> {
    return this.selectedUser.asObservable();
  }

  getWorkoutTypes(): string[] {
    return [...this.workoutTypes];
  }

  clearData(): void {
    this.users.next([]);
    this.selectedUser.next(null);
    localStorage.clear();
  }

  initializeDefaultData(): void {
    const defaultUser = {
      id: Date.now().toString(),
      name: 'Demo User',
      workouts: [
        {
          type: 'Running',
          minutes: 30,
          date: new Date()
        },
        {
          type: 'Cycling',
          minutes: 45,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        },
        {
          type: 'Swimming',
          minutes: 60,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ]
    };

    this.users.next([defaultUser]);
    this.selectedUser.next(defaultUser);
    this.saveData();
  }
}
