import pool from './database';

// Sample albums data (first 10 albums for testing)
const albumsData = [
  {
    id: 1,
    rank: 1,
    title: "Ys",
    artist: "Joanna Newsom",
    year: 2006,
    genre: "Folk, Singer-Songwriter",
    coverImage: "/images/albums/ys_joanna_newsom.jpg",
    description: "2694",
    youtubePlaylistId: "OLAK5uy_maIU33zxlEbqWl3Eu5yyA0cNK2juc3N8k",
    displayGenre: "Folk, Singer-Songwriter",
    categories: ["Folk"],
    spotifyAlbumId: ""
  },
  {
    id: 2,
    rank: 2,
    title: "Bringing It All Back Home",
    artist: "Bob Dylan",
    year: 1965,
    genre: "Folk Rock, Folk",
    coverImage: "/images/albums/bringing_it_all_back_home_bob_dylan.jpg",
    description: "46",
    youtubePlaylistId: "OLAK5uy_kE7qNEra9ki9Y5ujekyHQWWpEfp8n8d4w",
    displayGenre: "Folk Rock, Folk",
    categories: ["Rock", "Folk"],
    spotifyAlbumId: "6dVIqQ8qmQ5GBnJ9shOYGE"
  },
  {
    id: 3,
    rank: 3,
    title: "Dummy",
    artist: "Portishead",
    year: 1994,
    genre: "Trip-Hop, Chillout, Electronic",
    coverImage: "/images/albums/dummy_portishead.jpg",
    description: "209",
    youtubePlaylistId: "OLAK5uy_nMft1HP8iD7Wu0f0PfOKfao7r_nrBz6O8",
    displayGenre: "Trip-Hop, Chillout, Electronic",
    categories: ["Electronic"],
    spotifyAlbumId: "3539EbNgIdEDGBKkUf4wno"
  }
];

// Sample NBA players data (first 5 players for testing)
const nbaPlayersData = [
  {
    id: 1,
    rank: 1,
    name: "Michael Jordan",
    era: "1984-2003",
    nationality: "American",
    position: "SG",
    teams: ["Chicago Bulls", "Washington Wizards"],
    photo: "/images/players/michael-jordan.jpg",
    height: "6'6\"",
    weight: "216 lbs",
    wingspan: "6'11\"",
    stats: {
      ppg: 30.1,
      apg: 5.3,
      rpg: 6.2,
      fgp: 49.7,
      threeptp: 32.7,
      ftp: 83.5
    },
    achievements: {
      championships: 6,
      mvps: 5,
      allStar: 14,
      allNba: 11,
      allDefense: 9,
      dpoy: 1,
      scoringChampion: 10,
      stealChampion: 3,
      assistChampion: 0,
      reboundChampion: 0,
      blockChampion: 0
    }
  },
  {
    id: 2,
    rank: 2,
    name: "LeBron James",
    era: "2003-Present",
    nationality: "American",
    position: "SF",
    teams: ["Cleveland Cavaliers", "Miami Heat", "Los Angeles Lakers"],
    photo: "/images/players/lebron-james.jpg",
    height: "6'9\"",
    weight: "250 lbs",
    wingspan: "7'0\"",
    stats: {
      ppg: 27.2,
      apg: 7.3,
      rpg: 7.5,
      fgp: 50.5,
      threeptp: 34.6,
      ftp: 73.5
    },
    achievements: {
      championships: 4,
      mvps: 4,
      allStar: 19,
      allNba: 19,
      allDefense: 6,
      dpoy: 0,
      scoringChampion: 1,
      stealChampion: 0,
      assistChampion: 0,
      reboundChampion: 0,
      blockChampion: 0
    }
  },
  {
    id: 3,
    rank: 3,
    name: "Kobe Bryant",
    era: "1996-2016",
    nationality: "American",
    position: "SG",
    teams: ["Los Angeles Lakers"],
    photo: "/images/players/kobe-bryant.jpg",
    height: "6'6\"",
    weight: "212 lbs",
    wingspan: "6'11\"",
    stats: {
      ppg: 25.0,
      apg: 4.7,
      rpg: 5.2,
      fgp: 44.7,
      threeptp: 32.9,
      ftp: 83.7
    },
    achievements: {
      championships: 5,
      mvps: 1,
      allStar: 18,
      allNba: 15,
      allDefense: 12,
      dpoy: 0,
      scoringChampion: 2,
      stealChampion: 0,
      assistChampion: 0,
      reboundChampion: 0,
      blockChampion: 0
    }
  }
];

