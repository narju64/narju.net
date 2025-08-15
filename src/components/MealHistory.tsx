import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      console.log('selectedDate changed:', selectedDate);
      console.log('getTodayDate():', getTodayDate());
      console.log('Are they equal?', selectedDate === getTodayDate());
      
      // Always call loadMealsForDate for specific dates, including today
      console.log('Calling loadMealsForDate() with:', selectedDate);
      loadMealsForDate(selectedDate);
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

      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
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
        
        console.log('Final meals array:', meals);
        setMealHistory(meals);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
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
    console.log('handleDateChange called with:', date);
    console.log('getTodayDate():', getTodayDate());
    console.log('Are they equal?', date === getTodayDate());
    
    setSelectedDate(date);
    // Always call loadMealsForDate for specific dates, including today
    console.log('Calling loadMealsForDate() from handleDateChange with:', date);
    loadMealsForDate(date);
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
    console.log('convertFromPickerFormat input:', dateStr);
    const [year, month, day] = dateStr.split('-');
    const result = `${month}-${day}-${year}`;
    console.log('convertFromPickerFormat output:', result);
    return result;
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

  // Monthly View Component
  const MonthlyView = () => {
    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [monthlyData, setMonthlyData] = useState<{[key: string]: MealHistoryEntry[]}>({});
    const [monthlyWeightData, setMonthlyWeightData] = useState<{[key: string]: any[]}>({});
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    // Get month name and year
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Get all dates for the current month
    const getMonthDates = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Calculate days to subtract to get to Monday (1 = Monday, 0 = Sunday)
      const daysToSubtract = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - daysToSubtract); // Start from Monday
      
      const dates = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= lastDay || dates.length < 42) { // 6 weeks × 7 days
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };

    // Navigate to previous month
    const goToPreviousMonth = () => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // Navigate to next month
    const goToNextMonth = () => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Fetch monthly data
    const fetchMonthlyData = useCallback(async (monthStart: Date) => {

      setMonthlyLoading(true);
      
      try {
        const monthData: {[key: string]: MealHistoryEntry[]} = {};
        const monthWeightData: {[key: string]: any[]} = {};
        
        const year = monthStart.getFullYear();
        const month = monthStart.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        // Calculate start and end dates for the month
        const startDate = formatDateForAPI(new Date(year, month, 1));
        const endDate = formatDateForAPI(new Date(year, month, lastDay));
        
        // Fetch all meals for the month in one API call
        const mealUrl = buildApiUrl(`/api/diet/meals/range?start_date=${startDate}&end_date=${endDate}`);

        const mealResponse = await fetch(mealUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        

        
        if (mealResponse.ok) {
          const mealData = await mealResponse.json();
          const meals = Array.isArray(mealData.meals) ? mealData.meals : [];
          
          // Group meals by date
          meals.forEach((meal: any) => {
            const dateStr = meal.date;
            if (!monthData[dateStr]) {
              monthData[dateStr] = [];
            }
            monthData[dateStr].push(meal);
          });

        }
        
        // Fetch all weight data for the month in one API call
        const weightUrl = buildApiUrl(`/api/diet/weight/range?start_date=${startDate}&end_date=${endDate}`);

        const weightResponse = await fetch(weightUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        

        
        if (weightResponse.ok) {
          const weightData = await weightResponse.json();
          const weights = Array.isArray(weightData.weights) ? weightData.weights : [];
          
          // Group weights by date
          weights.forEach((weight: any) => {
            const dateStr = weight.date;
            if (!monthWeightData[dateStr]) {
              monthWeightData[dateStr] = [];
            }
            monthWeightData[dateStr].push(weight);
          });

        }
        
        setMonthlyData(monthData);
        setMonthlyWeightData(monthWeightData);
      } catch (err) {
        setError('Failed to load monthly data');
      } finally {
        setMonthlyLoading(false);
      }
    }, [authToken]);

    // Load monthly data when month changes
    useEffect(() => {
      if (activeView === 'monthly' && isLoggedIn && authToken) {
        fetchMonthlyData(currentMonth);
      }
    }, [activeView, currentMonth, isLoggedIn, authToken, fetchMonthlyData]);

    const monthDates = getMonthDates();

    return (
      <div>
        {/* Month Header with Navigation */}
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
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '0.5rem 1rem',
              background: '#3498db',
              border: '1px solid #3498db',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Previous Month
          </button>
          
          <h3 style={{ margin: '0', color: '#ffffff', fontSize: '1.5rem' }}>
            {monthName}
          </h3>
          
          <button
            onClick={goToNextMonth}
            style={{
              padding: '0.5rem 1rem',
              background: '#3498db',
              border: '1px solid #3498db',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Next Month →
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {/* Day Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{
              padding: '0.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#bdc3c7',
              fontWeight: '500'
            }}>
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {monthDates.map((date, index) => {
            const dateStr = formatDateForAPI(date);
            const dayMeals = monthlyData[dateStr] || [];
            const dayWeights = monthlyWeightData[dateStr] || [];
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const isPastOrToday = date <= new Date(new Date().setHours(23, 59, 59, 999));
            
            return (
              <div 
                key={index}
                style={{
                  background: isCurrentMonth ? '#1a1a1a' : '#0f0f0f',
                  border: isToday ? '2px solid #ff7300' : '1px solid #333',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  minHeight: '80px',
                  cursor: isCurrentMonth && isPastOrToday ? 'pointer' : 'default',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  if (isCurrentMonth && isPastOrToday) {
                    setActiveView('daily');
                    setSelectedDate(dateStr);
                  }
                }}
                onMouseEnter={(e) => {
                  if (isCurrentMonth && isPastOrToday) {
                    e.currentTarget.style.borderColor = '#3498db';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCurrentMonth && isPastOrToday) {
                    e.currentTarget.style.borderColor = isToday ? '#ff7300' : '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Date Number */}
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: isToday ? '#ff7300' : '#bdc3c7',
                  fontWeight: isToday ? '600' : '400',
                  marginBottom: '0.25rem'
                }}>
                  {date.getDate()}
                </div>
                
                {/* Content */}
                {monthlyLoading ? (
                  <div style={{ fontSize: '0.6rem', color: '#95a5a6' }}>Loading...</div>
                ) : isCurrentMonth ? (
                  <div>
                    {dayMeals.length > 0 ? (
                      <div style={{ fontSize: '0.6rem', color: '#ffffff' }}>
                        <div style={{ color: '#ff7300', fontWeight: '500' }}>
                          {getDailyTotals(dayMeals).calories.toFixed(0)} cal
                        </div>
                        {dayWeights.length > 0 && (
                          <div style={{ color: '#3498db', fontSize: '0.5rem' }}>
                            {(dayWeights.reduce((sum, w) => sum + (parseFloat(w.weight) || 0), 0) / dayWeights.length).toFixed(1)} lbs
                          </div>
                        )}
                      </div>
                                          ) : (
                        <div style={{ fontSize: '0.6rem', color: '#95a5a6' }}>
                          {isPastOrToday ? 'No data' : ''}
                        </div>
                      )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Monthly Summary */}
        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: '8px', 
          padding: '1.5rem' 
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#ffffff', textAlign: 'center' }}>Monthly Summary</h4>
          {monthlyLoading ? (
            <div style={{ textAlign: 'center', color: '#bdc3c7' }}>Loading monthly summary...</div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem' 
            }}>
              {(() => {
                const daysWithData = Object.values(monthlyData).filter(meals => meals.length > 0).length;
                
                if (daysWithData === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px', gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>No meal data for this month</div>
                    </div>
                  );
                }

                const monthlyTotals = Object.values(monthlyData)
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

                const averages = {
                  calories: monthlyTotals.calories / daysWithData,
                  protein: monthlyTotals.protein / daysWithData,
                  netCarbs: monthlyTotals.netCarbs / daysWithData,
                  fat: monthlyTotals.fat / daysWithData
                };

                return (
                  <>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Days with Data</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{daysWithData}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#bdc3c7', marginBottom: '0.5rem' }}>Avg Calories</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>{averages.calories.toFixed(0)}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#bdc3c2', marginBottom: '0.5rem' }}>Avg Protein</div>
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
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Graph View Component
  const GraphView = () => {
    const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | 'year' | 'overall'>('7days');
    const [selectedMetrics, setSelectedMetrics] = useState<{
      calories: boolean;
      protein: boolean;
      fat: boolean;
      carbs: boolean;
      weight: boolean;
    }>({
      calories: true,
      protein: false,
      fat: false,
      carbs: false,
      weight: true
    });
    const [graphData, setGraphData] = useState<any[]>([]);
    const [graphLoading, setGraphLoading] = useState(false);

    // Fetch graph data based on time period
    const fetchGraphData = useCallback(async () => {
      if (!authToken) return;
      
      setGraphLoading(true);
      try {
        const endDate = new Date();
        let startDate = new Date();
        
        switch (timePeriod) {
          case '7days':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30days':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case 'overall':
            startDate = new Date(2020, 0, 1); // Arbitrary start date
            break;
        }

        const startDateStr = formatDateForAPI(startDate);
        const endDateStr = formatDateForAPI(endDate);

        // Fetch meals and weight data for the period
        const [mealResponse, weightResponse] = await Promise.all([
          fetch(buildApiUrl(`/api/diet/meals/range?start_date=${startDateStr}&end_date=${endDateStr}`), {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          fetch(buildApiUrl(`/api/diet/weight/range?start_date=${startDateStr}&end_date=${endDateStr}`), {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);

        if (mealResponse.ok && weightResponse.ok) {
          const mealData = await mealResponse.json();
          const weightData = await weightResponse.json();

          // Process data for charts
          const processedData = processDataForCharts(mealData.meals || [], weightData.weights || []);
          setGraphData(processedData);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setGraphLoading(false);
      }
    }, [timePeriod, authToken]);

    // Process data for chart display
    const processDataForCharts = (meals: any[], weights: any[]) => {
      const dataMap = new Map<string, any>();
      
      // Group meals by date and calculate daily totals
      meals.forEach(meal => {
        const date = meal.date;
        if (!dataMap.has(date)) {
          dataMap.set(date, {
            date: date, // Keep original date for sorting
            displayDate: formatDateForDisplay(date), // Formatted date for display
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            weight: null
          });
        }
        
        const nutrition = JSON.parse(meal.nutrition_json);
        const entry = dataMap.get(date);
        entry.calories += nutrition.calories || 0;
        entry.protein += nutrition.protein || 0;
        entry.fat += nutrition.fat || 0;
        entry.carbs += nutrition.carbs || 0;
      });

      // Add weight data
      weights.forEach(weight => {
        const date = weight.date;
        if (dataMap.has(date)) {
          const entry = dataMap.get(date);
          if (entry.weight === null) {
            entry.weight = parseFloat(weight.weight);
          } else {
            // Average multiple weights per day
            entry.weight = (entry.weight + parseFloat(weight.weight)) / 2;
          }
        }
      });

      // Convert to array and sort by date
      return Array.from(dataMap.values()).sort((a, b) => {
        // Parse the MM-DD-YYYY format for sorting
        const [monthA, dayA, yearA] = a.date.split('-');
        const [monthB, dayB, yearB] = b.date.split('-');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });
    };

    // Format date for display
    const formatDateForDisplay = (dateStr: string) => {
      const [month, day] = dateStr.split('-');
      return `${month}/${day}`;
    };

    // Toggle metric visibility
    const toggleMetric = (metric: keyof typeof selectedMetrics) => {
      setSelectedMetrics(prev => ({
        ...prev,
        [metric]: !prev[metric]
      }));
    };

    useEffect(() => {
      fetchGraphData();
    }, [fetchGraphData]);

    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#ffffff', fontSize: '1.2rem' }}>Nutrition Trends</h3>
          
          {/* Time Period Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#bdc3c7', marginRight: '0.5rem' }}>Time Period:</label>
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value as any)}
              style={{
                background: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '0.5rem',
                marginRight: '1rem'
              }}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="overall">Overall</option>
            </select>
          </div>

          {/* Metric Toggles */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(selectedMetrics).map(([metric, isSelected]) => (
              <label key={metric} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#bdc3c7' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMetric(metric as keyof typeof selectedMetrics)}
                  style={{ accentColor: '#ff7300' }}
                />
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Chart */}
        {graphLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#bdc3c7' }}>
            Loading chart data...
          </div>
        ) : graphData.length > 0 ? (
          <div style={{ height: '400px', background: '#1a1a1a', borderRadius: '8px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#bdc3c7"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#bdc3c7"
                  fontSize={12}
                  yAxisId="left"
                />
                <YAxis 
                  stroke="#bdc3c7"
                  fontSize={12}
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#2a2a2a', 
                    border: '1px solid #444',
                    color: '#ffffff'
                  }}
                />
                <Legend />
                
                {selectedMetrics.calories && (
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    yAxisId="left"
                    name="Calories"
                  />
                )}
                {selectedMetrics.protein && (
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="#3498db" 
                    strokeWidth={2}
                    yAxisId="left"
                    name="Protein (g)"
                  />
                )}
                {selectedMetrics.fat && (
                  <Line 
                    type="monotone" 
                    dataKey="fat" 
                    stroke="#e74c3c" 
                    strokeWidth={2}
                    yAxisId="left"
                    name="Fat (g)"
                  />
                )}
                {selectedMetrics.carbs && (
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    stroke="#2ecc71" 
                    strokeWidth={2}
                    yAxisId="left"
                    name="Carbs (g)"
                  />
                )}
                {selectedMetrics.weight && (
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#9b59b6" 
                    strokeWidth={2}
                    yAxisId="right"
                    name="Weight (lbs)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#bdc3c7' }}>
            No data available for the selected time period.
          </div>
        )}
      </div>
    );
  };

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
