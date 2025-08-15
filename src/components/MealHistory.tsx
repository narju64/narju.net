import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
// Inline styles for simplicity

interface MealHistoryEntry {
  id: string;
  name: string;
  meal_type: string;
  ingredients_json: string;
  nutrition_json: string;
  date: string;
  created_at: string;
}

type ViewType = 'daily' | 'weekly' | 'monthly' | 'graph' | 'goals';

const MealHistory: React.FC = () => {
  const { isLoggedIn, authToken } = useAuth();
  const [mealHistory, setMealHistory] = useState<MealHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('weekly');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Initialize with current week's Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    console.log('Initial week start:', monday.toDateString());
    return monday;
  });
  const [weeklyData, setWeeklyData] = useState<{[key: string]: MealHistoryEntry[]}>({});
  const [weeklyWeightData, setWeeklyWeightData] = useState<{[key: string]: any[]}>({});
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // Get today's date in MM-DD-YYYY format
  const getTodayDate = (): string => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Load meal history
  const loadMealHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading meal history...');
      const response = await fetch(buildApiUrl('/api/diet/meals/history?limit=100'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Meal history data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        // Handle different response formats
        let meals = [];
        if (Array.isArray(data)) {
          meals = data;
        } else if (data && Array.isArray(data.meals)) {
          meals = data.meals;
        } else if (data && typeof data === 'object') {
          console.log('Data keys:', Object.keys(data));
          meals = [];
        }
        
        console.log('Processed meals:', meals);
        setMealHistory(meals);
      } else {
        console.error('Failed to load meal history:', response.status, response.statusText);
        setError('Failed to load meal history');
      }
    } catch (error) {
      console.error('Error loading meal history:', error);
      setError('Error loading meal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    const today = getTodayDate();
    setSelectedDate(today);
    loadMealHistory();
  }, [isLoggedIn, authToken]);

  // Load weekly data when weekly tab is selected
  useEffect(() => {
    if (activeView === 'weekly' && isLoggedIn && authToken) {
      fetchWeeklyData(currentWeekStart);
    }
  }, [activeView, currentWeekStart, isLoggedIn, authToken]);

  // Load meals when selectedDate changes
  useEffect(() => {
    if (selectedDate && isLoggedIn && authToken) {
      if (selectedDate === getTodayDate()) {
        loadMealHistory();
      } else {
        loadMealsForDate(selectedDate);
      }
    }
  }, [selectedDate, isLoggedIn, authToken]);



  // Load meals for specific date
  const loadMealsForDate = async (date: string) => {
    if (!isLoggedIn || !authToken) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading meals for date:', date);
      const response = await fetch(buildApiUrl(`/api/diet/meals/${date}`), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Date-specific meal data:', data);
        
        // Handle different response formats
        let meals = [];
        if (Array.isArray(data)) {
          meals = data;
        } else if (data && Array.isArray(data.meals)) {
          meals = data.meals;
        } else if (data && typeof data === 'object') {
          console.log('Date data keys:', Object.keys(data));
          meals = [];
        }
        
        console.log('Processed date meals:', meals);
        setMealHistory(meals);
      } else {
        console.error('Failed to load meals for date:', response.status, response.statusText);
        setError('Failed to load meals for selected date');
      }
    } catch (error) {
      console.error('Error loading meals for date:', error);
      setError('Error loading meals for selected date');
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date === getTodayDate()) {
      // Load all history for today
      loadMealHistory();
    } else {
      // Date is already in MM-DD-YYYY format, use directly
      loadMealsForDate(date);
    }
  };

  // Parse nutrition data safely
  const parseNutrition = (nutritionJson: string) => {
    try {
      if (typeof nutritionJson === 'string') {
        return JSON.parse(nutritionJson);
      }
      return nutritionJson;
    } catch (error) {
      console.error('Error parsing nutrition:', error);
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        netCarbs: 0
      };
    }
  };

  // Calculate daily totals
  const getDailyTotals = (meals: MealHistoryEntry[] | any) => {
    // Ensure meals is an array
    if (!Array.isArray(meals)) {
      console.warn('getDailyTotals: meals is not an array:', meals);
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        netCarbs: 0
      };
    }
    
    return meals.reduce((totals, meal) => {
      const nutrition = parseNutrition(meal.nutrition_json);
      
      // Calculate net carbs if not provided
      const netCarbs = nutrition.netCarbs !== undefined ? nutrition.netCarbs : (nutrition.carbs || 0) - (nutrition.fiber || 0);
      
      return {
        calories: totals.calories + (nutrition.calories || 0),
        protein: totals.protein + (nutrition.protein || 0),
        fat: totals.fat + (nutrition.fat || 0),
        carbs: totals.carbs + (nutrition.carbs || 0),
        sugar: totals.sugar + (nutrition.sugar || 0),
        fiber: totals.fiber + (nutrition.fiber || 0),
        netCarbs: totals.netCarbs + netCarbs
      };
    }, {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      netCarbs: 0
    });
  };

  // Convert Date to MM-DD-YYYY format (for API calls)
  const formatDateForAPI = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Convert MM-DD-YYYY to YYYY-MM-DD format (for HTML date picker)
  const convertToPickerFormat = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '';
    const [month, day, year] = dateStr.split('-');
    if (!month || !day || !year) return '';
    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD to MM-DD-YYYY format (from HTML date picker)
  const convertFromPickerFormat = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${month}-${day}-${year}`;
  };







  // Fetch weekly meal data
  const fetchWeeklyData = useCallback(async (weekStart: Date) => {
    setWeeklyLoading(true);
    setError(null);
    
    try {
      const weekData: {[key: string]: MealHistoryEntry[]} = {};
      const weekWeightData: {[key: string]: any[]} = {};
      
      // Fetch data for each day of the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = formatDateForAPI(date);
        
        // Fetch meals
        const mealResponse = await fetch(buildApiUrl(`/api/diet/meals/${dateStr}`), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (mealResponse.ok) {
          const mealData = await mealResponse.json();
          // Handle both array and object formats
          if (Array.isArray(mealData)) {
            weekData[dateStr] = mealData;
          } else if (mealData && Array.isArray(mealData.meals)) {
            weekData[dateStr] = mealData.meals;
          } else {
            weekData[dateStr] = [];
          }
        } else {
          weekData[dateStr] = [];
        }

        // Fetch weight data using the history endpoint with date filtering
        const weightResponse = await fetch(buildApiUrl(`/api/diet/weight/history?start_date=${dateStr}&end_date=${dateStr}`), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (weightResponse.ok) {
          const weightData = await weightResponse.json();
          weekWeightData[dateStr] = Array.isArray(weightData) ? weightData : [];
        } else {
          weekWeightData[dateStr] = [];
        }
      }
      
      setWeeklyData(weekData);
      setWeeklyWeightData(weekWeightData);
    } catch (err) {
      setError('Failed to load weekly data');
    } finally {
      setWeeklyLoading(false);
    }
  }, [authToken]);

  // Tab navigation component
  const ViewSelector = () => (
          <div style={{ 
      display: 'flex',
            background: '#1a1a1a', 
      borderRadius: '8px',
      padding: '0.25rem',
      border: '1px solid #333',
      marginBottom: '2rem'
    }}>
      {(['daily', 'weekly', 'monthly', 'graph', 'goals'] as ViewType[]).map((view) => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: activeView === view ? '#ff7300' : 'transparent',
            color: activeView === view ? '#ffffff' : '#bdc3c7',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            textTransform: 'capitalize',
            transition: 'all 0.2s ease'
          }}
        >
          {view}
        </button>
      ))}
            </div>
  );

  // Daily View Component (existing functionality)
  const DailyView = () => (
    <div>
            {/* Date Selector */}
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
              <label htmlFor="date-selector" style={{ display: 'block', marginBottom: '0.5rem', color: '#bdc3c7' }}>
                Select Date:
              </label>
              <input
                type="date"
                id="date-selector"
                value={convertToPickerFormat(selectedDate)}
                onChange={(e) => handleDateChange(convertFromPickerFormat(e.target.value))}
                style={{
                  padding: '0.5rem',
                  background: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#95a5a6' }}>
                {selectedDate === getTodayDate() ? 'Showing all meal history' : `Showing meals for ${selectedDate}`}
              </p>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#e67e22', fontWeight: 'bold' }}>
                Loading meal history...
              </div>
            )}

            {error && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#e53e3e' }}>
                {error}
              </div>
            )}

            {/* Daily Totals */}
            {mealHistory.length > 0 && (
              <div style={{ 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                marginBottom: '2rem' 
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1.2rem' }}>Daily Totals</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '1rem' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calories</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).calories.toFixed(0)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Protein</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).protein.toFixed(1)}g</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fat</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).fat.toFixed(1)}g</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Carbs</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).carbs.toFixed(1)}g</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sugar</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).sugar.toFixed(1)}g</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: '#2a2a2a', 
                    borderRadius: '6px', 
                    border: '1px solid #444' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fiber</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{getDailyTotals(mealHistory).fiber.toFixed(1)}g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Meal List */}
            {mealHistory.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1rem' 
              }}>
                {mealHistory.map(meal => {
                  const nutrition = parseNutrition(meal.nutrition_json);
                  
                  return (
                    <div key={meal.id} style={{ 
                      background: '#0a0a0a', 
                      border: '1px solid #294cad', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      transition: 'all 0.2s ease' 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '0.75rem' 
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', margin: '0' }}>{meal.name || 'Unnamed Meal'}</h3>
                          <span style={{ fontSize: '0.75rem', color: '#ff7300', fontWeight: '500', textTransform: 'capitalize' }}>{meal.meal_type || 'Unknown'}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                          {new Date(meal.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(41, 76, 173, 0.3)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#ff7300', fontWeight: '500' }}>
                          {nutrition.calories?.toFixed(0) || '0'} cal • 
                          P: {nutrition.protein?.toFixed(1) || '0'}g • 
                          F: {nutrition.fat?.toFixed(1) || '0'}g • 
                          C: {nutrition.netCarbs?.toFixed(1) || '0'}g
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem', 
                color: '#bdc3c7', 
                background: '#1a1a1a', 
                borderRadius: '8px', 
                border: '1px solid #333' 
              }}>
                <p style={{ margin: '0', fontSize: '1rem' }}>No meals found for the selected date.</p>
                <p style={{ fontSize: '0.9rem', color: '#95a5a6', marginTop: '0.5rem' }}>
                  {selectedDate === getTodayDate() ? 'Start tracking your meals to see them here!' : 'Try selecting a different date or add meals for this day.'}
                </p>
              </div>
            )}
          </div>
  );

  // Weekly View Component
  const WeeklyView = () => {
    // Get week dates based on currentWeekStart
    const getWeekDates = () => {
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        weekDates.push(date);
      }
      return weekDates;
    };

    const weekDates = getWeekDates();
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Navigation functions
    const goToPreviousWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
    };

    return (
      <div>
        {/* Week Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          padding: '1rem',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0', color: '#ffffff', fontSize: '1.2rem' }}>
            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </h3>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
             <button 
               onClick={goToPreviousWeek}
               style={{
                 padding: '0.5rem 1rem',
                 background: '#2a2a2a',
                 border: '1px solid #444',
                 borderRadius: '4px',
                 color: '#ffffff',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease'
               }}
               onMouseOver={(e) => e.currentTarget.style.background = '#3a3a3a'}
               onMouseOut={(e) => e.currentTarget.style.background = '#2a2a2a'}
             >
               ← Previous Week
             </button>
             <button 
               onClick={goToNextWeek}
               style={{
                 padding: '0.5rem 1rem',
                 background: '#2a2a2a',
                 border: '1px solid #444',
                 borderRadius: '4px',
                 color: '#ffffff',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease'
               }}
               onMouseOver={(e) => e.currentTarget.style.background = '#3a3a3a'}
               onMouseOut={(e) => e.currentTarget.style.background = '#2a2a2a'}
             >
               Next Week →
             </button>
           </div>
                 </div>



         {/* 7-Day Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {weekDates.map((date, index) => (
            <div 
              key={index} 
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                minHeight: '120px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                const clickedDate = formatDateForAPI(date);
                setActiveView('daily');
                setSelectedDate(clickedDate);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3498db';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(52, 152, 219, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#bdc3c7', marginBottom: '0.25rem' }}>
                  {dayNames[index]} - {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>
              
                             {/* Nutrition data display */}
               {(() => {
                 const dateStr = formatDateForAPI(date);
                 const dayMeals = weeklyData[dateStr] || [];
                 const dayTotals = getDailyTotals(dayMeals);
                 
                 if (weeklyLoading) {
                   return (
                     <div style={{ 
                       background: '#2a2a2a', 
                       borderRadius: '4px', 
                       padding: '0.5rem',
                       fontSize: '0.8rem',
                       color: '#95a5a6'
                     }}>
                       Loading...
                     </div>
                   );
                 }
                 
                 // Always show weight if available, regardless of meals
                 const dayWeights = weeklyWeightData[dateStr] || [];
                 const hasWeight = dayWeights.length > 0;
                 
                 if (dayMeals.length === 0) {
                   return (
                     <div style={{ 
                       background: '#2a2a2a', 
                       borderRadius: '4px', 
                       padding: '0.5rem',
                       fontSize: '0.8rem',
                       color: '#95a5a6'
                     }}>
                       <div>No meals</div>
                       {hasWeight && (() => {
                         const avgWeight = dayWeights.reduce((sum, w) => {
                           const weight = parseFloat(w.weight) || 0;
                           return sum + weight;
                         }, 0) / dayWeights.length;
                         return (
                           <div style={{ color: '#ff7300', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                             Weight: {avgWeight.toFixed(1)}lbs
                           </div>
                         );
                       })()}
                     </div>
                   );
                 }
                 
                 return (
                    <div style={{ fontSize: '0.75rem', color: '#ffffff' }}>
                      <div style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
                        {dayTotals.calories.toFixed(0)} calories
                      </div>
                      <div style={{ color: '#bdc3c7', fontSize: '0.7rem' }}>
                        Protein: {dayTotals.protein.toFixed(0)}g
                      </div>
                      <div style={{ color: '#bdc3c7', fontSize: '0.7rem' }}>
                        Net Carbs: {dayTotals.netCarbs.toFixed(0)}g
                      </div>
                      <div style={{ color: '#bdc3c7', fontSize: '0.7rem' }}>
                        Fat: {dayTotals.fat.toFixed(0)}g
                      </div>
                      {hasWeight && (() => {
                        const avgWeight = dayWeights.reduce((sum, w) => {
                          const weight = parseFloat(w.weight) || 0;
                          return sum + weight;
                        }, 0) / dayWeights.length;
                        return (
                          <div style={{ color: '#ff7300', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                            Weight: {avgWeight.toFixed(1)}lbs
                          </div>
                        );
                      })()}
                    </div>
                  );
               })()}
            </div>
          ))}
        </div>

                 {/* Weekly Totals */}
         <div style={{ 
           background: '#1a1a1a', 
           border: '1px solid #333', 
           borderRadius: '8px', 
           padding: '1.5rem'
         }}>
                       <h4 style={{ margin: '0 0 1rem 0', color: '#ffffff', textAlign: 'center' }}>Weekly Averages</h4>
                       {weeklyLoading ? (
              <div style={{ textAlign: 'center', color: '#bdc3c7' }}>Loading weekly averages...</div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem' 
              }}>
                {(() => {
                  // Calculate weekly averages (only for days with data)
                  const daysWithData = Object.values(weeklyData).filter(meals => meals.length > 0).length;
                  
                  if (daysWithData === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>No meal data for this week</div>
                      </div>
                    );
                  }

                  const weeklyAverages = Object.values(weeklyData)
                    .filter(meals => meals.length > 0)
                    .reduce((totals, dayMeals) => {
                      const dayTotals = getDailyTotals(dayMeals);
                      return {
                        calories: totals.calories + dayTotals.calories,
                        protein: totals.protein + dayTotals.protein,
                        netCarbs: totals.netCarbs + dayTotals.netCarbs,
                        fat: totals.fat + dayTotals.fat
                      };
                    }, { calories: 0, protein: 0, netCarbs: 0, fat: 0 });

                  // Convert to averages
                  const averages = {
                    calories: weeklyAverages.calories / daysWithData,
                    protein: weeklyAverages.protein / daysWithData,
                    netCarbs: weeklyAverages.netCarbs / daysWithData,
                    fat: weeklyAverages.fat / daysWithData
                  };

                  // Calculate average weight (average of daily averages)
                  const dailyWeightAverages: number[] = [];
                  
                  // Calculate daily average for each day that has weight data
                  Object.entries(weeklyWeightData).forEach(([, dayWeights]) => {
                    if (dayWeights.length > 0) {
                      const dayAvg = dayWeights.reduce((sum, w) => {
                        const weight = parseFloat(w.weight) || 0;
                        return sum + weight;
                      }, 0) / dayWeights.length;
                      dailyWeightAverages.push(dayAvg);
                    }
                  });
                  
                  // Calculate weekly average as average of daily averages
                  const avgWeight = dailyWeightAverages.length > 0 
                    ? dailyWeightAverages.reduce((sum, dailyAvg) => sum + dailyAvg, 0) / dailyWeightAverages.length
                    : 0;
                  
                  return (
                    <>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Calories</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{averages.calories.toFixed(0)}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Protein</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{averages.protein.toFixed(0)}g</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Net Carbs</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{averages.netCarbs.toFixed(0)}g</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Fat</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{averages.fat.toFixed(0)}g</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Weight</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{avgWeight.toFixed(1)}lbs</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Days with Data</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{daysWithData}/7</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
         </div>
      </div>
    );
  };

  // Monthly View Component (placeholder for now)
  const MonthlyView = () => (
    <div style={{ 
      textAlign: 'center', 
      padding: '3rem 2rem', 
      color: '#bdc3c7', 
      background: '#1a1a1a', 
      borderRadius: '8px', 
      border: '1px solid #333' 
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1.2rem' }}>Monthly View</h3>
      <p style={{ margin: '0', fontSize: '1rem' }}>Monthly calendar view coming soon! This will show nutrition trends over the month.</p>
    </div>
  );

  // Graph View Component (placeholder for now)
  const GraphView = () => (
    <div style={{ 
      textAlign: 'center', 
      padding: '3rem 2rem', 
      color: '#bdc3c7', 
      background: '#1a1a1a', 
      borderRadius: '8px', 
      border: '1px solid #333' 
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1.2rem' }}>Graph View</h3>
      <p style={{ margin: '0', fontSize: '1rem' }}>Graph view coming soon! This will show nutrition trends with Recharts.</p>
    </div>
  );

  // Goals View Component (placeholder for now)
  const GoalsView = () => (
    <div style={{ 
      textAlign: 'center', 
      padding: '3rem 2rem', 
      color: '#bdc3c7', 
      background: '#1a1a1a', 
      borderRadius: '8px', 
      border: '1px solid #333' 
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1.2rem' }}>Goals</h3>
      <p style={{ margin: '0', fontSize: '1rem' }}>Goal setting and intelligent suggestions coming soon!</p>
    </div>
  );

  // Render the appropriate view based on active tab
  const renderActiveView = () => {
    switch (activeView) {
      case 'daily':
        return <DailyView />;
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'graph':
        return <GraphView />;
      case 'goals':
        return <GoalsView />;
      default:
        return <DailyView />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="diet-page">
        <div className="diet-container">
          <div className="diet-actions">
            <a href="/lifestyle/diet" className="view-history-button">
              ← Back to Diet
            </a>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#bdc3c7' }}>
            <p>Please <a href="/auth/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>log in</a> to view your meal history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1600px', 
      margin: '0 auto', 
      padding: '2rem', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      color: '#ffffff',
      backgroundColor: '#0a0a0a',
      minHeight: '100vh'
    }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <a href="/lifestyle/diet" style={{
            background: '#ff7300',
            color: 'white',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ← Back to Diet
          </a>
        </div>

            <div style={{ 
              background: '#1a1a1a', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
              border: '1px solid #294cad' 
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#ffffff' }}>Meal History</h2>
            
            {/* Tab Navigation */}
            <ViewSelector />
              </div>

          {/* Render Active View */}
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default MealHistory;
