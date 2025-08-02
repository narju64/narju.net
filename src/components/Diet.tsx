import React, { useState, useEffect } from 'react';
import './Diet.css';

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  category: 'protein' | 'vegetables' | 'fats' | 'nuts-seeds' | 'seasonings' | 'beverages' | 'fruits' | 'dairy';
  servingSize: string;
}

interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
}

const Diet: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [mealName, setMealName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'meals'>('ingredients');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<Array<{
    id: string;
    name: string;
    ingredients: SelectedIngredient[];
    nutrition: ReturnType<typeof getTotalNutrition>;
  }>>([]);
  const [selectedDailyMeals, setSelectedDailyMeals] = useState<Array<{
    id: string;
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    ingredients: SelectedIngredient[];
    nutrition: ReturnType<typeof getTotalNutrition>;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved meals from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('diet-saved-meals');
      if (saved) {
        const parsedMeals = JSON.parse(saved);
        // Calculate nutrition for loaded meals (since nutrition is a function result)
        const mealsWithNutrition = parsedMeals.map((meal: any) => ({
          ...meal,
          nutrition: calculateNutritionForMeal(meal.ingredients)
        }));
        setSavedMeals(mealsWithNutrition);
      }
    } catch (error) {
      console.warn('Failed to load saved meals from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save meals to localStorage whenever savedMeals changes
  useEffect(() => {
    // Don't save while we're still loading
    if (isLoading) return;
    
    try {
      localStorage.setItem('diet-saved-meals', JSON.stringify(savedMeals));
    } catch (error) {
      console.warn('Failed to save meals to localStorage:', error);
    }
  }, [savedMeals, isLoading]);


  
  // Get available meal types (exclude already selected for today)
  const getAvailableMealTypes = () => {
    const selectedMealTypes = selectedDailyMeals.map(meal => meal.mealType);
    const allMealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];
    return allMealTypes.filter(type => !selectedMealTypes.includes(type));
  };
  
  // Update selected meal type if current selection is no longer available
  React.useEffect(() => {
    const availableTypes = getAvailableMealTypes();
    if (availableTypes.length > 0 && !availableTypes.includes(selectedMealType)) {
      setSelectedMealType(availableTypes[0]);
    }
  }, [selectedDailyMeals, selectedMealType]);

  // Ingredient database
  const ingredients: Ingredient[] = [
    // Proteins
    { id: 'steak', name: 'Steak', calories: 250, protein: 26, fat: 15, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '4 oz' },
    { id: 'eggs', name: 'Eggs', calories: 70, protein: 6, fat: 5, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 large' },
    { id: 'bacon', name: 'Bacon', calories: 43, protein: 3, fat: 3, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '1 slice' },
    { id: 'chicken', name: 'Chicken Breast', calories: 165, protein: 31, fat: 3.6, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '4 oz' },
    { id: 'ground-beef', name: 'Ground Beef', calories: 250, protein: 26, fat: 15, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '4 oz' },
    { id: 'tuna', name: 'Tuna', calories: 120, protein: 26, fat: 1, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '4 oz' },
    { id: 'salmon', name: 'Salmon', calories: 206, protein: 22, fat: 12, carbs: 0, sugar: 0, fiber: 0, category: 'protein', servingSize: '4 oz' },
   
    // Vegetables
    { id: 'avocado', name: 'Avocado', calories: 160, protein: 2, fat: 15, carbs: 9, sugar: 0.7, fiber: 6.7, category: 'vegetables', servingSize: '1 medium' },
    { id: 'spinach', name: 'Spinach', calories: 7, protein: 0.9, fat: 0.1, carbs: 1.1, sugar: 0.1, fiber: 0.7, category: 'vegetables', servingSize: '1 cup' },
    { id: 'kale', name: 'Kale', calories: 8, protein: 0.7, fat: 0.2, carbs: 1.4, sugar: 0.2, fiber: 0.8, category: 'vegetables', servingSize: '1 cup' },
    
    // Nuts & Seeds
    { id: 'rice', name: 'Rice', calories: 205, protein: 4.3, fat: 0.4, carbs: 45, sugar: 0.1, fiber: 0.6, category: 'nuts-seeds', servingSize: '1 cup cooked' },
    { id: 'almonds', name: 'Almonds', calories: 164, protein: 6, fat: 14, carbs: 6, sugar: 1.2, fiber: 3.5, category: 'nuts-seeds', servingSize: '1 oz' },
    { id: 'hemp-seeds', name: 'Hemp Seeds', calories: 166, protein: 9.5, fat: 14.6, carbs: 2.6, sugar: 0.5, fiber: 1.2, category: 'nuts-seeds', servingSize: '3 tbsp' },

    // Fats
    { id: 'sour-cream', name: 'Sour Cream', calories: 23, protein: 0.3, fat: 2.3, carbs: 0.4, sugar: 0.3, fiber: 0, category: 'fats', servingSize: '1 tbsp' },
    { id: 'butter', name: 'Butter', calories: 102, protein: 0.1, fat: 11.5, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp' },
    { id: 'avocado-oil', name: 'Avocado Oil', calories: 120, protein: 0, fat: 14, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp' },
    { id: 'coconut-oil', name: 'Coconut Oil', calories: 120, protein: 0, fat: 14, carbs: 0, sugar: 0, fiber: 0, category: 'fats', servingSize: '1 tbsp' },
    { id: 'mayonnaise', name: 'Mayonnaise', calories: 94, protein: 0.1, fat: 10.3, carbs: 0.1, sugar: 0.1, fiber: 0, category: 'fats', servingSize: '1 tbsp' },
    
    // Dairy
    { id: 'milk', name: 'Milk', calories: 103, protein: 8, fat: 2.4, carbs: 12, sugar: 12, fiber: 0, category: 'dairy', servingSize: '1 cup' },
    { id: 'mozzarella', name: 'Shredded Mozzarella', calories: 85, protein: 6, fat: 6, carbs: 1, sugar: 0.5, fiber: 0, category: 'dairy', servingSize: '1/4 cup' },
    { id: 'mexican-cheese', name: 'Mexican Blend Cheese', calories: 110, protein: 7, fat: 9, carbs: 1, sugar: 0.5, fiber: 0, category: 'dairy', servingSize: '1/4 cup' },
      
    // Seasonings
    { id: 'chili-powder', name: 'Chili Powder', calories: 8, protein: 0.4, fat: 0.4, carbs: 1.4, sugar: 0.2, fiber: 0.8, category: 'seasonings', servingSize: '1 tsp' },
    { id: 'garlic', name: 'Garlic', calories: 4, protein: 0.2, fat: 0, carbs: 1, sugar: 0.1, fiber: 0.1, category: 'seasonings', servingSize: '1 clove' },
    { id: 'onions', name: 'Onions', calories: 44, protein: 1.2, fat: 0.1, carbs: 10.3, sugar: 4.7, fiber: 1.9, category: 'seasonings', servingSize: '1 medium' },
    { id: 'salt', name: 'Salt', calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0, category: 'seasonings', servingSize: '1 tsp' },
    { id: 'pepper', name: 'Pepper', calories: 6, protein: 0.3, fat: 0.1, carbs: 1.5, sugar: 0.1, fiber: 0.6, category: 'seasonings', servingSize: '1 tsp' },
    { id: 'tajin', name: 'Tajin', calories: 5, protein: 0.1, fat: 0, carbs: 1.2, sugar: 0.8, fiber: 0.2, category: 'seasonings', servingSize: '1 tsp' },
    { id: 'lemon-juice', name: 'Lemon Juice', calories: 6, protein: 0.1, fat: 0, carbs: 1.8, sugar: 0.6, fiber: 0.1, category: 'seasonings', servingSize: '1 tbsp' },
     
    // Beverages
    { id: 'black-coffee', name: 'Black Coffee', calories: 2, protein: 0.3, fat: 0, carbs: 0, sugar: 0, fiber: 0, category: 'beverages', servingSize: '1 cup' },
    { id: 'orange-juice', name: 'Orange Juice', calories: 111, protein: 1.7, fat: 0.5, carbs: 25.8, sugar: 20.8, fiber: 0.5, category: 'beverages', servingSize: '1 cup' },
      
    // Fruits
    { id: 'mango', name: 'Mango', calories: 99, protein: 1.4, fat: 0.6, carbs: 24.7, sugar: 22.5, fiber: 2.6, category: 'fruits', servingSize: '1 cup sliced' },
  ];

  // Helper function to calculate nutrition for a meal's ingredients
  const calculateNutritionForMeal = (mealIngredients: SelectedIngredient[]) => {
    const total = mealIngredients.reduce((acc, item) => {
      const ingredient = item.ingredient;
      const quantity = item.quantity;
      return {
        calories: acc.calories + (ingredient.calories * quantity),
        protein: acc.protein + (ingredient.protein * quantity),
        fat: acc.fat + (ingredient.fat * quantity),
        carbs: acc.carbs + (ingredient.carbs * quantity),
        sugar: acc.sugar + (ingredient.sugar * quantity),
        fiber: acc.fiber + (ingredient.fiber * quantity),
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });

    const netCarbs = total.carbs - total.fiber;
    const totalCalories = total.calories;
    
    const proteinPercent = totalCalories > 0 ? (total.protein * 4 / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (total.fat * 9 / totalCalories) * 100 : 0;
    const carbPercent = totalCalories > 0 ? (netCarbs * 4 / totalCalories) * 100 : 0;

    return {
      ...total,
      netCarbs,
      proteinPercent,
      fatPercent,
      carbPercent
    };
  };

  // Default preset meals (always show in localhost)
  const getPresetMeals = () => {
    // Hardcoded presets - these are always available to all users
    return [
      {
        id: 'preset-1754140594795',
        name: 'Eggs & Almonds',
        ingredients: [
          { ingredient: ingredients.find(i => i.id === 'eggs')!, quantity: 4 },
          { ingredient: ingredients.find(i => i.id === 'almonds')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'hemp-seeds')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'sour-cream')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'coconut-oil')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'pepper')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'salt')!, quantity: 1 },
          { ingredient: ingredients.find(i => i.id === 'garlic')!, quantity: 1 }
        ],
        nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0, netCarbs: 0, proteinPercent: 0, fatPercent: 0, carbPercent: 0 }
      }
    ];
  };

  const addIngredient = (ingredient: Ingredient) => {
    const existing = selectedIngredients.find(item => item.ingredient.id === ingredient.id);
    if (existing) {
      setSelectedIngredients(selectedIngredients.map(item => 
        item.ingredient.id === ingredient.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedIngredients([...selectedIngredients, { ingredient, quantity: 1 }]);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    const existing = selectedIngredients.find(item => item.ingredient.id === ingredientId);
    if (existing && existing.quantity > 1) {
      setSelectedIngredients(selectedIngredients.map(item => 
        item.ingredient.id === ingredientId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setSelectedIngredients(selectedIngredients.filter(item => item.ingredient.id !== ingredientId));
    }
  };

  const clearMeal = () => {
    setSelectedIngredients([]);
    setMealName('');
  };

  const addSavedMeal = (savedMeal: typeof savedMeals[0]) => {
    // Clear current ingredients and add the saved meal's ingredients
    setSelectedIngredients([...savedMeal.ingredients]);
    setMealName(savedMeal.name);
  };

  const removeFromDailyMeals = (mealId: string) => {
    setSelectedDailyMeals(selectedDailyMeals.filter(meal => meal.id !== mealId));
  };

  const removeSavedMeal = (mealId: string) => {
    setSavedMeals(savedMeals.filter(meal => meal.id !== mealId));
  };

  const saveMeal = () => {
    if (selectedIngredients.length === 0) return;
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }
    
    // Check if this meal type is already selected for today
    const existingMealOfType = selectedDailyMeals.find(meal => meal.mealType === selectedMealType);
    if (existingMealOfType) {
      alert(`You already have a ${selectedMealType} meal selected for today.`);
      return;
    }
    
    // Check if this exact combination of ingredients already exists in saved meals or preset meals
    const ingredientsKey = selectedIngredients
      .sort((a, b) => a.ingredient.id.localeCompare(b.ingredient.id))
      .map(item => `${item.ingredient.id}:${item.quantity}`)
      .join(',');
    
    // Check against saved meals
    const existingSavedMeal = savedMeals.find(meal => {
      const mealIngredientsKey = meal.ingredients
        .sort((a, b) => a.ingredient.id.localeCompare(b.ingredient.id))
        .map(item => `${item.ingredient.id}:${item.quantity}`)
        .join(',');
      return mealIngredientsKey === ingredientsKey;
    });
    
    // Check against preset meals
    const existingPresetMeal = getPresetMeals().find(meal => {
      const mealIngredientsKey = meal.ingredients
        .sort((a, b) => a.ingredient.id.localeCompare(b.ingredient.id))
        .map(item => `${item.ingredient.id}:${item.quantity}`)
        .join(',');
      return mealIngredientsKey === ingredientsKey;
    });
    
    const dailyMeal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      mealType: selectedMealType,
      ingredients: [...selectedIngredients],
      nutrition: getTotalNutrition()
    };
    
    // Always add to daily meals (Daily Meals section)
    setSelectedDailyMeals([...selectedDailyMeals, dailyMeal]);
    
    // Only add to saved meals (Meals tab) if it's not a duplicate
    if (!existingSavedMeal && !existingPresetMeal) {
      const savedMeal = {
        id: Date.now().toString(),
        name: mealName.trim(),
        ingredients: [...selectedIngredients],
        nutrition: getTotalNutrition()
      };
      setSavedMeals([...savedMeals, savedMeal]);
    }
    
    setSelectedIngredients([]);
    setMealName('');
  };

  const saveAsPreset = () => {
    if (selectedIngredients.length === 0) return;
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    // Generate the code for the new preset
    const newPresetCode = generatePresetCode(mealName.trim(), selectedIngredients);
    
    // Copy to clipboard
    navigator.clipboard.writeText(newPresetCode).then(() => {
      alert('Preset code copied to clipboard! Paste it into the getPresetMeals function in Diet.tsx');
    }).catch(() => {
      // Fallback if clipboard API fails
      prompt('Copy this code and paste it into the getPresetMeals function:', newPresetCode);
    });

    setSelectedIngredients([]);
    setMealName('');
  };

  const generatePresetCode = (name: string, ingredients: SelectedIngredient[]) => {
    const ingredientCode = ingredients.map(item => 
      `{ ingredient: ingredients.find(i => i.id === '${item.ingredient.id}')!, quantity: ${item.quantity} }`
    ).join(',\n                 ');

    return `{
               id: 'preset-${Date.now()}',
               name: '${name}',
               ingredients: [
                 ${ingredientCode}
               ],
               nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0, netCarbs: 0, proteinPercent: 0, fatPercent: 0, carbPercent: 0 }
             }`;
  };



  const getTotalNutrition = () => {
    const totals = selectedIngredients.reduce((total, item) => ({
      calories: total.calories + (item.ingredient.calories * item.quantity),
      protein: total.protein + (item.ingredient.protein * item.quantity),
      fat: total.fat + (item.ingredient.fat * item.quantity),
      carbs: total.carbs + (item.ingredient.carbs * item.quantity),
      sugar: total.sugar + (item.ingredient.sugar * item.quantity),
      fiber: total.fiber + (item.ingredient.fiber * item.quantity),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
    
    // Calculate net carbs (total carbs - fiber)
    const netCarbs = Math.max(0, totals.carbs - totals.fiber);
    
    // Calculate calorie distribution percentages
    const proteinCalories = totals.protein * 4; // 4 calories per gram of protein
    const fatCalories = totals.fat * 9; // 9 calories per gram of fat
    const netCarbCalories = netCarbs * 4; // 4 calories per gram of net carbs
    
    const totalCalories = proteinCalories + fatCalories + netCarbCalories;
    
    const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    const carbPercent = totalCalories > 0 ? (netCarbCalories / totalCalories) * 100 : 0;
    
    return {
      ...totals,
      netCarbs,
      proteinPercent,
      fatPercent,
      carbPercent
    };
  };

             const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'protein': '#e74c3c',
      'vegetables': '#27ae60',
      'fats': '#9b59b6',
      'nuts-seeds': '#f39c12',
      'seasonings': '#3498db',
      'beverages': '#1abc9c',
      'fruits': '#e91e63',
      'dairy': '#f1c40f'
    };
    return colors[category] || '#95a5a6';
  };

  const getDistributionColor = (type: 'protein' | 'fat' | 'carbs', value: number) => {
    const ranges = {
      protein: { min: 20, max: 30 },
      fat: { min: 70, max: 80 },
      carbs: { min: 0, max: 10 }
    };
    
    const range = ranges[type];
    
    if (value >= range.min && value <= range.max) {
      return '#ff7300'; // Orange - within range
    } else if (value > range.max) {
      return '#e74c3c'; // Red - too high
    } else {
      return '#3498db'; // Blue - too low
    }
  };

  const getDailyNutrition = () => {
    const dailyTotals = selectedDailyMeals.reduce((total, meal) => ({
      calories: total.calories + meal.nutrition.calories,
      protein: total.protein + meal.nutrition.protein,
      fat: total.fat + meal.nutrition.fat,
      carbs: total.carbs + meal.nutrition.carbs,
      sugar: total.sugar + meal.nutrition.sugar,
      fiber: total.fiber + meal.nutrition.fiber,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
    
    // Calculate net carbs (total carbs - fiber)
    const netCarbs = Math.max(0, dailyTotals.carbs - dailyTotals.fiber);
    
    // Calculate calorie distribution percentages
    const proteinCalories = dailyTotals.protein * 4;
    const fatCalories = dailyTotals.fat * 9;
    const netCarbCalories = netCarbs * 4;
    
    const totalCalories = proteinCalories + fatCalories + netCarbCalories;
    
    const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    const carbPercent = totalCalories > 0 ? (netCarbCalories / totalCalories) * 100 : 0;
    
    return {
      ...dailyTotals,
      netCarbs,
      proteinPercent,
      fatPercent,
      carbPercent
    };
  };

  // Get unique categories from ingredients
  const getUniqueCategories = () => {
    const categories = ingredients.map(ingredient => ingredient.category);
    return [...new Set(categories)];
  };

  // Filter ingredients based on selected categories
  const getFilteredIngredients = () => {
    if (selectedCategories.length === 0) {
      return ingredients; // Show all ingredients if no categories selected
    }
    return ingredients.filter(ingredient => selectedCategories.includes(ingredient.category));
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const totalNutrition = getTotalNutrition();

  return (
    <div className="diet-page">
      <div className="diet-header">
        <h1>Diet & Nutrition</h1>
        <p>Build your meals by clicking on ingredients below</p>
      </div>

      <div className="diet-container">
                 <div className="ingredients-section">
           <div className="tab-header">
             <button 
               className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
               onClick={() => setActiveTab('ingredients')}
             >
               Ingredients
             </button>
             <button 
               className={`tab-button ${activeTab === 'meals' ? 'active' : ''}`}
               onClick={() => setActiveTab('meals')}
             >
               Meals
             </button>
           </div>
           
                       {activeTab === 'ingredients' && (
              <>
                <div className="category-filters">
                  <div className="filter-buttons">
                    {getUniqueCategories().map(category => (
                      <button
                        key={category}
                        className={`category-filter-button ${selectedCategories.includes(category) ? 'active' : ''}`}
                        onClick={() => toggleCategory(category)}
                        style={{ 
                          backgroundColor: selectedCategories.includes(category) ? getCategoryColor(category) : 'transparent',
                          borderColor: getCategoryColor(category),
                          color: selectedCategories.includes(category) ? 'white' : getCategoryColor(category)
                        }}
                      >
                                             {category === 'nuts-seeds' ? 'Nuts/Seeds' : 
                       category === 'protein' ? 'Meat' : 
                       category === 'vegetables' ? 'Vegetable' :
                       category === 'seasonings' ? 'Seasoning' :
                       category === 'beverages' ? 'Beverage' :
                       category === 'fruits' ? 'Fruit' :
                       category === 'dairy' ? 'Dairy' :
                       category === 'fats' ? 'Fat' :
                       category}
                      </button>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <button
                      className="clear-filters-button"
                      onClick={() => setSelectedCategories([])}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="ingredients-grid">
                  {getFilteredIngredients().map(ingredient => (
                    <button
                      key={ingredient.id}
                      className="ingredient-button"
                      onClick={() => addIngredient(ingredient)}
                      style={{ borderLeftColor: getCategoryColor(ingredient.category) }}
                    >
                      <div className="ingredient-name">{ingredient.name}</div>
                      <div className="ingredient-serving">{ingredient.servingSize}</div>
                      <div className="ingredient-nutrition">
                        <span>{ingredient.calories} cal</span>
                        <span>P: {ingredient.protein}g</span>
                        <span>F: {ingredient.fat}g</span>
                        <span>C: {ingredient.carbs}g</span>
                        <span>S: {ingredient.sugar}g</span>
                        <span>Fi: {ingredient.fiber}g</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
           
           {activeTab === 'meals' && (
             <div className="meals-grid">
               {/* Preset Meals */}
               {getPresetMeals().map(preset => (
                 <div key={preset.id} className="meal-button preset-meal">
                   <button
                     className="meal-content"
                     onClick={() => addSavedMeal(preset)}
                   >
                                           <div className="meal-name">{preset.name}</div>
                     <div className="meal-ingredients">
                       {preset.ingredients.map(item => (
                         <span key={item.ingredient.id} className="meal-ingredient">
                           {item.ingredient.name} x{item.quantity}
                         </span>
                       ))}
                     </div>
                     <div className="meal-nutrition">
                       <span>{calculateNutritionForMeal(preset.ingredients).calories.toFixed(0)} cal</span>
                       <span>P: {calculateNutritionForMeal(preset.ingredients).protein.toFixed(1)}g</span>
                       <span>F: {calculateNutritionForMeal(preset.ingredients).fat.toFixed(1)}g</span>
                       <span>C: {calculateNutritionForMeal(preset.ingredients).netCarbs.toFixed(1)}g</span>
                     </div>
                   </button>
                   
                 </div>
               ))}
               
               {/* Saved Meals */}
               {savedMeals.map(meal => (
                 <div key={meal.id} className="meal-button saved-meal">
                   <button
                     className="meal-content"
                     onClick={() => addSavedMeal(meal)}
                   >
                                           <div className="meal-name">{meal.name}</div>
                     <div className="meal-ingredients">
                       {meal.ingredients.map(item => (
                         <span key={item.ingredient.id} className="meal-ingredient">
                           {item.ingredient.name} x{item.quantity}
                         </span>
                       ))}
                     </div>
                     <div className="meal-nutrition">
                       <span>{meal.nutrition.calories.toFixed(0)} cal</span>
                       <span>P: {meal.nutrition.protein.toFixed(1)}g</span>
                       <span>F: {meal.nutrition.fat.toFixed(1)}g</span>
                       <span>C: {meal.nutrition.netCarbs.toFixed(1)}g</span>
                     </div>
                   </button>
                   <button
                     onClick={() => removeSavedMeal(meal.id)}
                     className="remove-saved-meal-button"
                     title="Delete saved meal"
                   >
                     ×
                   </button>
                 </div>
               ))}
               
               {getPresetMeals().length === 0 && savedMeals.length === 0 && (
                 <div className="no-meals">
                   <p>No meals available. Create meals to see them here.</p>
                 </div>
               )}
             </div>
           )}
         </div>

         <div className="right-column">
                       <div className="meal-section">
              <div className="meal-header">
                <h2>Current Meal</h2>
                                 <div className="meal-controls">
                                      <button 
                      onClick={saveMeal} 
                      className="save-button"
                      disabled={selectedIngredients.length === 0 || !mealName.trim() || getAvailableMealTypes().length === 0}
                    >
                      Save Meal
                    </button>
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                      <button 
                        onClick={saveAsPreset} 
                        className="save-preset-button"
                        disabled={selectedIngredients.length === 0 || !mealName.trim()}
                      >
                        Save as Preset
                      </button>
                    )}
                   <button onClick={clearMeal} className="clear-button">Clear Meal</button>
                 </div>
              </div>

              <div className="meal-inputs">
                <div className="input-group">
                  <label htmlFor="meal-name">Meal Name:</label>
                  <input
                    id="meal-name"
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="Enter meal name..."
                    className="meal-name-input"
                  />
                </div>
                                 <div className="input-group">
                   <label htmlFor="meal-type">Meal Type:</label>
                   <select
                     id="meal-type"
                     value={selectedMealType}
                     onChange={(e) => setSelectedMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
                     className="meal-type-select"
                     disabled={getAvailableMealTypes().length === 0}
                   >
                     {getAvailableMealTypes().map(type => (
                       <option key={type} value={type}>
                         {type.charAt(0).toUpperCase() + type.slice(1)}
                       </option>
                     ))}
                   </select>
                 </div>
              </div>

            <div className="selected-ingredients">
              {selectedIngredients.length === 0 ? (
                <p className="no-ingredients">No ingredients selected. Click on ingredients above to build your meal.</p>
              ) : (
                selectedIngredients.map(item => (
                  <div key={item.ingredient.id} className="selected-ingredient">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{item.ingredient.name}</span>
                      <span className="ingredient-quantity">x{item.quantity}</span>
                    </div>
                                       <div className="ingredient-nutrition">
                      <span>{(item.ingredient.calories * item.quantity).toFixed(0)} cal</span>
                      <span>P: {(item.ingredient.protein * item.quantity).toFixed(1)}g</span>
                      <span>F: {(item.ingredient.fat * item.quantity).toFixed(1)}g</span>
                      <span>C: {(item.ingredient.carbs * item.quantity).toFixed(1)}g</span>
                      <span>S: {(item.ingredient.sugar * item.quantity).toFixed(1)}g</span>
                      <span>Fi: {(item.ingredient.fiber * item.quantity).toFixed(1)}g</span>
                    </div>
                    <button 
                      onClick={() => removeIngredient(item.ingredient.id)}
                      className="remove-button"
                    >
                      -
                    </button>
                  </div>
                ))
              )}
            </div>

            {selectedIngredients.length > 0 && (
              <div className="total-nutrition">
                <h3>Total Nutrition</h3>
                               <div className="nutrition-grid">
                   <div className="nutrition-item">
                     <span className="nutrition-label">Calories</span>
                     <span className="nutrition-value">{totalNutrition.calories.toFixed(0)}</span>
                   </div>
                   <div className="nutrition-item">
                     <span className="nutrition-label">Protein</span>
                     <span className="nutrition-value">{totalNutrition.protein.toFixed(1)}g</span>
                   </div>
                   <div className="nutrition-item">
                     <span className="nutrition-label">Fat</span>
                     <span className="nutrition-value">{totalNutrition.fat.toFixed(1)}g</span>
                   </div>
                   <div className="nutrition-item">
                     <span className="nutrition-label">Net Carbs</span>
                     <span className="nutrition-value">{totalNutrition.netCarbs.toFixed(1)}g</span>
                   </div>
                   <div className="nutrition-item">
                     <span className="nutrition-label">Sugar</span>
                     <span className="nutrition-value">{totalNutrition.sugar.toFixed(1)}g</span>
                   </div>
                   <div className="nutrition-item">
                     <span className="nutrition-label">Fiber</span>
                     <span className="nutrition-value">{totalNutrition.fiber.toFixed(1)}g</span>
                   </div>
                 </div>
                 
                                 <div className="calorie-distribution">
                    <h4>Calorie Distribution</h4>
                    <div className="distribution-grid">
                      <div 
                        className="distribution-item"
                        style={{ 
                          borderColor: getDistributionColor('protein', totalNutrition.proteinPercent),
                          backgroundColor: `${getDistributionColor('protein', totalNutrition.proteinPercent)}10`
                        }}
                      >
                        <div className="distribution-info">
                          <span className="distribution-label">Protein</span>
                          <span className="distribution-range">Target: 20-30%</span>
                        </div>
                        <span 
                          className="distribution-value"
                          style={{ color: getDistributionColor('protein', totalNutrition.proteinPercent) }}
                        >
                          {totalNutrition.proteinPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div 
                        className="distribution-item"
                        style={{ 
                          borderColor: getDistributionColor('fat', totalNutrition.fatPercent),
                          backgroundColor: `${getDistributionColor('fat', totalNutrition.fatPercent)}10`
                        }}
                      >
                        <div className="distribution-info">
                          <span className="distribution-label">Fat</span>
                          <span className="distribution-range">Target: 70-80%</span>
                        </div>
                        <span 
                          className="distribution-value"
                          style={{ color: getDistributionColor('fat', totalNutrition.fatPercent) }}
                        >
                          {totalNutrition.fatPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div 
                        className="distribution-item"
                        style={{ 
                          borderColor: getDistributionColor('carbs', totalNutrition.carbPercent),
                          backgroundColor: `${getDistributionColor('carbs', totalNutrition.carbPercent)}10`
                        }}
                      >
                        <div className="distribution-info">
                          <span className="distribution-label">Carbs</span>
                          <span className="distribution-range">Target: 0-10%</span>
                        </div>
                        <span 
                          className="distribution-value"
                          style={{ color: getDistributionColor('carbs', totalNutrition.carbPercent) }}
                        >
                          {totalNutrition.carbPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
              </div>
            )}
          </div>

                       {selectedDailyMeals.length > 0 && (
             <div className="saved-meals-section">
               <h2>Daily Meals</h2>
               
                               {/* Daily Total */}
                <div className="daily-total-section">
                  <h3>Daily Total</h3>
                  {(() => {
                    const dailyNutrition = getDailyNutrition();
                    return (
                      <>
                        <div className="daily-nutrition-grid">
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Calories</span>
                            <span className="nutrition-value">{dailyNutrition.calories.toFixed(0)}</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Protein</span>
                            <span className="nutrition-value">{dailyNutrition.protein.toFixed(1)}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Fat</span>
                            <span className="nutrition-value">{dailyNutrition.fat.toFixed(1)}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Net Carbs</span>
                            <span className="nutrition-value">{dailyNutrition.netCarbs.toFixed(1)}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Sugar</span>
                            <span className="nutrition-value">{dailyNutrition.sugar.toFixed(1)}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Total Fiber</span>
                            <span className="nutrition-value">{dailyNutrition.fiber.toFixed(1)}g</span>
                          </div>
                        </div>
                        
                        <div className="daily-calorie-distribution">
                          <h4>Daily Calorie Distribution</h4>
                          <div className="distribution-grid">
                            <div 
                              className="distribution-item"
                              style={{ 
                                borderColor: getDistributionColor('protein', dailyNutrition.proteinPercent),
                                backgroundColor: `${getDistributionColor('protein', dailyNutrition.proteinPercent)}10`
                              }}
                            >
                              <div className="distribution-info">
                                <span className="distribution-label">Protein</span>
                                <span className="distribution-range">Target: 20-30%</span>
                              </div>
                              <span 
                                className="distribution-value"
                                style={{ color: getDistributionColor('protein', dailyNutrition.proteinPercent) }}
                              >
                                {dailyNutrition.proteinPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div 
                              className="distribution-item"
                              style={{ 
                                borderColor: getDistributionColor('fat', dailyNutrition.fatPercent),
                                backgroundColor: `${getDistributionColor('fat', dailyNutrition.fatPercent)}10`
                              }}
                            >
                              <div className="distribution-info">
                                <span className="distribution-label">Fat</span>
                                <span className="distribution-range">Target: 70-80%</span>
                              </div>
                              <span 
                                className="distribution-value"
                                style={{ color: getDistributionColor('fat', dailyNutrition.fatPercent) }}
                              >
                                {dailyNutrition.fatPercent.toFixed(1)}%
                              </span>
                            </div>
                            <div 
                              className="distribution-item"
                              style={{ 
                                borderColor: getDistributionColor('carbs', dailyNutrition.carbPercent),
                                backgroundColor: `${getDistributionColor('carbs', dailyNutrition.carbPercent)}10`
                              }}
                            >
                              <div className="distribution-info">
                                <span className="distribution-label">Carbs</span>
                                <span className="distribution-range">Target: 0-10%</span>
                              </div>
                              <span 
                                className="distribution-value"
                                style={{ color: getDistributionColor('carbs', dailyNutrition.carbPercent) }}
                              >
                                {dailyNutrition.carbPercent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

               {/* Individual Meals */}
               <div className="saved-meals-grid">
                 {selectedDailyMeals.map(meal => (
                   <div key={meal.id} className="saved-meal-card">
                     <div className="saved-meal-header">
                       <div className="meal-title">
                         <h3>{meal.name}</h3>
                         <span className="meal-type">{meal.mealType}</span>
                       </div>
                       <button 
                         onClick={() => removeFromDailyMeals(meal.id)}
                         className="delete-meal-button"
                       >
                         ×
                       </button>
                     </div>
                     <div className="saved-meal-ingredients">
                       {meal.ingredients.map(item => (
                         <span key={item.ingredient.id} className="saved-ingredient">
                           {item.ingredient.name} x{item.quantity}
                         </span>
                       ))}
                     </div>
                     <div className="saved-meal-nutrition">
                       <span className="nutrition-summary">
                         {meal.nutrition.calories.toFixed(0)} cal • 
                         P: {meal.nutrition.protein.toFixed(1)}g • 
                         F: {meal.nutrition.fat.toFixed(1)}g • 
                         C: {meal.nutrition.netCarbs.toFixed(1)}g
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default Diet; 