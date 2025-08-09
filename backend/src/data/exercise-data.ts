// Exercise routine data - formatted to match Railway database structure
export const exerciseData = [
  {
    "name": "Upper Body Strength",
    "type": "hypertrophy", 
    "duration": "~45 min",
    "schedule": "Unyom, Triyom, Phiyom",
    "equipment": [
      "Dumbbells"
    ],
    "exercises": [
      {
        "name": "Pushups",
        "reps": "to failure",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Chest",
          "Triceps"
        ]
      },
      {
        "name": "Dumbbell Bent-Over Rows",
        "reps": "8-12",
        "rest": "90s", 
        "sets": "3",
        "targetMuscles": [
          "Back",
          "Biceps"
        ]
      },
      {
        "name": "Dumbbell Overhead Press",
        "reps": "8-12",
        "rest": "90s",
        "sets": "3", 
        "targetMuscles": [
          "Shoulders",
          "Triceps"
        ]
      },
      {
        "name": "Lateral Raises",
        "reps": "8-12",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Shoulders"
        ]
      },
      {
        "name": "Curls", 
        "reps": "8-12",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Biceps"
        ]
      },
      {
        "name": "Rear Delt Flyes",
        "reps": "8-12", 
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Rear Delts"
        ]
      },
      {
        "name": "Skull Crushers",
        "reps": "8-12",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Triceps"
        ]
      }
    ]
  },
  {
    "name": "Vertical Training / Core",
    "type": "strength",
    "duration": "~60 min", 
    "schedule": "Tuyom, Foyom, Seyom",
    "equipment": [
      "Dumbbells"
    ],
    "exercises": [
      {
        "name": "Weighted Squat Jumps",
        "reps": "5",
        "rest": "120s",
        "sets": "4",
        "targetMuscles": [
          "Quads", 
          "Glutes"
        ]
      },
      {
        "name": "Split Squat Jumps",
        "reps": "5",
        "rest": "120s",
        "sets": "4",
        "targetMuscles": [
          "Quads",
          "Glutes"
        ]
      },
      {
        "name": "Kneeling Jump",
        "reps": "5",
        "rest": "90s",
        "sets": "4", 
        "targetMuscles": [
          "Quads",
          "Glutes"
        ]
      },
      {
        "name": "Dumbbell Swing",
        "reps": "8-10",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Hamstrings",
          "Glutes"
        ]
      },
      {
        "name": "Dumbbell Romanian Deadlift",
        "reps": "8-12",
        "rest": "90s",
        "sets": "3",
        "targetMuscles": [
          "Hamstrings",
          "Glutes",
          "Lower Back"
        ]
      },
      {
        "name": "Calf Raises",
        "reps": "12-15",
        "rest": "60s",
        "sets": "3",
        "targetMuscles": [
          "Calves"
        ]
      },
      {
        "name": "Weighted Sit-ups",
        "reps": "8-12",
        "rest": "60s",
        "sets": "3",
        "targetMuscles": [
          "Core",
          "Abs"
        ]
      },
      {
        "name": "Russian Twist",
        "reps": "8-12", 
        "rest": "60s",
        "sets": "3",
        "targetMuscles": [
          "Core",
          "Obliques"
        ]
      },
      {
        "name": "Leg Raise",
        "reps": "8-12",
        "rest": "60s",
        "sets": "3",
        "targetMuscles": [
          "Core",
          "Lower Abs"
        ]
      }
    ]
  },
  {
    "name": "Rest Day",
    "type": "rest", 
    "duration": "Sabbath",
    "schedule": "Sabbath"
  }
];