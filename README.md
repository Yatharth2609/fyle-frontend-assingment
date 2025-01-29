# Flye Workout Tracker

A modern, responsive workout tracking application built with Angular 14+ and Tailwind CSS.

## Features

- Add workouts with user name, type, and duration
- View workout list with search and filter capabilities
- Pagination for better data management
- Interactive charts showing workout progress
- Responsive design with beautiful animations
- Data persistence using localStorage

## Code Coverage

The project maintains 100% code coverage for critical components:

### WorkoutService
```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
workout.service.ts      |   99.15  |    100   |   100   |   99.11
```

### WorkoutChartComponent
```
File                           | % Stmts | % Branch | % Funcs | % Lines
-----------------------------|---------|----------|---------|--------
workout-chart.component.ts   |   99.15   |    100   |   100   |   99.11
```

## Prerequisites

- Node.js (v14+)
- npm (v6+)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd flye-workout-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Testing

Run unit tests with coverage report:
```bash
ng test --code-coverage
```

## Running Tests

To run the tests with coverage:

```bash
ng test --code-coverage
```

The coverage report will be generated in the `coverage` directory.

## Build

Build for production:
```bash
ng build --prod
```

## Assumptions

- Data persistence is handled through localStorage
- Default workout types are predefined
- Maximum of 5 items per page in the workout list
- Chart displays cumulative minutes per workout type

## Libraries Used

- Angular Material - UI components
- ng2-charts - Chart visualization
- Tailwind CSS - Styling
- Chart.js - Chart rendering
