# CSV Import Format for LiftTracker

## Overview
You can import workout programs into LiftTracker using CSV files. Two formats are supported:
1. **Simple Format** - Basic programs with the same exercises each week
2. **Advanced Format** - Sophisticated programs with week-specific progressions

## Format 1: Simple Format (Comma-Delimited)

### Structure

**Line 1:** Program metadata
```csv
Program Name,<your program name>
```

**Line 2:** Program duration
```csv
Total Weeks,<number of weeks>
```

**Line 3:** Column headers
```csv
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
```

**Data Rows:** One row per exercise
```csv
0,Day 1 - Push,Barbell Bench Press,4,5-8,
0,Day 1 - Push,Overhead Press,3,8-10,Focus on form
1,Day 2 - Pull,Deadlift,4,5-8,
```

### Example
```csv
Program Name,Push Pull Legs
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Day 1 - Push,Barbell Bench Press,4,5-8,
0,Day 1 - Push,Incline Dumbbell Press,3,8-10,
0,Day 1 - Push,Overhead Press,3,8-10,
1,Day 2 - Pull,Deadlift,4,5-8,Focus on form
1,Day 2 - Pull,Pull-Ups,3,6-10,
2,Day 3 - Legs,Barbell Squat,4,6-8,
2,Day 3 - Legs,Leg Press,3,10-12,
```

## Format 2: Advanced Format (Semicolon-Delimited)

This format supports **week-specific variations**, allowing different exercises or set/rep schemes for each week of your program. This is ideal for progressive overload programs.

### Structure

**Line 1:** Column headers (semicolon-delimited)
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
```

**Data Rows:** One row per exercise per week
```csv
1;0;Upper (Strength Focus);45° Incline Barbell Press;2;6-6;1 second pause at the bottom
1;0;Upper (Strength Focus);Wide-Grip Pull-Up;2;6-10;Slow 2-3 second negative
2;0;Upper (Strength Focus);45° Incline Barbell Press;3;6-6;1 second pause at the bottom
2;0;Upper (Strength Focus);Wide-Grip Pull-Up;3;6-10;Slow 2-3 second negative
```

### Key Features
- **Week Column**: Each row specifies which week it belongs to
- **Progressive Overload**: Sets/reps can change week by week
- **Exercise Variations**: Different exercises for different weeks
- **Detailed Notes**: Comprehensive form cues and technique notes

### Example
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper (Strength Focus);45° Incline Barbell Press;2;6-6;1 second pause at the bottom
1;0;Upper (Strength Focus);Cable Crossover Ladder;2;6-10;
1;1;Lower (Strength Focus);Smith Machine Squat;2;6-6;
1;1;Lower (Strength Focus);Leg Extension;2;6-10;
2;0;Upper (Strength Focus);45° Incline Barbell Press;3;6-6;1 second pause at the bottom
2;0;Upper (Strength Focus);Cable Crossover Ladder;2;6-10;
2;1;Lower (Strength Focus);Smith Machine Squat;3;6-6;
2;1;Lower (Strength Focus);Leg Extension;2;6-10;
```

## Column Definitions

### Simple Format

| Column | Description | Required | Format |
|--------|-------------|----------|--------|
| Day Index | Day number (0-6) | Yes | Integer (0-6) |
| Day Name | Name of workout | Yes | Text |
| Exercise Name | Exercise name | Yes | Text |
| Sets | Target sets | Yes | Integer (1+) |
| Reps | Target rep range | Yes | Text (e.g., "5-8") |
| Notes | Exercise notes | No | Text |

### Advanced Format

| Column | Description | Required | Format |
|--------|-------------|----------|--------|
| week | Week number | Yes | Integer (1+) |
| day_index | Day number (0-6) | Yes | Integer (0-6) |
| workout_name | Name of workout | Yes | Text |
| exercise_name | Exercise name | Yes | Text |
| target_sets | Target sets | Yes | Integer (1+) |
| target_reps | Target rep range | Yes | Text (e.g., "5-8") |
| notes | Exercise notes | No | Text |

## Important Notes

### For Both Formats
- **Exercise Order**: Exercises appear in the exact order they're listed in the CSV
- **Day Order**: Days are sorted by Day Index (0 → 6)
- **File Extension**: Must be `.csv`

### Simple Format Specific
- Uses **comma delimiter** (`,`)
- Same exercises repeat each week
- Best for: Beginner programs, maintenance programs

### Advanced Format Specific
- Uses **semicolon delimiter** (`;`)
- Different exercises/sets/reps for each week
- Program name is inferred from first workout name
- Total weeks calculated from max week number in data
- Best for: Progressive programs, periodized training, advanced programming

## How to Import

1. Open LiftTracker and navigate to **Settings**
2. Scroll to the **Programs** section
3. Click the green **Import from CSV** button
4. Select your CSV file
5. Wait for import to complete
6. Your program will be automatically set as active

## Creating Your CSV

### Using Spreadsheet Software (Excel, Google Sheets, Numbers)

**Simple Format:**
1. Create three header rows (Program Name, Total Weeks, Column Headers)
2. Add your exercises below
3. Export/Save As → CSV (Comma delimited)

**Advanced Format:**
1. Create column headers: `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes`
2. Add exercises for each week
3. Export/Save As → CSV
4. Change delimiter to semicolon (`;`) if needed

### Tips
- **Test first**: Import `sample_program.csv` to understand the format
- **Backup**: Keep your CSV files as backups
- **Progressive programs**: Use Advanced Format for week-by-week progression
- **Week variations**: In Advanced Format, you can have completely different workouts for different weeks

## Sample Files

- **`sample_program.csv`** - Simple format example (Push/Pull/Legs)
- **`program_templates_from_xls.csv`** - Advanced format example (12-week progressive program)

## Troubleshooting

### Common Errors

**"CSV file is too short"**
- Ensure you have header row(s) and at least one data row

**"Missing required columns"**
- Check that your header matches the format exactly
- For Advanced Format, ensure semicolon delimiter is used

**"Day Index must be 0-6"**
- Day indices must be integers from 0 to 6

**"No valid exercise data found"**
- Check that all required columns have values
- Ensure sets are positive integers
- Ensure reps field is not empty

### Format Detection
The importer automatically detects which format you're using:
- **Semicolon (`;`) + "week" column** → Advanced Format
- **Comma (`,`)** or other → Simple Format

## Advanced Example: 12-Week Progressive Program

The included `program_templates_from_xls.csv` demonstrates:
- 12 weeks of progression
- 5 different workout days
- Progressive overload (sets increase over weeks)
- Detailed form cues in notes
- Exercise variations between phases

This format allows you to create sophisticated training programs with week-by-week variations in:
- Exercise selection
- Set/rep schemes
- Volume progression
- Intensity changes
