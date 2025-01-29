export interface Workout {
    type: string;
    duration: number;
    date: Date;
}

export interface User {
    id: string;
    name: string;
    workouts: Workout[];
}
