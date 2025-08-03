import React, { useState, useEffect } from 'react';
import './DailyMealsWidget.css';

interface DailyMeal {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Array<{
    ingredient: {
      id: string;
      name: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      sugar: number;
      fiber: number;
      category: string;
      servingSize: string;
    };
    quantity: number;
  }>;
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
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const mealsPerPage = 3;
  const maxPage = Math.max(0, dailyMeals.length - mealsPerPage);

  // Load meals from localStorage and check if we need to reset
  useEffect(() => {
    const loadMeals = () => {
      try {
        const savedMeals = localStorage.getItem('diet-daily-meals');
        
        if (savedMeals && savedMeals !== 'null' && savedMeals !== 'undefined') {
          const parsedMeals = JSON.parse(savedMeals);
          
          if (Array.isArray(parsedMeals) && parsedMeals.length > 0) {
            // Filter out meals from previous days
            const today = new Date().toDateString();
            const todayMeals = parsedMeals.filter((meal: any) => {
              // Handle meals that might not have createdAt field (backward compatibility)
              if (!meal.createdAt) {
                return false;
              }
              const isToday = meal.createdAt === today;
              return isToday;
            });
            
            setDailyMeals(todayMeals);
            
            // If we filtered out old meals, save the updated list
            if (todayMeals.length !== parsedMeals.length) {
              localStorage.setItem('diet-daily-meals', JSON.stringify(todayMeals));
            }
          } else {
            setDailyMeals([]);
          }
        } else {
          setDailyMeals([]);
        }
        
      } catch (error) {
        console.warn('❌ DailyMealsWidget: Failed to load daily meals from localStorage:', error);
        setDailyMeals([]);
      }
    };

    loadMeals();
  }, []);

  // Listen for changes to daily meals from the Diet component
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedMeals = localStorage.getItem('diet-daily-meals');
        if (savedMeals && savedMeals !== 'null' && savedMeals !== 'undefined') {
          const parsedMeals = JSON.parse(savedMeals);
          if (Array.isArray(parsedMeals)) {
            setDailyMeals(parsedMeals);
          }
        }
      } catch (error) {
        console.warn('❌ DailyMealsWidget: Failed to load daily meals from localStorage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the Diet component
    window.addEventListener('dailyMealsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dailyMealsUpdated', handleStorageChange);
    };
  }, []);

  const getTotalNutrition = () => {
    const dailyTotals = dailyMeals.reduce((total, meal) => ({
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
  const sortedMeals = [...dailyMeals].sort((a, b) => 
    mealTypeOrder[a.mealType] - mealTypeOrder[b.mealType]
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
  }, [dailyMeals.length]);

  if (dailyMeals.length === 0) {
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
        <span className="meal-count">{dailyMeals.length} meal{dailyMeals.length !== 1 ? 's' : ''}</span>
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