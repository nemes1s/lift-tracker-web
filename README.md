# LiftTracker Web

A free, offline-first progressive web application for tracking weightlifting workouts, sets, and progress. Built for serious lifters who want complete control over their training data.

**🚀 Try it live:** [https://lifttracker.online](https://lifttracker.online)

## About

LiftTracker is a modern workout tracking PWA that stores all your data locally on your device using IndexedDB. No account required, no cloud sync, no data collection - just pure workout tracking that works offline. Inspired by the iOS LiftTracker app, rebuilt for the web with enhanced features and cross-platform support.

## Features

### Core Functionality
- **Program Management**: Create and manage multiple training programs with built-in templates (5-day split, 3-day split, minimal effort 4-day, upper/lower 4-day)
- **Workout Tracking**: Log sets with weight, reps, and RPE (Rate of Perceived Exertion)
- **Smart Recommendations**: Get recommended workouts based on your training history
- **Week Tracking**: Automatically track which week you're on in your program with progressive overload
- **Previous Workout Reference**: Quickly reference your performance from previous sessions to beat your numbers

### Data & Analytics
- **Workout History**: View all past workouts with detailed exercise and set information
- **Progress Charts**: Visualize your strength progression over time with interactive charts
- **Calendar View**: See your training consistency at a glance with a workout calendar
- **Personal Records**: Automatic PR tracking for all exercises
- **Exercise History**: Review performance trends for individual exercises

### Technical Features
- **100% Offline Support**: All data stored locally in IndexedDB - works without internet
- **No Account Required**: Your data stays on your device, completely private
- **Progressive Web App**: Install on any device (iOS, Android, desktop) like a native app
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Eye-friendly dark theme for late-night gym sessions
- **CSV Import/Export**: Easily backup and transfer your data
- **Advanced Periodization**: Support for 3-phase training cycles with exercise variations

## Why LiftTracker?

- **Privacy First**: Your workout data never leaves your device. No tracking, no analytics, no cloud uploads.
- **Lightning Fast**: Instant load times and smooth performance, even offline.
- **No Subscriptions**: Completely free, forever. No paywalls, no premium tiers.
- **Built by Lifters, for Lifters**: Designed with actual strength training methodology in mind.
- **Own Your Data**: Export anytime, import anywhere. Your data belongs to you.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router v7** for client-side navigation
- **Zustand** for lightweight state management
- **Dexie.js** for IndexedDB wrapper (offline data storage)
- **Tailwind CSS v4** for utility-first styling
- **Lucide React** for beautiful icons
- **Recharts** for progress visualization
- **PWA Plugin** for installable app experience

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

The app is currently deployed at **[https://lifttracker.online](https://lifttracker.online)**.

You can deploy your own instance to any static hosting service:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static hosting provider

Simply run `npm run build` and deploy the `dist` folder.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with IndexedDB support

## Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or pull requests, all contributions help make LiftTracker better.

## License

This project is open source and available for personal and commercial use.

## Acknowledgments

Inspired by the original iOS LiftTracker app. Built with modern web technologies to bring offline-first workout tracking to everyone.
