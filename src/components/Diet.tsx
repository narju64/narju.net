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
  servingSizeValue?: number; // Numerical value (e.g., 4)
  servingSizeUnit?: string;  // Unit (e.g., "oz")
}

interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
  servingSizeMultiplier?: number;
}

interface PresetMeal {
  id: string;
  name: string;
  ingredients: (SelectedIngredient & { servingSizeMultiplier?: number })[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    fiber: number;
    netCarbs: number;
    proteinPercent: number;
    fatPercent: number;
    carbPercent: number;
  };
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: Ingredient[];
  };
}

const Diet: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [mealName, setMealName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'meals'>('ingredients');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<Array<{
    id: string;
    name: string;
    ingredients: (SelectedIngredient & { servingSizeMultiplier?: number })[];
    nutrition: ReturnType<typeof getTotalNutrition>;
  }>>([]);
  const [selectedDailyMeals, setSelectedDailyMeals] = useState<Array<{
    id: string;
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    ingredients: (SelectedIngredient & { servingSizeMultiplier?: number })[];
    nutrition: ReturnType<typeof getTotalNutrition>;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ingredientServingSizes, setIngredientServingSizes] = useState<Record<string, number>>({});
  const [currentMealServingSizes, setCurrentMealServingSizes] = useState<Record<string, number>>({});
  
  // New state for hybrid data loading
  const [ingredientsData, setIngredientsData] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to calculate nutrition for a meal's ingredients
  const calculateNutritionForMeal = (mealIngredients: (SelectedIngredient & { servingSizeMultiplier?: number })[]) => {
    const total = mealIngredients.reduce((acc, item) => {
      const ingredient = item.ingredient;
      const quantity = item.quantity;
      // Use stored serving size multiplier if available, otherwise default to 1
      const servingSizeMultiplier = item.servingSizeMultiplier || 1;
      
      return {
        calories: acc.calories + (ingredient.calories * servingSizeMultiplier * quantity),
        protein: acc.protein + (ingredient.protein * servingSizeMultiplier * quantity),
        fat: acc.fat + (ingredient.fat * servingSizeMultiplier * quantity),
        carbs: acc.carbs + (ingredient.carbs * servingSizeMultiplier * quantity),
        sugar: acc.sugar + (ingredient.sugar * servingSizeMultiplier * quantity),
        fiber: acc.fiber + (ingredient.fiber * servingSizeMultiplier * quantity),
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

  // Load saved meals and daily meals from localStorage on component mount
  useEffect(() => {
    const savedMealsData = localStorage.getItem('savedMeals');
    const selectedDailyMealsData = localStorage.getItem('selectedDailyMeals');
    const ingredientServingSizesData = localStorage.getItem('ingredientServingSizes');
    const currentMealServingSizesData = localStorage.getItem('currentMealServingSizes');

    if (savedMealsData) {
      setSavedMeals(JSON.parse(savedMealsData));
    }
    if (selectedDailyMealsData) {
      setSelectedDailyMeals(JSON.parse(selectedDailyMealsData));
    }
    if (ingredientServingSizesData) {
      setIngredientServingSizes(JSON.parse(ingredientServingSizesData));
    }
    if (currentMealServingSizesData) {
      setCurrentMealServingSizes(JSON.parse(currentMealServingSizesData));
    }
    setIsLoading(false);
  }, []);

  // Check if user is logged in and fetch ingredients from API
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    const loggedIn = !!(storedUser && storedToken);

    if (loggedIn) {
      fetchIngredientsFromApi();
    } else {
      loadHardcodedIngredients();
    }
  }, []);

  const fetchIngredientsFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/lists/diet');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API Response:', data);
      
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        setIngredientsData(data.list.items_json);
      } else {
        console.log('No API data available, using hardcoded data');
        loadHardcodedIngredients();
      }
    } catch (err) {
      console.error('Error fetching ingredients from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      loadHardcodedIngredients();
    } finally {
      setLoading(false);
    }
  };

  const loadHardcodedIngredients = () => {
    // Hardcoded ingredients data - fallback when not logged in or API fails
    const hardcodedIngredients: Ingredient[] = [
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
    setIngredientsData(hardcodedIngredients);
  };

  // Save meals to localStorage whenever savedMeals changes
  useEffect(() => {
    // Don't save while we're still loading
    if (isLoading) return;
    
    try {
      localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
    } catch (error) {
      console.warn('❌ Failed to save meals to localStorage:', error);
    }
  }, [savedMeals, isLoading]);

  // Save daily meals to localStorage and notify widget
  useEffect(() => {
    // Don't save while we're still loading
    if (isLoading) return;
    
    try {
      localStorage.setItem('selectedDailyMeals', JSON.stringify(selectedDailyMeals));
      localStorage.setItem('ingredientServingSizes', JSON.stringify(ingredientServingSizes));
      localStorage.setItem('currentMealServingSizes', JSON.stringify(currentMealServingSizes));
      
      // Dispatch custom event to notify the widget
      window.dispatchEvent(new Event('dailyMealsUpdated'));
    } catch (error) {
      console.warn('❌ Failed to save daily meals to localStorage:', error);
    }
  }, [selectedDailyMeals, isLoading, ingredientServingSizes, currentMealServingSizes]);


  
  // Get available meal types (exclude already selected for today, but allow unlimited snacks)
  const getAvailableMealTypes = () => {
    const selectedMealTypes = selectedDailyMeals.map(meal => meal.mealType);
    const allMealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Filter out main meals that are already selected, but always include snack
    const availableMainMeals = allMealTypes.filter(type => 
      type !== 'snack' && !selectedMealTypes.includes(type)
    );
    
    // Always include snack as an option
    return [...availableMainMeals, 'snack'];
  };
  
  // Update selected meal type if current selection is no longer available
  React.useEffect(() => {
    const availableTypes = getAvailableMealTypes();
    if (availableTypes.length > 0 && !availableTypes.includes(selectedMealType)) {
      setSelectedMealType(availableTypes[0] as 'breakfast' | 'lunch' | 'dinner' | 'snack');
    }
  }, [selectedDailyMeals, selectedMealType]);

  // Utility functions for serving size formatting
  const formatServingSize = (value: number, unit: string): string => {
    return `(${value} ${unit})`;
  };

  // Functions to handle serving size updates
  const updateIngredientServingSize = (ingredientId: string, multiplier: number) => {
    setIngredientServingSizes(prev => ({
      ...prev,
      [ingredientId]: multiplier
    }));
  };

  const getIngredientServingSizeMultiplier = (ingredientId: string): number => {
    return ingredientServingSizes[ingredientId] || 1;
  };

  const getCurrentMealServingSizeMultiplier = (ingredientId: string): number => {
    return currentMealServingSizes[ingredientId] || 1;
  };

  const updateCurrentMealServingSize = (ingredientId: string, multiplier: number) => {
    setCurrentMealServingSizes(prev => ({
      ...prev,
      [ingredientId]: multiplier
    }));
  };

  const getAdjustedIngredientNutrition = (ingredient: Ingredient) => {
    const multiplier = getIngredientServingSizeMultiplier(ingredient.id);
    const baseValue = ingredient.servingSizeValue || 1;
    
    // The multiplier now directly represents the desired serving size value
    const adjustedMultiplier = multiplier / baseValue;
    
    return {
      calories: ingredient.calories * adjustedMultiplier,
      protein: ingredient.protein * adjustedMultiplier,
      fat: ingredient.fat * adjustedMultiplier,
      carbs: ingredient.carbs * adjustedMultiplier,
      sugar: ingredient.sugar * adjustedMultiplier,
      fiber: ingredient.fiber * adjustedMultiplier,
    };
  };

  // Serving Size Selector Component
  const ServingSizeSelector: React.FC<{
    ingredient: Ingredient;
    onUpdate: (multiplier: number) => void;
  }> = ({ ingredient, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const currentMultiplier = getIngredientServingSizeMultiplier(ingredient.id);
    // Always use the current multiplier (defaults to 1)
    const currentValue = currentMultiplier;
    const unit = ingredient.servingSizeUnit || '';

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleOptionClick = (multiplier: number, e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdate(multiplier);
      setIsOpen(false);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsOpen(false);
    };

    return (
      <div 
        className="serving-size-selector"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`serving-size-display ${isHovered ? 'hovered' : ''}`}
          onClick={handleClick}
        >
          {formatServingSize(currentValue, unit)}
        </div>
        {isOpen && (
          <div className="serving-size-dropdown">
            {[0.25, 0.5, ...Array.from({ length: 20 }, (_, i) => i + 1)].map(multiplier => (
              <div
                key={multiplier}
                className={`serving-size-option ${multiplier === currentValue ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionClick(multiplier, e);
                }}
              >
                {formatServingSize(multiplier, unit)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CurrentMealServingSizeSelector: React.FC<{
    ingredient: Ingredient;
    onUpdate: (multiplier: number) => void;
  }> = ({ ingredient, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const currentMultiplier = getCurrentMealServingSizeMultiplier(ingredient.id);
    // Always use the current multiplier (defaults to 1)
    const currentValue = currentMultiplier;
    const unit = ingredient.servingSizeUnit || '';

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleOptionClick = (multiplier: number, e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdate(multiplier);
      setIsOpen(false);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsOpen(false);
    };

    return (
      <div 
        className="serving-size-selector"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`serving-size-display ${isHovered ? 'hovered' : ''}`}
          onClick={handleClick}
        >
          {formatServingSize(currentValue, unit)}
        </div>
        {isOpen && (
          <div className="serving-size-dropdown">
            {[0.25, 0.5, ...Array.from({ length: 20 }, (_, i) => i + 1)].map(multiplier => (
              <div
                key={multiplier}
                className={`serving-size-option ${multiplier === currentValue ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionClick(multiplier, e);
                }}
              >
                {formatServingSize(multiplier, unit)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Ingredient database - use ingredientsData state (from API or hardcoded fallback)
  const ingredients: Ingredient[] = ingredientsData.length > 0 ? ingredientsData : [];

  // Default preset meals (always show in localhost)
  const getPresetMeals = (): PresetMeal[] => {
    // Hardcoded presets - these are always available to all users
    return [
      {
        id: 'preset-1754355207462',
        name: 'Eggs & Almonds',
        ingredients: [
          { ingredient: ingredients.find(i => i.id === 'almonds')!, quantity: 1, servingSizeMultiplier: 0.5 },
          { ingredient: ingredients.find(i => i.id === 'coconut-oil')!, quantity: 1, servingSizeMultiplier: 1 },
          { ingredient: ingredients.find(i => i.id === 'eggs')!, quantity: 1, servingSizeMultiplier: 4 },
          { ingredient: ingredients.find(i => i.id === 'garlic')!, quantity: 1, servingSizeMultiplier: 0.25 },
          { ingredient: ingredients.find(i => i.id === 'hemp-seeds')!, quantity: 1, servingSizeMultiplier: 1 },
          { ingredient: ingredients.find(i => i.id === 'hot-sauce')!, quantity: 1, servingSizeMultiplier: 1 },
          { ingredient: ingredients.find(i => i.id === 'pepper')!, quantity: 1, servingSizeMultiplier: 1 },
          { ingredient: ingredients.find(i => i.id === 'salt')!, quantity: 1, servingSizeMultiplier: 1 }
        ],
        nutrition: { calories: 549, protein: 30.6, fat: 46.0, carbs: 6.8, sugar: 1.7, fiber: 3.0, netCarbs: 3.8, proteinPercent: 22.2, fatPercent: 75.0, carbPercent: 2.8 }
      }
    ];
  };

  const addIngredient = (ingredient: Ingredient) => {
    const currentMultiplier = getIngredientServingSizeMultiplier(ingredient.id);

    const existing = selectedIngredients.find(item => item.ingredient.id === ingredient.id);
    
    if (existing) {
      // If the ingredient already exists, do nothing as per the user's latest request.
      return; 
    } else {
      // Store the original ingredient in selectedIngredients.
      setSelectedIngredients([...selectedIngredients, { ingredient: ingredient, quantity: 1 }]);
      // Set the current meal serving size to match what was selected in the ingredients panel
      updateCurrentMealServingSize(ingredient.id, currentMultiplier);
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
    setCurrentMealServingSizes({});
  };

  const addSavedMeal = (savedMeal: typeof savedMeals[0]) => {
    // Clear current ingredients and add the saved meal's ingredients
    setSelectedIngredients([...savedMeal.ingredients]);
    setMealName(savedMeal.name);
    
    // Restore serving size multipliers for the loaded ingredients
    const newServingSizes: { [key: string]: number } = {};
    savedMeal.ingredients.forEach(item => {
      if (item.servingSizeMultiplier) {
        newServingSizes[item.ingredient.id] = item.servingSizeMultiplier;
      }
    });
    setCurrentMealServingSizes(newServingSizes);
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
    
    // Check if this meal type is already selected for today (allow unlimited snacks)
    if (selectedMealType !== 'snack') {
      const existingMealOfType = selectedDailyMeals.find(meal => meal.mealType === selectedMealType);
      if (existingMealOfType) {
        alert(`You already have a ${selectedMealType} meal selected for today.`);
        return;
      }
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
    
    // Create ingredients with serving size multipliers stored
    const ingredientsWithServingSizes = selectedIngredients.map(item => ({
      ...item,
      servingSizeMultiplier: getCurrentMealServingSizeMultiplier(item.ingredient.id)
    }));
    
    const dailyMeal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      mealType: selectedMealType,
      ingredients: ingredientsWithServingSizes,
      nutrition: getTotalNutrition(),
      createdAt: new Date().toDateString()
    };
    
    // Always add to daily meals (Daily Meals section)
    setSelectedDailyMeals([...selectedDailyMeals, dailyMeal]);
    
    // Only add to saved meals (Meals tab) if it's not a duplicate
    if (!existingSavedMeal && !existingPresetMeal) {
      const savedMeal = {
        id: Date.now().toString(),
        name: mealName.trim(),
        ingredients: ingredientsWithServingSizes,
        nutrition: getTotalNutrition()
      };
      setSavedMeals([...savedMeals, savedMeal]);
    }
    
    setSelectedIngredients([]);
    setMealName('');
    setCurrentMealServingSizes({});
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
    setCurrentMealServingSizes({});
  };

  const generatePresetCode = (name: string, ingredients: SelectedIngredient[]) => {
    const ingredientCode = ingredients.map(item => {
      const currentMultiplier = getCurrentMealServingSizeMultiplier(item.ingredient.id);
      return `{ ingredient: ingredients.find(i => i.id === '${item.ingredient.id}')!, quantity: ${item.quantity}, servingSizeMultiplier: ${currentMultiplier} }`;
    }).join(',\n                 ');

    // Calculate nutrition using current meal serving size multipliers
    const nutrition = ingredients.reduce((total, item) => {
      const currentMultiplier = getCurrentMealServingSizeMultiplier(item.ingredient.id);
      
      return {
        calories: total.calories + (item.ingredient.calories * currentMultiplier * item.quantity),
        protein: total.protein + (item.ingredient.protein * currentMultiplier * item.quantity),
        fat: total.fat + (item.ingredient.fat * currentMultiplier * item.quantity),
        carbs: total.carbs + (item.ingredient.carbs * currentMultiplier * item.quantity),
        sugar: total.sugar + (item.ingredient.sugar * currentMultiplier * item.quantity),
        fiber: total.fiber + (item.ingredient.fiber * currentMultiplier * item.quantity),
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
    
    // Calculate net carbs (total carbs - fiber)
    const netCarbs = Math.max(0, nutrition.carbs - nutrition.fiber);
    
    // Calculate calorie distribution percentages
    const proteinCalories = nutrition.protein * 4; // 4 calories per gram of protein
    const fatCalories = nutrition.fat * 9; // 9 calories per gram of fat
    const netCarbCalories = netCarbs * 4; // 4 calories per gram of net carbs
    
    const totalCalories = proteinCalories + fatCalories + netCarbCalories;
    
    const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
    const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
    const carbPercent = totalCalories > 0 ? (netCarbCalories / totalCalories) * 100 : 0;

    return `{
               id: 'preset-${Date.now()}',
               name: '${name}',
               ingredients: [
                 ${ingredientCode}
               ],
               nutrition: { calories: ${Math.round(nutrition.calories)}, protein: ${nutrition.protein.toFixed(1)}, fat: ${nutrition.fat.toFixed(1)}, carbs: ${nutrition.carbs.toFixed(1)}, sugar: ${nutrition.sugar.toFixed(1)}, fiber: ${nutrition.fiber.toFixed(1)}, netCarbs: ${netCarbs.toFixed(1)}, proteinPercent: ${proteinPercent.toFixed(1)}, fatPercent: ${fatPercent.toFixed(1)}, carbPercent: ${carbPercent.toFixed(1)} }
             }`;
  };



  const getTotalNutrition = () => {
    const totals = selectedIngredients.reduce((total, item) => {
      const currentMultiplier = getCurrentMealServingSizeMultiplier(item.ingredient.id);
      
      return {
        calories: total.calories + (item.ingredient.calories * currentMultiplier * item.quantity),
        protein: total.protein + (item.ingredient.protein * currentMultiplier * item.quantity),
        fat: total.fat + (item.ingredient.fat * currentMultiplier * item.quantity),
        carbs: total.carbs + (item.ingredient.carbs * currentMultiplier * item.quantity),
        sugar: total.sugar + (item.ingredient.sugar * currentMultiplier * item.quantity),
        fiber: total.fiber + (item.ingredient.fiber * currentMultiplier * item.quantity),
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
    
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
    // First filter by category
    let filteredIngredients = ingredients;
    if (selectedCategories.length > 0) {
      filteredIngredients = ingredients.filter(ingredient => selectedCategories.includes(ingredient.category));
    }
    
    // Then filter out ingredients that are already in the current meal
    return filteredIngredients.filter(ingredient => 
      !selectedIngredients.some(item => item.ingredient.id === ingredient.id)
    );
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
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e67e22', fontWeight: 'bold' }}>
            Loading ingredients from database...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e53e3e' }}>
            Error loading from database: {error}. Using hardcoded data.
          </div>
        )}
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
                  {getFilteredIngredients().map(ingredient => {
                    const adjustedNutrition = getAdjustedIngredientNutrition(ingredient);
                    return (
                      <button
                        key={ingredient.id}
                        className="ingredient-button"
                        onClick={() => addIngredient(ingredient)}
                        style={{ borderLeftColor: getCategoryColor(ingredient.category) }}
                      >
                        <div className="ingredient-name">{ingredient.name}</div>
                        <div className="ingredient-serving">
                          <ServingSizeSelector
                            ingredient={ingredient}
                            onUpdate={(multiplier) => updateIngredientServingSize(ingredient.id, multiplier)}
                          />
                        </div>
                        <div className="ingredient-nutrition">
                          <span>{adjustedNutrition.calories.toFixed(0)} cal</span>
                          <span>P: {adjustedNutrition.protein.toFixed(1)}g</span>
                          <span>F: {adjustedNutrition.fat.toFixed(1)}g</span>
                          <span>C: {adjustedNutrition.carbs.toFixed(1)}g</span>
                          <span>S: {adjustedNutrition.sugar.toFixed(1)}g</span>
                          <span>Fi: {adjustedNutrition.fiber.toFixed(1)}g</span>
                        </div>
                      </button>
                    );
                  })}
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
                           {item.ingredient.name} {formatServingSize(item.servingSizeMultiplier || 1, item.ingredient.servingSizeUnit || '')}
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
                           {item.ingredient.name} {formatServingSize(item.servingSizeMultiplier || 1, item.ingredient.servingSizeUnit || '')}
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
                selectedIngredients.map(item => {
                  const currentMultiplier = getCurrentMealServingSizeMultiplier(item.ingredient.id);
                  
                  const adjustedNutrition = {
                    calories: item.ingredient.calories * currentMultiplier * item.quantity,
                    protein: item.ingredient.protein * currentMultiplier * item.quantity,
                    fat: item.ingredient.fat * currentMultiplier * item.quantity,
                    carbs: item.ingredient.carbs * currentMultiplier * item.quantity,
                    sugar: item.ingredient.sugar * currentMultiplier * item.quantity,
                    fiber: item.ingredient.fiber * currentMultiplier * item.quantity,
                  };

                  return (
                    <div key={item.ingredient.id} className="selected-ingredient">
                      <div className="ingredient-info">
                        <span className="ingredient-name">{item.ingredient.name}</span>
                        <span className="ingredient-quantity">
                          <CurrentMealServingSizeSelector
                            ingredient={item.ingredient}
                            onUpdate={(multiplier) => updateCurrentMealServingSize(item.ingredient.id, multiplier)}
                          />
                        </span>
                      </div>
                      <div className="ingredient-nutrition">
                        <span>{adjustedNutrition.calories.toFixed(0)} cal</span>
                        <span>P: {adjustedNutrition.protein.toFixed(1)}g</span>
                        <span>F: {adjustedNutrition.fat.toFixed(1)}g</span>
                        <span>C: {adjustedNutrition.carbs.toFixed(1)}g</span>
                        <span>S: {adjustedNutrition.sugar.toFixed(1)}g</span>
                        <span>Fi: {adjustedNutrition.fiber.toFixed(1)}g</span>
                      </div>
                      <button 
                        onClick={() => removeIngredient(item.ingredient.id)}
                        className="remove-button"
                      >
                        -
                      </button>
                    </div>
                  );
                })
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
                           {item.ingredient.name} {formatServingSize(item.servingSizeMultiplier || 1, item.ingredient.servingSizeUnit || '')}
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