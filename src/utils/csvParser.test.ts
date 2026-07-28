import { describe, it, expect } from 'vitest';
import { parseCSV } from './csvParser';

describe('csvParser', () => {
  describe('parseCSV - Format 1 (Simple)', () => {
    it('should parse valid simple CSV format', () => {
      const csv = `Program Name,My Test Program
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,3,8-10,Focus on form
0,Upper Body,Rows,3,8-10,
1,Lower Body,Squat,4,6-8,
1,Lower Body,Deadlift,3,5,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.programName).toBe('My Test Program');
        expect(result.data.totalWeeks).toBe(12);
        expect(result.data.days).toHaveLength(2);

        // Check day 0
        const day0 = result.data.days.find(d => d.dayIndex === 0);
        expect(day0).toBeDefined();
        expect(day0?.dayName).toBe('Upper Body');
        expect(day0?.exercises).toHaveLength(2);
        expect(day0?.exercises[0].name).toBe('Bench Press');
        expect(day0?.exercises[0].targetSets).toBe(3);
        expect(day0?.exercises[0].targetReps).toBe('8-10');
        expect(day0?.exercises[0].notes).toBe('Focus on form');

        // Check day 1
        const day1 = result.data.days.find(d => d.dayIndex === 1);
        expect(day1).toBeDefined();
        expect(day1?.dayName).toBe('Lower Body');
        expect(day1?.exercises).toHaveLength(2);
      }
    });

    it('should handle exercises with myoreps and lengthened partials flags', () => {
      const csv = `Program Name,Test Program
Total Weeks,8
Day Index,Day Name,Exercise Name,Sets,Reps,Notes,Is Myoreps,Is Lengthened Partials
0,Upper,Lateral Raise,3,12-15,,true,
0,Upper,Dumbbell Curl,3,10-12,,true,true`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        const exercises = result.data.days[0].exercises;
        expect(exercises[0].isMyoreps).toBe(true);
        expect(exercises[0].isLengthenedPartials).toBeUndefined();
        expect(exercises[1].isMyoreps).toBe(true);
        expect(exercises[1].isLengthenedPartials).toBe(true);
      }
    });

    it('should reject CSV with missing program name', () => {
      const csv = `Program Name,
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,3,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Program name cannot be empty');
      }
    });

    it('should reject CSV with invalid total weeks', () => {
      const csv = `Program Name,Test
Total Weeks,invalid
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,3,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Total weeks must be a positive number');
      }
    });

    it('should reject CSV with invalid day index', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
7,Invalid Day,Bench Press,3,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Day Index must be 0-6');
      }
    });

    it('should reject CSV with invalid sets', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,0,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Sets must be positive');
      }
    });

    it('should handle empty notes field', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,3,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days[0].exercises[0].notes).toBeUndefined();
      }
    });

    it('should preserve exercise order', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper,Exercise 1,3,10,
0,Upper,Exercise 2,3,10,
0,Upper,Exercise 3,3,10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        const exercises = result.data.days[0].exercises;
        expect(exercises[0].name).toBe('Exercise 1');
        expect(exercises[0].orderIndex).toBe(0);
        expect(exercises[1].name).toBe('Exercise 2');
        expect(exercises[1].orderIndex).toBe(1);
        expect(exercises[2].name).toBe('Exercise 3');
        expect(exercises[2].orderIndex).toBe(2);
      }
    });
  });

  describe('parseCSV - Format 2 (Week-based)', () => {
    it('should parse valid week-based CSV format', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;Focus on form
1;0;Upper A;Rows;4;8-10;
5;0;Upper A;Dumbbell Press;4;8-10;
5;0;Upper A;Cable Rows;4;10-12;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalWeeks).toBe(5);
        expect(result.data.days).toHaveLength(2);

        // Week 1 exercises
        const week1 = result.data.days.find(d => d.weekNumber === 1);
        expect(week1).toBeDefined();
        expect(week1?.exercises).toHaveLength(2);
        expect(week1?.exercises[0].name).toBe('Bench Press');

        // Week 5 exercises
        const week5 = result.data.days.find(d => d.weekNumber === 5);
        expect(week5).toBeDefined();
        expect(week5?.exercises).toHaveLength(2);
        expect(week5?.exercises[0].name).toBe('Dumbbell Press');
      }
    });

    it('should handle multiple days and weeks', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;
1;1;Lower A;Squat;4;6-8;
5;0;Upper A;Incline Press;4;8-10;
5;1;Lower A;Front Squat;4;8-10;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days).toHaveLength(4); // 2 weeks × 2 days
        expect(result.data.totalWeeks).toBe(5);
      }
    });

    it('should handle myoreps and lengthened partials in week-based format', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials
1;0;Upper;Lateral Raise;3;12-15;;true;
1;0;Upper;Dumbbell Curl;3;10-12;;true;true`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        const exercises = result.data.days[0].exercises;
        expect(exercises[0].isMyoreps).toBe(true);
        expect(exercises[0].isLengthenedPartials).toBeUndefined();
        expect(exercises[1].isMyoreps).toBe(true);
        expect(exercises[1].isLengthenedPartials).toBe(true);
      }
    });

    it('should skip incomplete lines in week-based format', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;
invalid line
1;0;Upper A;Rows;4;8-10;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days[0].exercises).toHaveLength(2);
      }
    });

    it('should infer program name from workout name', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;My Custom Program (Phase 1);Bench Press;4;6-8;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.programName).toContain('My Custom Program');
      }
    });

    it('should calculate max week correctly', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper;Exercise 1;3;10;
5;0;Upper;Exercise 2;3;10;
9;0;Upper;Exercise 3;3;10;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalWeeks).toBe(9);
      }
    });

    it('should reject week-based CSV with missing required columns', () => {
      const csv = `week;day_index;workout_name;exercise_name
1;0;Upper A;Bench Press`;

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing required columns');
      }
    });
  });

  describe('parseCSV - superset groups', () => {
    it('should parse superset_group in format 2', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials;superset_group
1;0;Express Upper;Bench Press;3;8-10;;;;1
1;0;Express Upper;Barbell Row;3;8-10;;;;1
1;0;Express Upper;Lateral Raise;3;12-15;;;;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      const exercises = result.data!.days[0].exercises;
      expect(exercises[0].supersetGroup).toBe(1);
      expect(exercises[1].supersetGroup).toBe(1);
      expect(exercises[2].supersetGroup).toBeUndefined();
    });

    it('should parse Superset Group in format 1', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes,Is Myoreps,Is Lengthened Partials,Superset Group
0,Upper,Bench Press,3,8-10,,,,2
0,Upper,Barbell Row,3,8-10,,,,2
0,Upper,Lateral Raise,3,12-15,,,,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      const exercises = result.data!.days[0].exercises;
      expect(exercises[0].supersetGroup).toBe(2);
      expect(exercises[1].supersetGroup).toBe(2);
      expect(exercises[2].supersetGroup).toBeUndefined();
    });

    it('should treat blank, zero and non-numeric groups as no superset', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;superset_group
1;0;Day;Bench Press;3;8-10;;
1;0;Day;Barbell Row;3;8-10;;0
1;0;Day;Lateral Raise;3;12-15;;abc`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      for (const exercise of result.data!.days[0].exercises) {
        expect(exercise.supersetGroup).toBeUndefined();
      }
    });

    it('should stay backwards compatible when the column is absent', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data!.days[0].exercises[0].supersetGroup).toBeUndefined();
    });
  });

  describe('parseCSV - Format detection', () => {
    it('should detect format 1 by comma delimiter', () => {
      const csv = `Program Name,Test
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Upper Body,Bench Press,3,8-10,`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
    });

    it('should detect format 2 by semicolon and week header', () => {
      const csv = `week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days[0].weekNumber).toBe(1);
      }
    });

    it('should handle empty CSV', () => {
      const csv = '';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('CSV file is too short');
      }
    });

    it('should handle CSV with only whitespace', () => {
      const csv = '\n\n\n';

      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('CSV file is too short');
      }
    });
  });
});