// Sample routine data (weekly routine)
const routineData = [
  {
    day: 1,
    routines: [
      { time: "6:00 AM", activity: "Wake up, Make bed, Brush teeth", category: "" },
      { time: "6:30 AM", activity: "Exercise (Upper Body)", category: "health" },
      { time: "7:30 AM", activity: "Shower", category: "" },
      { time: "8:00 AM", activity: "Breakfast & Vitamins", category: "meal" },
      { time: "8:30 AM - 1:00 PM", activity: "Coding & Website", category: "leisure" },
      { time: "1:00 PM", activity: "Lunch", category: "meal" },
      { time: "1:30 PM - 5:00 PM", activity: "Art & Music", category: "leisure" },
      { time: "5:00 PM", activity: "Grooming", category: "chores" },
      { time: "6:00 PM", activity: "Dinner", category: "meal" },
      { time: "6:30 PM", activity: "Walk", category: "health" },
      { time: "7:00 PM - 9:00 PM", activity: "Podcasts & Media", category: "leisure" },
      { time: "9:00 PM", activity: "Read", category: "leisure" },
      { time: "10:30 PM", activity: "Sleep", category: "" }
    ]
  },
  {
    day: 2,
    routines: [
      { time: "6:00 AM", activity: "Wake up, Make bed, Brush teeth", category: "" },
      { time: "6:30 AM", activity: "Exercise (Vert & Core)", category: "health" },
      { time: "7:30 AM", activity: "Shower", category: "" },
      { time: "8:00 AM", activity: "Breakfast & Vitamins", category: "meal" },
      { time: "8:30 AM - 1:00 PM", activity: "Coding & Website", category: "leisure" },
      { time: "1:00 PM", activity: "Lunch", category: "meal" },
      { time: "1:30 PM - 5:00 PM", activity: "Art & Music", category: "leisure" },
      { time: "5:00 PM", activity: "Laundry", category: "chores" },
      { time: "6:00 PM", activity: "Dinner", category: "meal" },
      { time: "6:30 PM", activity: "Walk", category: "health" },
      { time: "7:00 PM - 9:00 PM", activity: "Podcasts & Media", category: "leisure" },
      { time: "9:00 PM", activity: "Read", category: "leisure" },
      { time: "10:30 PM", activity: "Sleep", category: "" }
    ]
  }
];

// Sample exercise data (workouts)
const exerciseData = [
  {
    name: "Upper Body Strength",
    type: "hypertrophy",
    duration: "~45 min",
    exercises: [
      { name: "Pushups", reps: "to failure", sets: "3", rest: "90s", targetMuscles: ["Chest", "Triceps"] },
      { name: "Dumbbell Bent-Over Rows", reps: "8-12", sets: "3", rest: "90s", targetMuscles: ["Back", "Biceps"] },
      { name: "Dumbbell Overhead Press", reps: "8-12", sets: "3", rest: "90s", targetMuscles: ["Shoulders", "Triceps"] }
    ],
    equipment: ["Dumbbells"],
    schedule: "Unyom, Triyom, Phiyom"
  },
  {
    name: "Vertical Training / Core",
    type: "strength",
    duration: "~60 min",
    exercises: [
      { name: "Weighted Squat Jumps", reps: "5", sets: "4", rest: "120s", targetMuscles: ["Quads", "Glutes"] },
      { name: "Split Squat Jumps", reps: "5", sets: "4", rest: "120s", targetMuscles: ["Quads", "Glutes"] },
      { name: "Weighted Sit-ups", reps: "8-12", sets: "3", rest: "60s", targetMuscles: ["Core", "Abs"] }
    ],
    equipment: ["Dumbbells"],
    schedule: "Tuyom, Foyom, Seyom"
  },
  {
    name: "Rest Day",
    type: "rest",
    duration: "Sabbath",
    schedule: "Sabbath"
  }
];

