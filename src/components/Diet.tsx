import React, { useState, useEffect } from 'react';
import './Diet.css';
import { buildApiUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useAuthRefresh } from '../hooks/useAuthRefresh';

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
  isCustom?: boolean; // Whether this is a custom ingredient
}

interface UserIngredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  category: 'protein' | 'vegetables' | 'fats' | 'nuts-seeds' | 'seasonings' | 'beverages' | 'fruits' | 'dairy';
  serving_size: string;
  serving_size_value?: number;
  serving_size_unit?: string;
  created_at: string;
  updated_at: string;
}

interface CustomIngredientForm {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  category: 'protein' | 'vegetables' | 'fats' | 'nuts-seeds' | 'seasonings' | 'beverages' | 'fruits' | 'dairy';
  servingSize: string;
  servingSizeValue: number;
  servingSizeUnit: string;
}

interface SelectedIngredient {
  ingredient: Ingredient;
  quantity: number;
  servingSizeMultiplier: number;
}

interface DailyMeal {
  id: string;
  name: string;
  mealType: string;
  ingredients: SelectedIngredient[];
  nutrition: Nutrition;
  createdAt: string;
}

interface SavedMeal {
  id: string;
  name: string;
  ingredients: SelectedIngredient[];
  nutrition: Nutrition;
  isFavorite: boolean;
  createdAt: string;
}


interface Nutrition {
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
}

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  time: 'morning' | 'afternoon' | 'night';
  created_at: string;
}

interface WeightForm {
  weight: number;
  time: 'morning' | 'afternoon' | 'night';
}

