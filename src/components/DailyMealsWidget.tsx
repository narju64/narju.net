import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './DailyMealsWidget.css';

interface DailyMeal {
  id: string;
  name: string;
  meal_type: string;
  ingredients_json: string;
  nutrition_json: string;
  date: string;
  created_at: string;
}

interface ParsedDailyMeal {
  id: string;
  name: string;
  mealType: string;
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
  createdAt: string;
}

const DailyMealsWidget: React.FC = () => {
  const { isLoggedIn, authToken } = useAuth();
  
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([]);
  const [parsedMeals, setParsedMeals] = useState<ParsedDailyMeal[]>([]);
  const [loading, setLoading] = useState(false);



  // Load meals from API for today's date
  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    const loadTodaysMeals = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const today = `${month}-${day}-${year}`;

        const response = await fetch(buildApiUrl(`/api/diet/meals/${today}`), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
            setDailyMeals(data.meals);
          } else {
            // If no meals for today, try to get the most recent meals
            const recentResponse = await fetch(buildApiUrl('/api/diet/meals/history?limit=10'), {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (recentResponse.ok) {
              const recentData = await recentResponse.json();
              setDailyMeals(recentData || []);
            } else {
              setDailyMeals([]);
            }
          }
        } else {
          setDailyMeals([]);
        }
      } catch (error) {
        console.error('Error loading today\'s meals:', error);
        setDailyMeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysMeals();
  }, [isLoggedIn, authToken]);

  // Parse meals when dailyMeals change
  useEffect(() => {
    try {
      if (!dailyMeals || dailyMeals.length === 0) {
        setParsedMeals([]);
        return;
      }

      const parsed = dailyMeals.map(meal => {
        try {
          // Safely parse nutrition data
          let nutrition = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            sugar: 0,
            fiber: 0,
            net_carbs: 0,
            protein_percent: 0,
            fat_percent: 0,
            carb_percent: 0
          };

          if (meal.nutrition_json) {
            try {
              if (typeof meal.nutrition_json === 'string') {
                const parsedNutrition = JSON.parse(meal.nutrition_json);
                if (parsedNutrition && typeof parsedNutrition === 'object') {
                  nutrition = { ...nutrition, ...parsedNutrition };
                }
              } else if (typeof meal.nutrition_json === 'object' && meal.nutrition_json !== null && !Array.isArray(meal.nutrition_json)) {
                const nutritionObj = meal.nutrition_json as Record<string, any>;
                nutrition = { ...nutrition, ...nutritionObj };
              }
            } catch (parseError) {
              console.warn('Could not parse nutrition JSON for meal:', meal.name);
            }
          }

          return {
            id: meal.id || 'unknown',
            name: meal.name || 'Unknown Meal',
            mealType: meal.meal_type || 'unknown',
            nutrition: {
              calories: nutrition.calories || 0,
              protein: nutrition.protein || 0,
              fat: nutrition.fat || 0,
              carbs: nutrition.carbs || 0,
              sugar: nutrition.sugar || 0,
              fiber: nutrition.fiber || 0,
              netCarbs: nutrition.net_carbs || Math.max(0, (nutrition.carbs || 0) - (nutrition.fiber || 0)),
              proteinPercent: nutrition.protein_percent || 0,
              fatPercent: nutrition.fat_percent || 0,
              carbPercent: nutrition.carb_percent || 0
            },
            createdAt: meal.created_at || new Date().toISOString()
          };
        } catch (error) {
          console.error('Error parsing individual meal:', meal, error);
          return null;
        }
      }).filter(Boolean) as ParsedDailyMeal[];
      
      setParsedMeals(parsed);
    } catch (error) {
      console.error('Error in meal parsing useEffect:', error);
      setParsedMeals([]);
    }
  }, [dailyMeals]);

  // Calculate total nutrition
  const getTotalNutrition = () => {
    try {
      const dailyTotals = parsedMeals.reduce((total, meal) => ({
        calories: total.calories + (meal.nutrition.calories || 0),
        protein: total.protein + (meal.nutrition.protein || 0),
        fat: total.fat + (meal.nutrition.fat || 0),
        carbs: total.carbs + (meal.nutrition.carbs || 0),
        sugar: total.sugar + (meal.nutrition.sugar || 0),
        fiber: total.fiber + (meal.nutrition.fiber || 0),
      }), { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0 });
      
      const netCarbs = Math.max(0, dailyTotals.carbs - dailyTotals.fiber);
      
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
    } catch (error) {
      console.error('Error calculating total nutrition:', error);
      return {
        calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, fiber: 0,
        netCarbs: 0, proteinPercent: 0, fatPercent: 0, carbPercent: 0
      };
    }
  };

  const totalNutrition = getTotalNutrition();

  if (!isLoggedIn) {
    return (
      <div className="daily-meals-widget">
        <div className="widget-header">
          <h2>Today's Meals</h2>
        </div>
        <div className="no-meals">
          <p>Please log in to view your meals</p>
          <a href="/auth/login" className="add-meal-link">Login</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="daily-meals-widget">
        <div className="widget-header">
          <h2>Today's Meals</h2>
        </div>
        <div className="no-meals">
          <p>Loading meals...</p>
        </div>
      </div>
    );
  }

  if (parsedMeals.length === 0) {
    return (
      <div className="daily-meals-widget">
        <div className="widget-header">
          <h2>Today's Meals</h2>
          <span className="meal-count">0 meals</span>
        </div>
        <div className="no-meals">
          <p>No meals planned for today</p>
          <a href="/lifestyle/diet" className="add-meal-link">Add a meal</a>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-meals-widget">
      <div className="widget-header">
        <h2>Today's Meals</h2>
        <div className="nutrition-summary-inline">
          <span className="nutrition-inline-item">
            <span className="nutrition-inline-label">Calories</span>
            <span className="nutrition-inline-value">{totalNutrition.calories.toFixed(0)}</span>
          </span>
          <span className="nutrition-inline-item">
            <span className="nutrition-inline-label">P</span>
            <span className="nutrition-inline-value">{totalNutrition.protein.toFixed(1)}g</span>
          </span>
          <span className="nutrition-inline-item">
            <span className="nutrition-inline-label">F</span>
            <span className="nutrition-inline-value">{totalNutrition.fat.toFixed(1)}g</span>
          </span>
          <span className="nutrition-inline-item">
            <span className="nutrition-inline-label">C</span>
            <span className="nutrition-inline-value">{totalNutrition.netCarbs.toFixed(1)}g</span>
          </span>
        </div>
        <span className="meal-count">{parsedMeals.length} meal{parsedMeals.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="meals-list">
        {parsedMeals.map(meal => (
          <div key={meal.id} className="meal-item">
            <div className="meal-header">
              <span className="meal-type">{meal.mealType}</span>
              <h3 className="meal-name">{meal.name}</h3>
            </div>
            <div className="meal-nutrition">
              <span>{meal.nutrition.calories.toFixed(0)} cal</span>
              <span>P: {meal.nutrition.protein.toFixed(1)}g</span>
              <span>F: {meal.nutrition.fat.toFixed(1)}g</span>
              <span>C: {meal.nutrition.netCarbs.toFixed(1)}g</span>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-footer">
        <a href="/lifestyle/diet" className="manage-meals-link">Manage Meals</a>
      </div>
    </div>
  );
};

export default DailyMealsWidget; 