// Sample diet data (ingredients)
const dietData = [
  // Proteins
  { id: 'steak', name: 'Steak', calories: 62.5, protein: 6.5, fat: 3.75, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'eggs', name: 'Eggs', calories: 70, protein: 6, fat: 5, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 large', servingSizeValue: 1, servingSizeUnit: 'large' },
  { id: 'bacon', name: 'Bacon', calories: 43, protein: 3, fat: 3, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 slice', servingSizeValue: 1, servingSizeUnit: 'slice' },
  { id: 'chicken', name: 'Chicken Breast', calories: 41.25, protein: 7.75, fat: 0.9, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'ground-beef', name: 'Ground Beef (80/20)', calories: 75.5, protein: 6.5, fat: 5.5, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'tuna', name: 'Tuna', calories: 26.92, protein: 6.15, fat: 0.19, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'porkchops', name: 'Porkchops', calories: 62.5, protein: 6.5, fat: 3.75, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'pork-loin', name: 'Pork Loin', calories: 40, protein: 6.25, fat: 1.25, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'salmon', name: 'Salmon', calories: 51.5, protein: 5.5, fat: 3, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  
  // Vegetables
  { id: 'avocado', name: 'Avocado', calories: 160, protein: 2, fat: 15, carbs: 9, sugar: 0.7, fiber: 6.7, category: 'vegetables', servingSize: '1 medium', servingSizeValue: 1, servingSizeUnit: 'medium' },
  { id: 'spinach', name: 'Spinach', calories: 7, protein: 0.9, fat: 0.1, carbs: 1.1, sugar: 0.1, fiber: 0.7, category: 'vegetables', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  { id: 'kale', name: 'Kale', calories: 8, protein: 0.7, fat: 0.2, carbs: 1.4, sugar: 0.2, fiber: 0.8, category: 'vegetables', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  
  // Nuts & Seeds
  { id: 'rice', name: 'Rice', calories: 205, protein: 4.3, fat: 0.4, carbs: 45, sugar: 0.1, fiber: 0.6, category: 'nuts-seeds', servingSize: '1 cup cooked', servingSizeValue: 1, servingSizeUnit: 'cup cooked' },
  { id: 'almonds', name: 'Almonds', calories: 164, protein: 6, fat: 14, carbs: 6, sugar: 1.2, fiber: 3.5, category: 'nuts-seeds', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
  { id: 'hemp-seeds', name: 'Hemp Seeds', calories: 55.33, protein: 3.17, fat: 4.87, carbs: 0.87, sugar: 0.17, fiber: 0.4, category: 'nuts-seeds', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'pecans', name: 'Pecans', calories: 196, protein: 2.6, fat: 20.4, carbs: 3.9, sugar: 1.1, fiber: 2.7, category: 'nuts-seeds', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },

  // Fats
  { id: 'sour-cream', name: 'Sour Cream', calories: 23, protein: 0.3, fat: 2.3, carbs: 0.4, sugar: 0.3, fiber: 0, category: 'fats', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'butter', name: 'Butter', calories: 102, protein: 0.1, fat: 11.5, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'avocado-oil', name: 'Avocado Oil', calories: 120, protein: 0, fat: 14, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'coconut-oil', name: 'Coconut Oil', calories: 120, protein: 0, fat: 14, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'mayonnaise', name: 'Mayonnaise', calories: 94, protein: 0.1, fat: 10.3, carbs: 0.1, sugar: 0.1, fiber: 0, category: 'fats', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  
  // Dairy
  { id: 'whole-milk', name: 'Whole Milk', calories: 149, protein: 8, fat: 8.5, carbs: 12, sugar: 12, fiber: 0, category: 'dairy', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  { id: '2-milk', name: '2% Milk', calories: 120, protein: 8, fat: 2.5, carbs: 12, sugar: 12, fiber: 0, category: 'dairy', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  { id: 'mozzarella', name: 'Shredded Mozzarella', calories: 340, protein: 24, fat: 24, carbs: 4, sugar: 2, fiber: 0, category: 'dairy', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  { id: 'mexican-cheese', name: 'Mexican Blend Cheese', calories: 440, protein: 28, fat: 36, carbs: 4, sugar: 2, fiber: 0, category: 'dairy', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
    
  // Seasonings
  { id: 'chili-powder', name: 'Chili Powder', calories: 8, protein: 0.4, fat: 0.4, carbs: 1.4, sugar: 0.2, fiber: 0.8, category: 'seasonings', servingSize: '1 tsp', servingSizeValue: 1, servingSizeUnit: 'tsp' },
  { id: 'garlic', name: 'Garlic', calories: 4, protein: 0.2, fat: 0, carbs: 1, sugar: 0.1, fiber: 0.1, category: 'seasonings', servingSize: '1 clove', servingSizeValue: 1, servingSizeUnit: 'clove' },
  { id: 'onions', name: 'Onions', calories: 44, protein: 1.2, fat: 0.1, carbs: 10.3, sugar: 4.7, fiber: 1.9, category: 'seasonings', servingSize: '1 medium', servingSizeValue: 1, servingSizeUnit: 'medium' },
  { id: 'salt', name: 'Salt', calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0, category: 'seasonings', servingSize: '1 tsp', servingSizeValue: 1, servingSizeUnit: 'tsp' },
  { id: 'pepper', name: 'Pepper', calories: 6, protein: 0.3, fat: 0.1, carbs: 1.5, sugar: 0.1, fiber: 0.6, category: 'seasonings', servingSize: '1 tsp', servingSizeValue: 1, servingSizeUnit: 'tsp' },
  { id: 'tajin', name: 'Tajin', calories: 5, protein: 0.1, fat: 0, carbs: 1.2, sugar: 0.8, fiber: 0.2, category: 'seasonings', servingSize: '1 tsp', servingSizeValue: 1, servingSizeUnit: 'tsp' },
  { id: 'lemon-juice', name: 'Lemon Juice', calories: 6, protein: 0.1, fat: 0, carbs: 1.8, sugar: 0.6, fiber: 0.1, category: 'seasonings', servingSize: '1 tbsp', servingSizeValue: 1, servingSizeUnit: 'tbsp' },
  { id: 'hot-sauce', name: 'Hot Sauce', calories: 5, protein: 0.1, fat: 0, carbs: 1.2, sugar: 0.8, fiber: 0.2, category: 'seasonings', servingSize: '1 tsp', servingSizeValue: 1, servingSizeUnit: 'tsp' },
   
  // Beverages
  { id: 'black-coffee', name: 'Black Coffee', calories: 2, protein: 0.3, fat: 0, carbs: 0, sugar: 0, fiber: 0, category: 'beverages', servingSize: '1 cup', servingSizeValue: 1, servingSizeUnit: 'cup' },
  { id: 'orange-juice', name: 'Orange Juice', calories: 14, protein: 0.2, fat: 0.05, carbs: 3.25, sugar: 2.6, fiber: 0.05, category: 'beverages', servingSize: '1 oz', servingSizeValue: 1, servingSizeUnit: 'oz' },
    
  // Fruits
  { id: 'mango', name: 'Mango', calories: 99, protein: 1.4, fat: 0.6, carbs: 24.7, sugar: 22.5, fiber: 2.6, category: 'fruits', servingSize: '1 cup sliced', servingSizeValue: 1, servingSizeUnit: 'cup sliced' },
];

// Seed the database with sample data
export const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Check if data already exists
    const existingLists = await pool.query('SELECT COUNT(*) FROM lists');
    if (parseInt(existingLists.rows[0].count) > 0) {
      console.log('ℹ️ Data already exists, skipping seed');
      return;
    }

    // Insert albums list
    const albumsQuery = `
      INSERT INTO lists (name, category, items_json, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const albumsResult = await pool.query(albumsQuery, [
      'Favorite Albums',
      'albums',
      JSON.stringify(albumsData),
      1
    ]);
    
    console.log('✅ Albums list created with ID:', albumsResult.rows[0].id);

    // Insert NBA players list
    const playersQuery = `
      INSERT INTO lists (name, category, items_json, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const playersResult = await pool.query(playersQuery, [
      'NBA Player Rankings',
      'nba-players',
      JSON.stringify(nbaPlayersData),
      2
    ]);
    
    console.log('✅ NBA players list created with ID:', playersResult.rows[0].id);

    // Insert routine list
    const routineQuery = `
      INSERT INTO lists (name, category, items_json, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const routineResult = await pool.query(routineQuery, [
      'Weekly Routine',
      'routine',
      JSON.stringify(routineData),
      3
    ]);
    
    console.log('✅ Routine list created with ID:', routineResult.rows[0].id);

    // Insert exercise list
    const exerciseQuery = `
      INSERT INTO lists (name, category, items_json, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const exerciseResult = await pool.query(exerciseQuery, [
      'Exercise Routine',
      'exercise',
      JSON.stringify(exerciseData),
      4
    ]);
    
    console.log('✅ Exercise list created with ID:', exerciseResult.rows[0].id);

    // Insert diet list
    const dietQuery = `
      INSERT INTO lists (name, category, items_json, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const dietResult = await pool.query(dietQuery, [
      'Diet Ingredients',
      'diet',
      JSON.stringify(dietData),
      5
    ]);
    
    console.log('✅ Diet list created with ID:', dietResult.rows[0].id);

    console.log('🎉 Database seeded successfully!');
  } catch (error: any) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};
