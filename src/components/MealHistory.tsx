import React, { useState, useEffect } from 'react';
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

const MealHistory: React.FC = () => {
  const { isLoggedIn, authToken } = useAuth();
  const [mealHistory, setMealHistory] = useState<MealHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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
      // Convert YYYY-MM-DD to MM-DD-YYYY for API
      const [year, month, day] = date.split('-');
      const convertedDate = `${month}-${day}-${year}`;
      loadMealsForDate(convertedDate);
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
      return {
        calories: totals.calories + (nutrition.calories || 0),
        protein: totals.protein + (nutrition.protein || 0),
        fat: totals.fat + (nutrition.fat || 0),
        carbs: totals.carbs + (nutrition.carbs || 0),
        sugar: totals.sugar + (nutrition.sugar || 0),
        fiber: totals.fiber + (nutrition.fiber || 0),
        netCarbs: totals.netCarbs + (nutrition.netCarbs || 0)
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

  const dailyTotals = getDailyTotals(mealHistory);

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div style={{ 
            background: '#1a1a1a', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
            border: '1px solid #294cad' 
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#ffffff' }}>Meal History</h2>
            </div>

            {/* Date Selector */}
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
              <label htmlFor="date-selector" style={{ display: 'block', marginBottom: '0.5rem', color: '#bdc3c7' }}>
                Select Date:
              </label>
              <input
                type="date"
                id="date-selector"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.calories.toFixed(0)}</span>
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.protein.toFixed(1)}g</span>
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.fat.toFixed(1)}g</span>
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.carbs.toFixed(1)}g</span>
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.sugar.toFixed(1)}g</span>
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
                    <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>{dailyTotals.fiber.toFixed(1)}g</span>
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

          {/* Right Column - Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ 
              background: '#1a1a1a', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
              border: '1px solid #294cad' 
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0', color: '#ffffff' }}>About Meal History</h2>
              </div>
              <div style={{ padding: '1rem', color: '#bdc3c7' }}>
                <p>This page shows your meal tracking history and daily nutrition totals.</p>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li>Select any date to view meals for that day</li>
                  <li>Daily totals show your nutrition intake</li>
                  <li>Meals are organized by type and time</li>
                  <li>Use the back button to return to diet tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealHistory;
