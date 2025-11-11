# CSV Format Guide for LiftTracker

This guide shows how to format CSV files for importing programs with Myoreps and Lengthened Partials technique flags.

## Format 1: Simple (Comma-Delimited)

### Structure
```
Program Name,<name>
Total Weeks,<number>
Day Index,Day Name,Exercise Name,Sets,Reps,Notes,Is Myoreps,Is Lengthened Partials
<data rows>
```

### Columns
- **Day Index**: 0-6 (which day of the week)
- **Day Name**: Name of the workout day
- **Exercise Name**: Name of the exercise
- **Sets**: Number of sets (integer)
- **Reps**: Rep range (e.g., "8-10" or "12-15")
- **Notes**: Optional notes about the exercise
- **Is Myoreps**: `true` or `1` for myoreps, leave empty otherwise
- **Is Lengthened Partials**: `true` or `1` for lengthened partials, leave empty otherwise

### Example
```csv
Program Name,My Custom Program
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes,Is Myoreps,Is Lengthened Partials
0,Push Day,Bench Press,4,5-8,Primary chest,
0,Push Day,Overhead Press,3,8-10,,
0,Push Day,Lateral Raise,3,12-15,Focus on stretch,true,
0,Push Day,Triceps Pushdown,3,10-12,,true,
1,Pull Day,Deadlift,3,3-5,Heavy day,
1,Pull Day,Pull-Ups,4,6-8,,
1,Pull Day,Incline Dumbbell Curl,3,10-12,Use full ROM,true,true
1,Pull Day,Face Pulls,3,15-20,,true,
2,Leg Day,Squat,4,5-8,,
2,Leg Day,Romanian Deadlift,3,8-10,Deep stretch,,true
2,Leg Day,Leg Curl,3,10-12,,true,true
2,Leg Day,Calf Raise,4,12-15,,true,true
```

## Format 2: Advanced (Semicolon-Delimited, Week-Specific)

### Structure
```
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials
<data rows>
```

### Columns
- **week**: Week number (1, 5, 9 for periodization)
- **day_index**: 0-6 (which day)
- **workout_name**: Name of the workout
- **exercise_name**: Name of the exercise
- **target_sets**: Number of sets
- **target_reps**: Rep range
- **notes**: Optional notes
- **is_myoreps**: `true` or `1` for myoreps
- **is_lengthened_partials**: `true` or `1` for lengthened partials

### Example with Periodization
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials
1;0;Upper A;Bench Press;4;6-8;Base phase;
1;0;Upper A;Barbell Row;4;6-8;;
1;0;Upper A;Lateral Raise;3;12-15;;true;
1;0;Upper A;Dumbbell Curl;3;10-12;;true;true
1;1;Lower A;Squat;4;6-8;;
1;1;Lower A;RDL;3;8-10;Focus on stretch;;true
1;1;Lower A;Leg Curl;3;10-12;;true;true
5;0;Upper A;Dumbbell Press;4;8-10;Variation phase;
5;0;Upper A;Cable Row;4;8-10;;
5;0;Upper A;Cable Lateral Raise;3;15-20;;true;
5;0;Upper A;EZ Bar Curl;3;10-12;;true;true
5;1;Lower A;Front Squat;4;6-8;;
5;1;Lower A;Good Morning;3;8-10;Deep stretch;;true
5;1;Lower A;Lying Leg Curl;3;10-12;;true;true
```

## Technique Flag Guidelines

### Myoreps (Best For)
- Isolation exercises
- Exercises performed later in workout
- Examples: lateral raises, curls, triceps extensions, face pulls, calf raises, leg extensions

### Lengthened Partials (Best For)
- Exercises with good stretch position
- Can be combined with myoreps
- Examples: curls (bottom half), leg curls, Romanian deadlifts, cable flyes, calf raises

### Setting Flags
- Use `true` or `1` in the appropriate column
- Leave empty or use `false` to not apply the technique
- You can apply both techniques to the same exercise (e.g., curls with myoreps AND lengthened partials)

## Exporting Your Program

To export your program with technique flags:
1. Go to **Settings**
2. Find your program and click **"View Program"**
3. The export will automatically include the technique flags in the CSV

The exported format will be Format 2 (semicolon-delimited) and will look like:
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials
1;0;Day 1 – Upper;Barbell Bench Press;4;5-8;Primary horizontal press;;
1;0;Day 1 – Upper;Lateral Raise;3;12-15;;true;
1;0;Day 1 – Upper;Dumbbell Curl;3;10-12;;true;true
```

## Tips

- Both formats work equally well for import
- Format 2 is better for programs with periodization (different exercises per week)
- Format 1 is simpler for basic programs
- Empty values are okay - just use commas (Format 1) or semicolons (Format 2)
- You can mix and match techniques on exercises as needed
