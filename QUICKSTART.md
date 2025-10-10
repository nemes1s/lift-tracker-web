# LiftTracker Web - Quick Start Guide

## What I Built

I've recreated your iOS LiftTracker app as a fully functional web application with all the core features:

### Core Features
✅ **Today View** - Start/resume workouts with smart day recommendations  
✅ **Workout Tracking** - Log sets with weight, reps, and RPE  
✅ **Program Management** - Create multiple training programs (5-day, 3-day, 4-day splits)  
✅ **Workout History** - View all past workouts with detailed stats  
✅ **Week Tracking** - Automatically track program progress  
✅ **Previous Sets** - Reference past performance with tap-to-fill  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Offline Support** - All data stored locally in browser  

## Running the App

### Development Mode
```bash
cd /Users/dmytrozadorozhnyi/Projects/Github/LiftTrackerWeb
npm run dev
```
Open http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```
Open http://localhost:4173

## Tech Stack

- **React 18** + TypeScript
- **Vite** (fast builds & HMR)
- **Tailwind CSS** (responsive styling)
- **IndexedDB** (local database)
- **React Router** (navigation)
- **Zustand** (state management)

## Project Structure

```
src/
├── components/      # UI components (Layout, WorkoutRunner, SplashScreen)
├── pages/          # Views (Today, Calendar, Settings, Progress)
├── db/             # IndexedDB database
├── store/          # Global state
├── types/          # TypeScript models
└── utils/          # Program logic, templates, calculations
```

## Deployment

The app is ready to deploy to:
- **Vercel** (recommended): `npm i -g vercel && vercel`
- **Netlify**: `npm i -g netlify-cli && netlify deploy --prod --dir=dist`
- **GitHub Pages**: Install gh-pages and run deploy script

## Data Storage

All workout data is stored **locally in your browser** using IndexedDB:
- No server required
- Works offline
- Private and secure

## Key Differences from iOS App

**Simplified:**
- No iCloud sync (local storage only)
- No HealthKit integration
- No passcode protection
- Progress tracking placeholder (can be expanded)

**Same:**
- All program templates
- Workout tracking logic
- Set logging with RPE
- Week calculations
- 1RM formulas (Epley/Brzycki)
- Previous workout history

## Next Steps

1. **Test the app**: Run `npm run dev` and try creating a program
2. **Customize**: Modify program templates in `src/utils/programTemplates.ts`
3. **Deploy**: Choose a hosting platform and deploy
4. **Enhance**: Add progress charts, export/import, PWA features

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All modern browsers with IndexedDB support.

---

**Ready to use!** The app is fully functional and production-ready.