const Diet: React.FC = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [mealName, setMealName] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'meals' | 'custom-ingredients' | 'hidden-ingredients' | 'weight'>('ingredients');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<Array<SavedMeal>>([]);
  const [selectedDailyMeals, setSelectedDailyMeals] = useState<Array<DailyMeal>>([]);
  const [ingredientServingSizes, setIngredientServingSizes] = useState<Record<string, number>>({});
  const [currentMealServingSizes, setCurrentMealServingSizes] = useState<Record<string, number>>({});
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  
  // New state for hybrid data loading
  const [ingredientsData, setIngredientsData] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom ingredients state
  const [userIngredients, setUserIngredients] = useState<UserIngredient[]>([]);
  const [showCustomIngredientForm, setShowCustomIngredientForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<UserIngredient | null>(null);
  const [customIngredientForm, setCustomIngredientForm] = useState<CustomIngredientForm>({
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugar: 0,
    fiber: 0,
    category: 'protein',
    servingSize: '1 serving',
    servingSizeValue: 1,
    servingSizeUnit: 'serving'
  });
  const [isSavingIngredient, setIsSavingIngredient] = useState(false);

  const [hiddenIngredients, setHiddenIngredients] = useState<Ingredient[]>([]);
  
  // Weight tracking state
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [weightForm, setWeightForm] = useState<WeightForm>(() => {
    // Initialize with first available time slot, but we'll need to set this after weightEntries loads
    return {
      weight: 0,
      time: 'morning'
    };
  });
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  
  const { isLoggedIn, authToken } = useAuth();

  // Helper function to calculate nutrition for a meal's ingredients
  const calculateNutritionForMeal = (mealIngredients: (SelectedIngredient & { servingSizeMultiplier?: number })[]) => {
    const total = mealIngredients.reduce((acc, item) => {
      const ingredient = item.ingredient;
      const quantity = item.quantity;
      // Use current serving size multiplier from state, fallback to stored value, then default to 1
      const servingSizeMultiplier = getCurrentMealServingSizeMultiplier(ingredient.id) || item.servingSizeMultiplier || 1;
      
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
      calories: total.calories,
      protein: total.protein,
      fat: total.fat,
      carbs: total.carbs,
      sugar: total.sugar,
      fiber: total.fiber,
      netCarbs,
      proteinPercent,
      fatPercent,
      carbPercent
    };
  };

  // Custom ingredients functions
  const loadUserIngredients = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/diet/ingredients'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserIngredients(data);
      } else {
        console.error('Failed to load user ingredients');
      }
    } catch (error) {
      console.error('Error loading user ingredients:', error);
    }
  };

  const saveCustomIngredient = async (ingredientData: CustomIngredientForm) => {
    setIsSavingIngredient(true);
    try {
      const url = editingIngredient 
        ? buildApiUrl(`/api/diet/ingredients/${editingIngredient.id}`)
        : buildApiUrl('/api/diet/ingredients');
      
      const method = editingIngredient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: ingredientData.name,
          calories: ingredientData.calories,
          protein: ingredientData.protein,
          fat: ingredientData.fat,
          carbs: ingredientData.carbs,
          sugar: ingredientData.sugar,
          fiber: ingredientData.fiber,
          category: ingredientData.category,
          serving_size: ingredientData.servingSize,
          serving_size_value: ingredientData.servingSizeValue,
          serving_size_unit: ingredientData.servingSizeUnit
        })
      });

      if (response.ok) {
        const savedIngredient = await response.json();
        
        if (editingIngredient) {
          setUserIngredients(prev => prev.map(ing => 
            ing.id === editingIngredient.id ? savedIngredient : ing
          ));
        } else {
          setUserIngredients(prev => [...prev, savedIngredient]);
        }
        
        // Reset form and close
        setCustomIngredientForm({
          name: '',
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          sugar: 0,
          fiber: 0,
          category: 'protein',
          servingSize: '1 serving',
          servingSizeValue: 1,
          servingSizeUnit: 'serving'
        });
        setShowCustomIngredientForm(false);
        setEditingIngredient(null);
      } else {
        console.error('Failed to save custom ingredient');
      }
    } catch (error) {
      console.error('Error saving custom ingredient:', error);
    } finally {
      setIsSavingIngredient(false);
    }
  };

  const deleteCustomIngredient = async (ingredientId: string) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/diet/ingredients/${ingredientId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUserIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
      } else {
        console.error('Failed to delete custom ingredient');
      }
    } catch (error) {
      console.error('Error deleting custom ingredient:', error);
    }
  };

  const editCustomIngredient = (ingredient: UserIngredient) => {
    setEditingIngredient(ingredient);
    setCustomIngredientForm({
      name: ingredient.name,
      calories: ingredient.calories,
      protein: ingredient.protein,
      fat: ingredient.fat,
      carbs: ingredient.carbs,
      sugar: ingredient.sugar,
      fiber: ingredient.fiber,
      category: ingredient.category,
      servingSize: ingredient.serving_size,
      servingSizeValue: ingredient.serving_size_value || 1,
      servingSizeUnit: ingredient.serving_size_unit || 'serving'
    });
    setShowCustomIngredientForm(true);
  };

  const resetCustomIngredientForm = () => {
    setCustomIngredientForm({
      name: '',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      category: 'protein',
      servingSize: '1 serving',
      servingSizeValue: 1,
      servingSizeUnit: 'serving'
    });
    setShowCustomIngredientForm(false);
    setEditingIngredient(null);
  };

  // Weight tracking functions
  const loadWeightEntries = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/diet/weight'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeightEntries(data.entries || data || []);
      } else {
        console.error('Failed to load weight entries');
      }
    } catch (error) {
      console.error('Error loading weight entries:', error);
    }
  };

  const saveWeightEntry = async (weightData: WeightForm) => {
    setIsSavingWeight(true);
    try {
      const url = editingWeight 
        ? buildApiUrl(`/api/diet/weight/${editingWeight.id}`)
        : buildApiUrl('/api/diet/weight');
      
      const method = editingWeight ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weight: weightData.weight,
          date: getTodayDate(),
          time: weightData.time
        })
      });

      if (response.ok) {
        const savedEntry = await response.json();
        
        if (editingWeight) {
          setWeightEntries(prev => prev.map(entry => 
            entry.id === editingWeight.id ? savedEntry : entry
          ));
        } else {
          setWeightEntries(prev => [...prev, savedEntry]);
        }
        
        // Reset form and close
        resetWeightForm();
      } else {
        console.error('Failed to save weight entry');
      }
    } catch (error) {
      console.error('Error saving weight entry:', error);
    } finally {
      setIsSavingWeight(false);
    }
  };

  const deleteWeightEntry = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/diet/weight/${entryId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWeightEntries(prev => prev.filter(entry => entry.id !== entryId));
      } else {
        console.error('Failed to delete weight entry');
      }
    } catch (error) {
      console.error('Error deleting weight entry:', error);
    }
  };

  const editWeightEntry = (entry: WeightEntry) => {
    setEditingWeight(entry);
    setWeightForm({
      weight: entry.weight,
      time: entry.time as 'morning' | 'afternoon' | 'night'
    });
    setShowWeightForm(true);
  };

  // Update weightForm time to first available slot when weightEntries change
  useEffect(() => {
    if (!editingWeight && weightEntries.length > 0) {
      const availableSlots = getAvailableTimeSlots();
      if (availableSlots.length > 0 && !availableSlots.includes(weightForm.time)) {
        setWeightForm(prev => ({ ...prev, time: availableSlots[0] }));
      }
    }
  }, [weightEntries, editingWeight]);

  const resetWeightForm = () => {
    const availableSlots = getAvailableTimeSlots();
    setWeightForm({
      weight: 0,
      time: availableSlots.length > 0 ? availableSlots[0] : 'morning'
    });
    setEditingWeight(null);
    setShowWeightForm(false);
  };

  // Load hidden ingredients from preferences and custom ingredients
  const loadHiddenIngredients = async () => {
    try {
      // Load hidden preset ingredients
      const presetResponse = await fetch(buildApiUrl('/api/diet/all-preset-ingredients'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Load hidden custom ingredients
      const customResponse = await fetch(buildApiUrl('/api/diet/ingredients/all'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (presetResponse.ok && customResponse.ok) {
        const presetData = await presetResponse.json();
        const customData = await customResponse.json();
        
        // Filter to only show hidden ingredients
        const hiddenPresetIngs = presetData.ingredients.filter((ingredient: any) => ingredient.isHidden);
        const hiddenCustomIngs = customData.filter((ingredient: any) => ingredient.is_hidden);
        
        // Combine and format custom ingredients to match preset ingredient structure
        const formattedCustomIngs = hiddenCustomIngs.map((ingredient: any) => ({
          id: `user_${ingredient.id}`,
          name: ingredient.name,
          calories: ingredient.calories,
          protein: ingredient.protein,
          fat: ingredient.fat,
          carbs: ingredient.carbs,
          sugar: ingredient.sugar,
          fiber: ingredient.fiber,
          category: ingredient.category,
          servingSize: ingredient.serving_size,
          servingSizeValue: ingredient.serving_size_value,
          servingSizeUnit: ingredient.serving_size_unit,
          isCustom: true
        }));
        
        // Combine both types of hidden ingredients
        const allHiddenIngs = [...hiddenPresetIngs, ...formattedCustomIngs];
        setHiddenIngredients(allHiddenIngs);
      }
    } catch (error) {
      console.error('Error loading hidden ingredients:', error);
    }
  };

  // Toggle ingredient visibility (hide/show preset ingredients)
  const toggleIngredientVisibility = async (ingredientId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/diet/ingredient-preferences/${ingredientId}/toggle-hidden`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh ingredients from API to get updated list
        await fetchIngredientsFromApi();
        
        // If we're on the hidden ingredients tab and we just restored an ingredient,
        // refresh the hidden ingredients list
        if (activeTab === 'hidden-ingredients') {
          await loadHiddenIngredients();
        }
      } else {
        console.error('Failed to toggle ingredient visibility');
      }
    } catch (error) {
      console.error('Error toggling ingredient visibility:', error);
    }
  };

  // Toggle custom ingredient visibility (hide/show custom ingredients)
  const toggleCustomIngredientVisibility = async (ingredientId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/diet/ingredients/${ingredientId}/toggle-hidden`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh custom ingredients list
        await loadUserIngredients();
        
        // If we're on the hidden ingredients tab, refresh the hidden ingredients list
        if (activeTab === 'hidden-ingredients') {
          await loadHiddenIngredients();
        }
      } else {
        console.error('Failed to toggle custom ingredient visibility');
      }
    } catch (error) {
      console.error('Error toggling custom ingredient visibility:', error);
    }
  };

  // Load saved meals and daily meals from localStorage on component mount
  useEffect(() => {
    if (isLoggedIn && authToken) {
      loadSavedMeals();
      loadTodaysMeals();
      loadUserIngredients();
      loadWeightEntries();
    }
  }, [isLoggedIn, authToken]);

  // Load meals from database when logged in
  useEffect(() => {
    if (isLoggedIn && authToken) {
      loadTodaysMeals();
      loadSavedMeals();
    }
  }, [isLoggedIn, authToken]);

  // Load hidden ingredients when hidden ingredients tab is selected
  useEffect(() => {
    if (isLoggedIn && authToken && activeTab === 'hidden-ingredients') {
      loadHiddenIngredients();
    }
  }, [isLoggedIn, authToken, activeTab]);

  // Fetch ingredients when component mounts or auth state changes
  useAuthRefresh(() => {
    if (isLoggedIn) {
      fetchIngredientsFromApi();
    } else {
      // Clear ingredients when logged out
      setIngredientsData([]);
      setError(null);
    }
  }, [isLoggedIn]);

  const fetchIngredientsFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(buildApiUrl('/api/diet/preset-ingredients'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ingredients && data.ingredients.length > 0) {
        setIngredientsData(data.ingredients);
      } else {
        setError('No ingredients data available');
      }
    } catch (err) {
      console.error('Error fetching ingredients from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };



  // Save meals to localStorage whenever savedMeals changes
  useEffect(() => {
    // Don't save while we're still loading
    if (loading) return;
    
    try {
      localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
    } catch (error) {
      console.warn('❌ Failed to save meals to localStorage:', error);
    }
  }, [savedMeals, loading]);

  // Save daily meals to localStorage and notify widget
  useEffect(() => {
    // Don't save while we're still loading
    if (loading) return;
    
    try {
      localStorage.setItem('selectedDailyMeals', JSON.stringify(selectedDailyMeals));
      localStorage.setItem('ingredientServingSizes', JSON.stringify(ingredientServingSizes));
      localStorage.setItem('currentMealServingSizes', JSON.stringify(currentMealServingSizes));
      
      // Dispatch custom event to notify the widget
      window.dispatchEvent(new Event('dailyMealsUpdated'));
    } catch (error) {
      console.warn('❌ Failed to save daily meals to localStorage:', error);
    }
  }, [selectedDailyMeals, loading, ingredientServingSizes, currentMealServingSizes]);


  
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

  // Combine preset ingredients with user ingredients
  const ingredients: Ingredient[] = [
    ...ingredientsData,
    ...userIngredients.map(userIng => ({
      id: `user_${userIng.id}`,
      name: userIng.name,
      calories: userIng.calories,
      protein: userIng.protein,
      fat: userIng.fat,
      carbs: userIng.carbs,
      sugar: userIng.sugar,
      fiber: userIng.fiber,
      category: userIng.category,
      servingSize: userIng.serving_size,
      servingSizeValue: userIng.serving_size_value,
      servingSizeUnit: userIng.serving_size_unit
    }))
  ];


  const addIngredient = (ingredient: Ingredient) => {
    const currentMultiplier = getIngredientServingSizeMultiplier(ingredient.id);

    const existing = selectedIngredients.find(item => item.ingredient.id === ingredient.id);
    
    if (existing) {
      // If the ingredient already exists, do nothing as per the user's latest request.
      return; 
    } else {
      // Store the original ingredient in selectedIngredients.
      setSelectedIngredients([...selectedIngredients, { ingredient: ingredient, quantity: 1, servingSizeMultiplier: currentMultiplier }]);
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

  const addSavedMeal = (savedMeal: SavedMeal) => {
    try {
      // Add safety check to ensure savedMeal has required properties
      if (!savedMeal || !savedMeal.ingredients || !Array.isArray(savedMeal.ingredients)) {
        console.error('Invalid saved meal structure:', savedMeal);
        return;
      }
      
      // Validate that all ingredients have the required structure
      const validIngredients = savedMeal.ingredients.filter(item => 
        item && item.ingredient && item.ingredient.id && item.ingredient.name
      );
      
      if (validIngredients.length === 0) {
        console.error('No valid ingredients found in saved meal:', savedMeal);
        return;
      }
      
      // Clear current ingredients and add the saved meal's ingredients
      setSelectedIngredients([...validIngredients]);
      setMealName(savedMeal.name || 'Unnamed Meal');
      
      // Restore serving size multipliers for the loaded ingredients
      const newServingSizes: { [key: string]: number } = {};
      validIngredients.forEach(item => {
        if (item && item.ingredient && item.ingredient.id && item.servingSizeMultiplier) {
          newServingSizes[item.ingredient.id] = item.servingSizeMultiplier;
        }
      });
      setCurrentMealServingSizes(newServingSizes);
    } catch (error) {
      console.error('Error adding saved meal:', error);
      // Don't crash the page, just log the error
    }
  };

  const removeFromDailyMeals = async (mealId: string) => {
    try {
      // Delete from database
      const response = await fetch(buildApiUrl(`/api/diet/meals/${mealId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to delete meal from database');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }

    // Update local state
    setSelectedDailyMeals(selectedDailyMeals.filter(meal => meal.id !== mealId));
    
    // Refresh data from backend to ensure consistency
    await refreshDataFromBackend();
  };

  const removeSavedMeal = async (mealId: string) => {
    try {
      // Delete from database
      const response = await fetch(buildApiUrl(`/api/diet/saved-meals/${mealId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to delete saved meal from database');
      }
    } catch (error) {
      console.error('Error deleting saved meal:', error);
    }

    // Update local state
    setSavedMeals(savedMeals.filter(meal => meal.id !== mealId));
    
    // Refresh data from backend to ensure consistency
    await refreshDataFromBackend();
  };

  const saveMeal = async () => {
    if (selectedIngredients.length === 0) return;
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }
    
    if (!isLoggedIn || !authToken) {
      alert('Please log in to save meals');
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
    
    // Check if this exact combination of ingredients already exists in saved meals
    const ingredientsKey = selectedIngredients
      .sort((a, b) => a.ingredient.id.localeCompare(b.ingredient.id))
      .map(item => `${item.ingredient.id}:${item.quantity}`)
      .join(',');
      
    // Check against saved meals
    const existingSavedMeal = savedMeals.find(meal => {
      // Add safety check to ensure meal has required properties
      if (!meal || !meal.ingredients || !Array.isArray(meal.ingredients)) {
        return false; // Skip invalid meals
      }
      
      const mealIngredientsKey = meal.ingredients
        .filter(item => item && item.ingredient && item.ingredient.id) // Filter out invalid items
        .sort((a, b) => a.ingredient.id.localeCompare(b.ingredient.id))
        .map(item => `${item.ingredient.id}:${item.quantity || 1}`)
        .join(',');
      return mealIngredientsKey === ingredientsKey;
    });
    
    // Create ingredients with serving size multipliers stored
    const ingredientsWithServingSizes = selectedIngredients.map(item => ({
      ...item,
      servingSizeMultiplier: getCurrentMealServingSizeMultiplier(item.ingredient.id)
    }));
    
    const nutrition = calculateNutritionForMeal(ingredientsWithServingSizes);
    
    setIsSavingMeal(true);
    
    try {
      // Save to daily meals (user_meals table)
      const mealData = {
        name: mealName.trim(),
        meal_type: selectedMealType,
        ingredients_json: ingredientsWithServingSizes.map(item => ({
          ingredient_id: String(item.ingredient.id),
          ingredient_name: String(item.ingredient.name),
          calories: Number(item.ingredient.calories) || 0,
          protein: Number(item.ingredient.protein) || 0,
          fat: Number(item.ingredient.fat) || 0,
          carbs: Number(item.ingredient.carbs) || 0,
          sugar: Number(item.ingredient.sugar) || 0,
          fiber: Number(item.ingredient.fiber) || 0,
          category: String(item.ingredient.category),
          serving_size: String(item.ingredient.servingSize),
          serving_size_value: item.ingredient.servingSizeValue ? Number(item.ingredient.servingSizeValue) : null,
          serving_size_unit: item.ingredient.servingSizeUnit || null,
          quantity: Number(item.quantity) || 1,
          serving_size_multiplier: Number(item.servingSizeMultiplier) || 1
        })),
        nutrition_json: {
          calories: Number(nutrition.calories) || 0,
          protein: Number(nutrition.protein) || 0,
          fat: Number(nutrition.fat) || 0,
          carbs: Number(nutrition.carbs) || 0,
          sugar: Number(nutrition.sugar) || 0,
          fiber: Number(nutrition.fiber) || 0,
          net_carbs: Number(nutrition.netCarbs) || 0,
          protein_percent: Number(nutrition.proteinPercent) || 0,
          fat_percent: Number(nutrition.fatPercent) || 0,
          carb_percent: Number(nutrition.carbPercent) || 0
        },
        date: getTodayDate()
      };

      const dailyMealResponse = await fetch(buildApiUrl('/api/diet/meals'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mealData)
      });

      if (!dailyMealResponse.ok) {
        const errorText = await dailyMealResponse.text();
        throw new Error(`Failed to save daily meal: ${dailyMealResponse.statusText} - ${errorText}`);
      }

      const savedDailyMeal = await dailyMealResponse.json();
      
      // Only add to saved meals (user_saved_meals table) if it's not a duplicate
      if (!existingSavedMeal) {
        const savedMealData = {
          name: mealName.trim(),
          ingredients_json: ingredientsWithServingSizes.map(item => ({
            ingredient_id: String(item.ingredient.id),
            ingredient_name: String(item.ingredient.name),
            calories: Number(item.ingredient.calories),
            protein: Number(item.ingredient.protein),
            fat: Number(item.ingredient.fat),
            carbs: Number(item.ingredient.carbs),
            sugar: Number(item.ingredient.sugar),
            fiber: Number(item.ingredient.fiber),
            category: String(item.ingredient.category),
            serving_size: String(item.ingredient.servingSize),
            serving_size_value: item.ingredient.servingSizeValue ? Number(item.ingredient.servingSizeValue) : null,
            serving_size_unit: item.ingredient.servingSizeUnit ? String(item.ingredient.servingSizeUnit) : null,
            quantity: Number(item.quantity),
            serving_size_multiplier: Number(item.servingSizeMultiplier) || 1
          })),
          nutrition_json: {
            calories: Number(nutrition.calories) || 0,
            protein: Number(nutrition.protein) || 0,
            fat: Number(nutrition.fat) || 0,
            carbs: Number(nutrition.carbs) || 0,
            sugar: Number(nutrition.sugar) || 0,
            fiber: Number(nutrition.fiber) || 0,
            net_carbs: Number(nutrition.netCarbs) || 0,
            protein_percent: Number(nutrition.proteinPercent) || 0,
            fat_percent: Number(nutrition.fatPercent) || 0,
            carb_percent: Number(nutrition.carbPercent) || 0
          }
        };

        const savedMealResponse = await fetch(buildApiUrl('/api/diet/saved-meals'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(savedMealData)
        });

        if (!savedMealResponse.ok) {
          console.warn('Failed to save to saved meals, but daily meal was saved');
        } else {
          const savedMeal = await savedMealResponse.json();
          // Ensure the saved meal has the proper structure before adding to state
          if (savedMeal && savedMeal.id) {
            setSavedMeals([...savedMeals, savedMeal]);
          }
        }
      }
      
      // Add to local state for immediate UI update
      const dailyMeal = {
        id: savedDailyMeal.id || Date.now().toString(),
        name: mealName.trim(),
        mealType: selectedMealType,
        ingredients: ingredientsWithServingSizes,
        nutrition: nutrition,
        createdAt: new Date().toDateString()
      };
      
      setSelectedDailyMeals([...selectedDailyMeals, dailyMeal]);
      
      // Clear the form
      setSelectedIngredients([]);
      setMealName('');
      setCurrentMealServingSizes({});
      
      // Refresh data from backend to ensure consistency
      await refreshDataFromBackend();
      
    } catch (error) {
      console.error('Error saving meal:', error);
      alert(`Failed to save meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingMeal(false);
    }
  };

  // Load today's meals from database
  const loadTodaysMeals = async () => {
    if (!authToken) return;
    
    try {
      const today = getTodayDate();
      console.log('🔍 Loading meals for date:', today);
      
      const response = await fetch(buildApiUrl(`/api/diet/meals/${today}`), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API response:', data);
        
        // Handle both new format (with meals property) and old format (direct array)
        const meals = data.meals || data;
        if (meals && meals.length > 0) {
          console.log('🔍 Found meals:', meals.length);
          // Transform database meals to match our local state format
          const transformedMeals = meals.map((meal: any) => {
            try {
              // Parse JSON data safely
              const ingredients = typeof meal.ingredients_json === 'string' 
                ? JSON.parse(meal.ingredients_json) 
                : meal.ingredients_json;
              
              const nutrition = typeof meal.nutrition_json === 'string' 
                ? JSON.parse(meal.nutrition_json) 
                : meal.nutrition_json;
              
              // Ensure ingredients have the proper structure
              const validIngredients = ingredients.filter((item: any) => 
                item && item.ingredient_id && item.ingredient_name
              ).map((item: any) => ({
                ingredient: {
                  id: item.ingredient_id,
                  name: item.ingredient_name,
                  calories: Number(item.calories) || 0,
                  protein: Number(item.protein) || 0,
                  fat: Number(item.fat) || 0,
                  carbs: Number(item.carbs) || 0,
                  sugar: Number(item.sugar) || 0,
                  fiber: Number(item.fiber) || 0,
                  category: item.category || 'protein',
                  servingSize: item.serving_size || '1',
                  servingSizeValue: item.serving_size_value || 1,
                  servingSizeUnit: item.serving_size_unit || ''
                },
                quantity: Number(item.quantity) || 1,
                servingSizeMultiplier: Number(item.serving_size_multiplier) || 1
              }));
              
              return {
                id: meal.id.toString(),
                name: meal.name || 'Unnamed Meal',
                mealType: meal.meal_type || 'unknown',
                ingredients: validIngredients,
                nutrition: nutrition,
                createdAt: meal.created_at ? new Date(meal.created_at).toDateString() : new Date().toDateString()
              };
            } catch (parseError) {
              console.error('Error parsing meal data:', parseError, meal);
              return null;
            }
          }).filter(Boolean); // Remove any null entries from parsing errors
          
          if (transformedMeals.length > 0) {
            setSelectedDailyMeals(transformedMeals);
          }
        }
      }
    } catch (error) {
      console.error('Error loading today\'s meals:', error);
      // Don't show error to user, just log it
    }
  };

  // Load saved meals from database
  const loadSavedMeals = async () => {
    if (!authToken) return;
    
    try {
      const response = await fetch(buildApiUrl('/api/diet/saved-meals'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both new format (with meals property) and old format (direct array)
        const meals = data.meals || data;
        if (meals && meals.length > 0) {
          // Transform database meals to match our local state format
          const transformedMeals = meals.map((meal: any) => {
            try {
              // Parse JSON data safely
              const ingredients = typeof meal.ingredients_json === 'string' 
                ? JSON.parse(meal.ingredients_json) 
                : meal.ingredients_json;
              
              const nutrition = typeof meal.nutrition_json === 'string' 
                ? JSON.parse(meal.nutrition_json) 
                : meal.nutrition_json;
              
              // Ensure ingredients have the proper structure
              const validIngredients = ingredients.filter((item: any) => 
                item && item.ingredient_id && item.ingredient_name
              ).map((item: any) => ({
                ingredient: {
                  id: item.ingredient_id,
                  name: item.ingredient_name,
                  calories: Number(item.calories) || 0,
                  protein: Number(item.protein) || 0,
                  fat: Number(item.fat) || 0,
                  carbs: Number(item.carbs) || 0,
                  sugar: Number(item.sugar) || 0,
                  fiber: Number(item.fiber) || 0,
                  category: item.category || 'protein',
                  servingSize: item.serving_size || '1',
                  servingSizeValue: item.serving_size_value || 1,
                  servingSizeUnit: item.serving_size_unit || ''
                },
                quantity: Number(item.quantity) || 1,
                servingSizeMultiplier: Number(item.serving_size_multiplier) || 1
              }));
              
              return {
                id: meal.id.toString(),
                name: meal.name || 'Unnamed Meal',
                ingredients: validIngredients,
                nutrition: nutrition,
                isFavorite: meal.is_favorite || false,
                createdAt: meal.created_at ? new Date(meal.created_at).toDateString() : new Date().toDateString()
              };
            } catch (parseError) {
              console.error('Error parsing saved meal data:', parseError, meal);
              return null;
            }
          }).filter(Boolean); // Remove any null entries from parsing errors
          
          if (transformedMeals.length > 0) {
            setSavedMeals(transformedMeals);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved meals:', error);
      // Don't show error to user, just log it
    }
  };

  // Refresh data from backend to ensure consistency
  const refreshDataFromBackend = async () => {
    if (isLoggedIn && authToken) {
      await Promise.all([
        loadTodaysMeals(),
        loadSavedMeals()
      ]);
    }
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
    const dailyTotals = selectedDailyMeals.reduce((total, meal) => {
      // Add safety check to ensure meal has required properties
      if (!meal || !meal.nutrition) {
        return total; // Skip invalid meals
      }
      
      return {
        calories: total.calories + (meal.nutrition.calories || 0),
        protein: total.protein + (meal.nutrition.protein || 0),
        fat: total.fat + (meal.nutrition.fat || 0),
        carbs: total.carbs + (meal.nutrition.carbs || 0),
        sugar: total.sugar + (meal.nutrition.sugar || 0),
        fiber: total.fiber + (meal.nutrition.fiber || 0),
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
    
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

  // Get unique categories from ingredients in the specified display order
  const getUniqueCategories = () => {
    // Define the order that matches how ingredients are displayed
    const categoryOrder: Array<'protein' | 'vegetables' | 'fats' | 'nuts-seeds' | 'seasonings' | 'beverages' | 'fruits' | 'dairy'> = [
      'protein', 'nuts-seeds', 'dairy', 'vegetables', 'fats', 'seasonings', 'fruits', 'beverages'
    ];
    
    // Get unique categories from ingredients
    const availableCategories = ingredients
      .filter(ingredient => ingredient && ingredient.category)
      .map(ingredient => ingredient.category);
    const uniqueCategories = [...new Set(availableCategories)];
    
    // Return categories in the specified order, filtering out any that don't exist
    return categoryOrder.filter(category => uniqueCategories.includes(category));
  };

  // Filter ingredients based on selected categories
  const getFilteredIngredients = () => {
    // First filter by category
    let filteredIngredients = ingredients;
    if (selectedCategories.length > 0) {
      filteredIngredients = ingredients.filter(ingredient => 
        ingredient && ingredient.category && selectedCategories.includes(ingredient.category)
      );
    }
    
    // Then filter out ingredients that are already in the current meal
    const availableIngredients = filteredIngredients.filter(ingredient => 
      ingredient && ingredient.id && !selectedIngredients.some(item => 
        item && item.ingredient && item.ingredient.id === ingredient.id
      )
    );

    // Group ingredients by category in the specified order
    const categoryOrder = ['protein', 'nuts-seeds', 'dairy', 'vegetables', 'fats', 'seasonings', 'fruits', 'beverages'];
    
    const groupedIngredients: Ingredient[] = [];
    
    categoryOrder.forEach(category => {
      const categoryIngredients = availableIngredients.filter(ingredient => ingredient.category === category);
      if (categoryIngredients.length > 0) {
        groupedIngredients.push(...categoryIngredients);
      }
    });
    
    return groupedIngredients;
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const totalNutrition = calculateNutritionForMeal(selectedIngredients);

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="diet-page">
        <div className="diet-header">
          <h1>Diet & Nutrition</h1>
          <p>Please <a href="/auth/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>log in</a> to access your diet tracking tools.</p>
        </div>
      </div>
    );
  }

  // Helper function to get today's date in MM-DD-YYYY format (matching database)
  const getTodayDate = (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const result = `${month}-${day}-${year}`;
    console.log('🔍 getTodayDate() called:', { now: now.toLocaleString(), result });
    return result;
  };

  // Helper function to get available time slots for weight entries today
  const getAvailableTimeSlots = (): Array<'morning' | 'afternoon' | 'night'> => {
    const today = getTodayDate();
    const usedTimeSlots = weightEntries
      .filter(entry => entry.date === today)
      .map(entry => entry.time);
    
    const allTimeSlots: Array<'morning' | 'afternoon' | 'night'> = ['morning', 'afternoon', 'night'];
    const availableSlots = allTimeSlots.filter(time => !usedTimeSlots.includes(time));
    
    return availableSlots;
  };

  return (
    <div className="diet-page">
             {loading && (
         <div style={{ textAlign: 'center', padding: '10px', color: '#e67e22', fontWeight: 'bold' }}>
           Loading ingredients from database...
         </div>
       )}
       {error && (
         <div style={{ textAlign: 'center', padding: '10px', color: '#e53e3e' }}>
           Error loading ingredients: {error}
         </div>
       )}

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
              <button 
                className={`tab-button ${activeTab === 'custom-ingredients' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom-ingredients')}
              >
                Custom Ingredients
              </button>
                             <button 
                 className={`tab-button ${activeTab === 'hidden-ingredients' ? 'active' : ''}`}
                 onClick={() => setActiveTab('hidden-ingredients')}
               >
                 Hidden Ingredients
               </button>
               <button 
                 className={`tab-button ${activeTab === 'weight' ? 'active' : ''}`}
                 onClick={() => setActiveTab('weight')}
               >
                 Weight
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
                     const isUserIngredient = ingredient.id.startsWith('user_');
                     
                     return (
                       <div key={ingredient.id} className="ingredient-card">
                         <button
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
                             <span>{Number(ingredient.calories || 0).toFixed(0)} cal</span>
                             <span>P: {Number(ingredient.protein || 0).toFixed(1)}g</span>
                             <span>F: {Number(ingredient.fat || 0).toFixed(1)}g</span>
                             <span>C: {Number(ingredient.carbs || 0).toFixed(1)}g</span>
                             <span>S: {Number(ingredient.sugar || 0).toFixed(1)}g</span>
                             <span>Fi: {Number(ingredient.fiber || 0).toFixed(1)}g</span>
                           </div>
                         </button>
                         
                         {/* Hide button for all ingredients (both preset and custom) */}
                         <button
                           className="ingredient-delete-button"
                           onClick={(e) => {
                             e.stopPropagation();
                             if (isUserIngredient) {
                               // For custom ingredients, remove the user_ prefix to get the actual ID
                               const actualId = ingredient.id.replace('user_', '');
                               toggleCustomIngredientVisibility(actualId);
                             } else {
                               toggleIngredientVisibility(ingredient.id);
                             }
                           }}
                           title="Hide ingredient"
                         >
                           ×
                         </button>
                       </div>
                     );
                                      })}
                 </div>
                 
                 
               </>
             )}
           
                       {activeTab === 'meals' && (
              <div className="meals-grid">
                {/* Saved Meals */}
               {savedMeals.map(meal => {
                 // Add safety check to ensure meal has required properties
                 if (!meal || !meal.ingredients || !meal.nutrition) {
                   return null; // Skip invalid meals
                 }
                 
                 return (
                   <div key={meal.id} className="saved-meal-card" onClick={() => addSavedMeal(meal)}>
                     <div className="meal-header">
                       <h3>{meal.name}</h3>
                       <button 
                         className="delete-meal-button"
                         onClick={(e) => {
                           e.stopPropagation();
                           removeSavedMeal(meal.id);
                         }}
                       >
                         ×
                       </button>
                     </div>
                     <div className="meal-ingredients">
                       <h4>Ingredients:</h4>
                       <ul>
                         {meal.ingredients.map((item, index) => {
                           const totalQuantity = (item.quantity * (item.servingSizeMultiplier || 1));
                           const servingUnit = item.ingredient.servingSizeUnit || '';
                           return (
                             <li key={index}>
                               {item.ingredient.name} - {totalQuantity} {servingUnit}
                             </li>
                           );
                         })}
                       </ul>
                     </div>
                                           <div className="meal-nutrition">
                        <div className="nutrition-grid">
                          <span>Calories: {meal.nutrition.calories.toFixed(0)}</span>
                          <span>Protein: {meal.nutrition.protein.toFixed(1)}g</span>
                          <span>Fat: {meal.nutrition.fat.toFixed(1)}g</span>
                          <span>Carbs: {meal.nutrition.carbs.toFixed(1)}g</span>
                          <span>Sugar: {meal.nutrition.sugar.toFixed(1)}g</span>
                          <span>Fiber: {meal.nutrition.fiber.toFixed(1)}g</span>
                        </div>
                      </div>
                   </div>
                 );
               })}
              </div>
            )}

            {activeTab === 'custom-ingredients' && (
              <div className="custom-ingredients-section">
                <div className="custom-ingredients-header">
                  <h3>Custom Ingredients</h3>
                  <button 
                    className="add-custom-ingredient-button"
                    onClick={() => setShowCustomIngredientForm(true)}
                  >
                    + Add Custom Ingredient
                  </button>
                </div>

                {showCustomIngredientForm && (
                  <div className="custom-ingredient-form">
                    <h4>{editingIngredient ? 'Edit' : 'Add'} Custom Ingredient</h4>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveCustomIngredient(customIngredientForm);
                    }}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Name:</label>
                          <input
                            type="text"
                            value={customIngredientForm.name}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Category:</label>
                          <select
                            value={customIngredientForm.category}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, category: e.target.value as any }))}
                            required
                          >
                            <option value="protein">Protein</option>
                            <option value="vegetables">Vegetables</option>
                            <option value="fats">Fats</option>
                            <option value="nuts-seeds">Nuts/Seeds</option>
                            <option value="seasonings">Seasonings</option>
                            <option value="beverages">Beverages</option>
                            <option value="fruits">Fruits</option>
                            <option value="dairy">Dairy</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Calories:</label>
                          <input
                            type="number"
                            value={customIngredientForm.calories}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, calories: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Protein (g):</label>
                          <input
                            type="number"
                            value={customIngredientForm.protein}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, protein: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Fat (g):</label>
                          <input
                            type="number"
                            value={customIngredientForm.fat}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, fat: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Carbs (g):</label>
                          <input
                            type="number"
                            value={customIngredientForm.carbs}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Sugar (g):</label>
                          <input
                            type="number"
                            value={customIngredientForm.sugar}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, sugar: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Fiber (g):</label>
                          <input
                            type="number"
                            value={customIngredientForm.fiber}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, fiber: Number(e.target.value) }))}
                            required
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Serving Size:</label>
                          <input
                            type="text"
                            value={customIngredientForm.servingSize}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, servingSize: e.target.value }))}
                            required
                            placeholder="e.g., 1 cup, 100g"
                          />
                        </div>
                        <div className="form-group">
                          <label>Serving Value:</label>
                          <input
                            type="number"
                            value={customIngredientForm.servingSizeValue}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, servingSizeValue: Number(e.target.value) }))}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="form-group">
                          <label>Unit:</label>
                          <input
                            type="text"
                            value={customIngredientForm.servingSizeUnit}
                            onChange={(e) => setCustomIngredientForm(prev => ({ ...prev, servingSizeUnit: e.target.value }))}
                            placeholder="e.g., cup, g, oz"
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button 
                          type="submit" 
                          className="save-ingredient-button"
                          disabled={isSavingIngredient}
                        >
                          {isSavingIngredient ? 'Saving...' : (editingIngredient ? 'Update' : 'Save')}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-button"
                          onClick={resetCustomIngredientForm}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="user-ingredients-grid">
                  {userIngredients.map(ingredient => (
                    <div key={ingredient.id} className="user-ingredient-card">
                      <div className="ingredient-header">
                        <h4>{ingredient.name}</h4>
                        <div className="ingredient-actions">
                          <button 
                            className="edit-ingredient-button"
                            onClick={() => editCustomIngredient(ingredient)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-ingredient-button"
                            onClick={() => deleteCustomIngredient(ingredient.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="ingredient-category">
                        <span className={`category-badge ${ingredient.category}`}>
                          {ingredient.category === 'nuts-seeds' ? 'Nuts/Seeds' : 
                           ingredient.category === 'protein' ? 'Meat' : 
                           ingredient.category === 'vegetables' ? 'Vegetable' :
                           ingredient.category === 'seasonings' ? 'Seasoning' :
                           ingredient.category === 'beverages' ? 'Beverage' :
                           ingredient.category === 'fruits' ? 'Fruit' :
                           ingredient.category === 'dairy' ? 'Dairy' :
                           ingredient.category === 'fats' ? 'Fat' :
                           ingredient.category}
                        </span>
                      </div>
                      <div className="ingredient-serving">
                        {ingredient.serving_size}
                        {ingredient.serving_size_value && ingredient.serving_size_unit && (
                          <span> ({ingredient.serving_size_value} {ingredient.serving_size_unit})</span>
                        )}
                      </div>
                      <div className="ingredient-nutrition">
                        <span>{Number(ingredient.calories || 0).toFixed(0)} cal</span>
                        <span>P: {Number(ingredient.protein || 0).toFixed(1)}g</span>
                        <span>F: {Number(ingredient.fat || 0).toFixed(1)}g</span>
                        <span>C: {Number(ingredient.carbs || 0).toFixed(1)}g</span>
                        <span>S: {Number(ingredient.sugar || 0).toFixed(1)}g</span>
                        <span>Fi: {Number(ingredient.fiber || 0).toFixed(1)}g</span>
                      </div>
                    </div>
                  ))}
                </div>

                {userIngredients.length === 0 && !showCustomIngredientForm && (
                  <div className="no-custom-ingredients">
                    <p>No custom ingredients yet. Create your first one!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hidden-ingredients' && (
              <div className="hidden-ingredients-section">
                <div className="hidden-ingredients-header">
                  <p>These ingredients are hidden from your main list. Click the ↻ button to restore them.</p>
                </div>
                
                {hiddenIngredients.length > 0 ? (
                  <div className="ingredients-grid hidden-ingredients-grid">
                    {hiddenIngredients.map(ingredient => (
                      <div key={ingredient.id} className="ingredient-card hidden-ingredient">
                        <button
                          className="ingredient-button"
                          onClick={() => addIngredient(ingredient)}
                          style={{ borderLeftColor: getCategoryColor(ingredient.category) }}
                        >
                                                  <div className="ingredient-name">
                          {ingredient.name}
                          {ingredient.isCustom && <span className="custom-indicator"> (Custom)</span>}
                        </div>
                        <div className="ingredient-serving">
                          <span>(1 serving)</span>
                        </div>
                          <div className="ingredient-nutrition">
                            <span>{Number(ingredient.calories || 0).toFixed(0)} cal</span>
                            <span>P: {Number(ingredient.protein || 0).toFixed(1)}g</span>
                            <span>F: {Number(ingredient.fat || 0).toFixed(1)}g</span>
                            <span>C: {Number(ingredient.carbs || 0).toFixed(1)}g</span>
                            <span>S: {Number(ingredient.sugar || 0).toFixed(1)}g</span>
                            <span>Fi: {Number(ingredient.fiber || 0).toFixed(1)}g</span>
                          </div>
                        </button>
                        
                        {/* Restore button for hidden ingredients */}
                        <button
                          className="ingredient-restore-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ingredient.isCustom) {
                              // For custom ingredients, remove the user_ prefix to get the actual ID
                              const actualId = ingredient.id.replace('user_', '');
                              toggleCustomIngredientVisibility(actualId);
                            } else {
                              toggleIngredientVisibility(ingredient.id);
                            }
                          }}
                          title="Restore ingredient"
                        >
                          ↻
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-hidden-ingredients">
                    <p>No hidden ingredients. Hidden ingredients will appear here when you hide them from the main ingredients list.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'weight' && (
              <div className="weight-section">
                <div className="weight-header">
                  <h3>Weight Tracking</h3>
                  <button 
                    className="add-weight-button"
                    onClick={() => setShowWeightForm(true)}
                  >
                    + Add Weight Entry
                  </button>
                </div>

                {showWeightForm && (
                  <div className="weight-form">
                    <h4>{editingWeight ? 'Edit Weight Entry' : 'Add Weight Entry'}</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="weight">Weight (lbs):</label>
                        <input
                          type="number"
                          id="weight"
                          value={weightForm.weight}
                          onChange={(e) => setWeightForm({...weightForm, weight: parseFloat(e.target.value) || 0})}
                          step="0.1"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="time">Time:</label>
                        <select
                          id="time"
                          value={weightForm.time}
                          onChange={(e) => setWeightForm({...weightForm, time: e.target.value as 'morning' | 'afternoon' | 'night'})}
                        >
                          {editingWeight ? (
                            // When editing, show the current time slot
                            <option value={editingWeight.time}>{editingWeight.time.charAt(0).toUpperCase() + editingWeight.time.slice(1)}</option>
                          ) : (
                            // When adding new, show only available time slots
                            getAvailableTimeSlots().map(time => (
                              <option key={time} value={time}>
                                {time.charAt(0).toUpperCase() + time.slice(1)}
                              </option>
                            ))
                          )}
                        </select>
                        {!editingWeight && getAvailableTimeSlots().length === 0 && (
                          <div className="no-slots-available" style={{ color: '#e67e22', fontSize: '0.9em', marginTop: '5px' }}>
                            All time slots filled for today
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        className="save-weight-button"
                        onClick={() => saveWeightEntry(weightForm)}
                        disabled={isSavingWeight || weightForm.weight <= 0}
                      >
                        {isSavingWeight ? 'Saving...' : (editingWeight ? 'Update' : 'Save')}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={resetWeightForm}
                        disabled={isSavingWeight}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {(() => {
                  const today = getTodayDate();
                  const todaysWeights = weightEntries.filter(entry => entry.date === today);
                  
                  if (todaysWeights.length > 0) {
                    return (
                      <div className="weight-entries-list">
                        {todaysWeights.map((entry) => (
                          <div key={entry.id} className="weight-entry-card">
                            <div className="weight-entry-header">
                              <div className="weight-value">
                                <span className="weight-number">{entry.weight}</span>
                                <span className="weight-unit"> lbs</span>
                              </div>
                              <div className="weight-time">{entry.time}</div>
                            </div>
                            <div className="weight-date">{new Date(entry.date).toLocaleDateString()}</div>
                            <div className="weight-entry-actions">
                              <button
                                className="edit-weight-button"
                                onClick={() => editWeightEntry(entry)}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-weight-button"
                                onClick={() => deleteWeightEntry(entry.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div className="no-weights-today">
                        <p>No weight entries for today</p>
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                          Add your first weight entry of the day
                        </p>
                      </div>
                    );
                  }
                })()}
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
                      disabled={selectedIngredients.length === 0 || !mealName.trim() || getAvailableMealTypes().length === 0 || isSavingMeal}
                    >
                      {isSavingMeal ? 'Saving...' : 'Save Meal'}
                    </button>
                    
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
                     onChange={(e) => setSelectedMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
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
                 {selectedDailyMeals.map(meal => {
                   // Add safety check to ensure meal has required properties
                   if (!meal || !meal.ingredients || !meal.nutrition) {
                     return null; // Skip invalid meals
                   }
                   
                   return (
                     <div key={meal.id} className="saved-meal-card">
                       <div className="saved-meal-header">
                         <div className="meal-title">
                           <h3>{meal.name || 'Unnamed Meal'}</h3>
                           <span className="meal-type">{meal.mealType || 'Unknown'}</span>
                         </div>
                         <button 
                           onClick={() => removeFromDailyMeals(meal.id)}
                           className="delete-meal-button"
                         >
                           ×
                         </button>
                       </div>
                       <div className="saved-meal-ingredients">
                         {meal.ingredients.map(item => {
                           // Add safety check for ingredient
                           if (!item || !item.ingredient) {
                             return null;
                           }
                           return (
                             <span key={item.ingredient.id} className="saved-ingredient">
                               {item.ingredient.name || 'Unknown'} {formatServingSize(item.servingSizeMultiplier || 1, item.ingredient.servingSizeUnit || '')}
                             </span>
                           );
                         })}
                       </div>
                       <div className="saved-meal-nutrition">
                         <span className="nutrition-summary">
                           {meal.nutrition.calories?.toFixed(0) || '0'} cal • 
                           P: {meal.nutrition.protein?.toFixed(1) || '0'}g • 
                           F: {meal.nutrition.fat?.toFixed(1) || '0'}g • 
                           C: {meal.nutrition.netCarbs?.toFixed(1) || '0'}g
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default Diet; 