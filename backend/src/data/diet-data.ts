// Diet ingredients data
export const dietData = [
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
  { id: 'mango', name: 'Mango', calories: 99, protein: 1.4, fat: 0.6, carbs: 24.7, sugar: 22.5, fiber: 2.6, category: 'fruits', servingSize: '1 cup sliced', servingSizeValue: 1, servingSizeUnit: 'cup sliced' }
];
