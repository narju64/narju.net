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

  // Helper function to get today's date in MM-DD-YYYY format
  const getTodayDate = (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}-${day}-${year}`;
  };
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const mealsPerPage = 3;
  const maxPage = Math.max(0, parsedMeals.length - mealsPerPage);

  // Load meals from API for today's date
  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    const loadTodaysMeals = async () => {
      setLoading(true);
      try {
        // Get today's date in MM-DD-YYYY format (matching backend)
        // Use local timezone to avoid UTC conversion issues
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const today = `${month}-${day}-${year}`;
        
        console.log('🔍 DailyMealsWidget calculating today:', { 
          now: now.toLocaleString(), 
          month, 
          day, 
          year, 
          today 
        });

        const response = await fetch(buildApiUrl(`/api/diet/meals/${today}`), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 DailyMealsWidget API response:', data);
          
          if (data.meals && data.meals.length > 0) {
            setDailyMeals(data.meals);
          } else {
            // If no meals for today, try to get the most recent meals
            console.log('🔍 No meals for today, trying to get recent meals...');
            const recentResponse = await fetch(buildApiUrl('/api/diet/meals/history?limit=10'), {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (recentResponse.ok) {
              const recentData = await recentResponse.json();
              console.log('🔍 Recent meals response:', recentData);
              setDailyMeals(recentData || []);
            } else {
              setDailyMeals([]);
            }
          }
        } else {
          console.error('Failed to load today\'s meals');
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
    const parseMeals = () => {
      console.log('🔍 DailyMealsWidget parsing meals:', dailyMeals);
      const parsed = dailyMeals.map(meal => {
        try {
          // Handle both string and object nutrition data
          let nutrition;
          if (typeof meal.nutrition_json === 'string') {
            nutrition = JSON.parse(meal.nutrition_json);
          } else {
            nutrition = meal.nutrition_json;
          }
          
          console.log('🔍 Parsed nutrition for meal:', meal.name, nutrition);
          return {
            id: meal.id,
            name: meal.name,
            mealType: meal.meal_type,
            nutrition: {
              calories: nutrition.calories || 0,
              protein: nutrition.protein || 0,
              fat: nutrition.fat || 0,
              carbs: nutrition.carbs || 0,
              sugar: nutrition.sugar || 0,
              fiber: nutrition.fiber || 0,
              netCarbs: Math.max(0, (nutrition.carbs || 0) - (nutrition.fiber || 0)),
              proteinPercent: nutrition.proteinPercent || 0,
              fatPercent: nutrition.fatPercent || 0,
              carbPercent: nutrition.carbPercent || 0
            },
            createdAt: meal.created_at
          };
        } catch (error) {
          console.error('Error parsing meal nutrition:', error);
          return null;
        }
      }).filter(Boolean) as ParsedDailyMeal[];
      
      console.log('🔍 Final parsed meals:', parsed);
      setParsedMeals(parsed);
    };

    parseMeals();
  }, [dailyMeals]);

  const getTotalNutrition = () => {
    const dailyTotals = parsedMeals.reduce((total, meal) => ({
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

  const totalNutrition = getTotalNutrition();

  const getMealTypeColor = (mealType: string) => {
    const colors: { [key: string]: string } = {
      'breakfast': 'rgba(251, 191, 36, 0.3)', // Yellow - subtle
      'lunch': 'rgba(16, 185, 129, 0.3)',     // Green - subtle
      'dinner': 'rgba(239, 68, 68, 0.3)',     // Red - subtle
      'snack': 'rgba(139, 92, 246, 0.3)'      // Purple - subtle
    };
    return colors[mealType] || 'rgba(149, 165, 166, 0.3)';
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

  // Sort meals by meal type order: breakfast, lunch, dinner, snack
  const mealTypeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  const sortedMeals = [...parsedMeals].sort((a, b) => 
    mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] - mealTypeOrder[b.mealType as keyof typeof mealTypeOrder]
  );

  // Carousel navigation functions

  
  // Always show all meals in a 4-column grid, container acts as a window
  const allMeals = sortedMeals;

  const goToPreviousPage = () => {
    if (isAnimating || currentPage === 0) return;
    setIsAnimating(true);
    setSlideOffset(prev => prev + 200); // Slide right (opposite of left click)
    setTimeout(() => {
      setCurrentPage(prev => Math.max(0, prev - 1));
      setIsAnimating(false);
    }, 300);
  };

  const goToNextPage = () => {
    if (isAnimating || currentPage === maxPage) return;
    setIsAnimating(true);
    setSlideOffset(prev => prev - 200); // Slide left (opposite of right click)
    setTimeout(() => {
      setCurrentPage(prev => Math.min(maxPage, prev + 1));
      setIsAnimating(false);
    }, 300);
  };

  // Reset to first page when meals change
  useEffect(() => {
    setCurrentPage(0);
  }, [parsedMeals.length]);

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

  // Check if we're showing today's meals or recent meals
  const isShowingRecentMeals = dailyMeals.length > 0 && dailyMeals[0]?.date !== getTodayDate();
  const widgetTitle = isShowingRecentMeals ? 'Recent Meals' : 'Today\'s Meals';

  return (
    <div className="daily-meals-widget">
      <div className="widget-header">
        <h2>{widgetTitle}</h2>
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

      <div className="meals-carousel">
                {sortedMeals.length > mealsPerPage && (
          <button 
            className="carousel-nav-btn carousel-prev"
            onClick={goToPreviousPage}
            disabled={currentPage === 0 || isAnimating}
          >
            ‹
          </button>
        )}
        
                                <div className="meals-container">
                                  <div 
                                    className={`meals-list ${isAnimating ? 'carousel-animating' : ''}`} 
                                    style={{ 
                                      transform: `translateX(${slideOffset}px)`,
                                      gridTemplateColumns: `repeat(${sortedMeals.length}, 1fr)`,
                                      width: `${(sortedMeals.length / 3) * 100}%`
                                    }}
                                  >
            {allMeals.map(meal => (
            <div key={meal.id} className="meal-item">
              <div className="meal-header">
                <span 
                  className="meal-type"
                  style={{ backgroundColor: getMealTypeColor(meal.mealType) }}
                >
                  {meal.mealType}
                </span>
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
        </div>

        {sortedMeals.length > mealsPerPage && (
          <button 
            className="carousel-nav-btn carousel-next"
            onClick={goToNextPage}
            disabled={currentPage === maxPage || isAnimating}
          >
            ›
          </button>
        )}
      </div>

      <div className="widget-footer">
        <a href="/lifestyle/diet" className="manage-meals-link">Manage Meals</a>
      </div>
    </div>
  );
};

export default DailyMealsWidget; 