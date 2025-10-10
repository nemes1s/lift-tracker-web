# LiftTracker Web

A progressive web application for tracking weightlifting workouts, recreated from the iOS LiftTracker app.

## Features

- **Program Management**: Create and manage multiple training programs (5-day split, 3-day split, minimal effort 4-day, upper/lower 4-day)
- **Workout Tracking**: Log sets with weight, reps, and RPE (Rate of Perceived Exertion)
- **Smart Recommendations**: Get recommended workouts based on your training history
- **Workout History**: View all past workouts with detailed exercise and set information
- **Week Tracking**: Automatically track which week you're on in your program
- **Previous Workout Reference**: Quickly reference your performance from previous sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Offline Support**: All data stored locally in IndexedDB for offline access

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router** for navigation
- **Zustand** for state management
- **Dexie.js** for IndexedDB database
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons

## Getting Started

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment

The app is ready to be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
