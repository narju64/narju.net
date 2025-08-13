import React, { useState, useEffect } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { getCurrentAndNextTask, getDayName, formatOrbitalDate, formatGregorianDate, DayRoutine } from '../utils/routineLogic';
import { useAuth } from '../context/AuthContext';
import { useAuthRefresh } from '../hooks/useAuthRefresh';
import { buildApiUrl } from '../utils/api';

const CurrentTask: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState<OrbitalDate | null>(null);
  const [routineData, setRoutineData] = useState<DayRoutine[]>([]);
  const [dayOverviews, setDayOverviews] = useState<{ [key: number]: Array<{ text: string; category: string }> }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, currentUser, authToken, isLoading } = useAuth();

  // Load day overviews from user settings
  const loadDayOverviews = async () => {
    try {
      if (!isLoggedIn || !currentUser || !authToken) {
        setDayOverviews({});
        return;
      }

      const userId = currentUser.id;
      if (!userId) return;

      const response = await fetch(buildApiUrl(`/api/users/${userId}/settings`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings && data.settings.dayOverviews) {
          try {
            const loadedOverviews = JSON.parse(data.settings.dayOverviews);
            setDayOverviews(loadedOverviews);
          } catch (error) {
            console.error('Error parsing day overviews:', error);
            setDayOverviews({});
          }
        } else {
          setDayOverviews({});
        }
      } else {
        setDayOverviews({});
      }
    } catch (error) {
      console.error('Error loading day overviews:', error);
      setDayOverviews({});
    }
  };

  // Fetch routine data for the current day
  const fetchRoutineData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/api/lists/routine'; // Default system routine endpoint
      let headers: HeadersInit = {};
      
      if (isLoggedIn && currentUser && authToken) {
        const userId = currentUser.id;
        if (userId) {
          endpoint = `/api/users/${userId}/routines`;
          headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          };
        }
      }
      
      const response = await fetch(buildApiUrl(endpoint), { headers });
      
      if (!response.ok) {
        // Don't treat 401 (no user routines) as an error - it's expected
        if (isLoggedIn && response.status === 401) {
          // User is logged in but has no personal routines yet
          setRoutineData([]);
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routines && data.routines.length > 0) {
        setRoutineData(data.routines);
      } else if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        setRoutineData(data.list.items_json);
      } else {
        setRoutineData([]);
      }
    } catch (err) {
      console.error('Error fetching routine data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
      
      const orbitalDate = orbitalCalendar.getCurrentOrbitalDate();
      setCurrentDate(orbitalDate);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Only fetch data if auth state is loaded
    if (!isLoading) {
      fetchRoutineData();
      loadDayOverviews();
    }
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // Refetch routine data when authentication state changes
  useAuthRefresh(() => {
    // Only fetch data if auth state is fully loaded
    if (!isLoading) {
      fetchRoutineData();
      loadDayOverviews();
    }
  }, [isLoggedIn, isLoading]);

  // Get dynamic day overview for the current day
  const getCurrentDayOverview = (weekDay: number): Array<{ text: string; category: string }> => {
    return dayOverviews[weekDay] || [];
  };

  // Check if a task is exercise-related
  const isExerciseTask = (activity: string): boolean => {
    const exerciseKeywords = ['exercise', 'upper body', 'vert', 'core', 'workout'];
    return exerciseKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Check if a task is meal-related
  const isMealTask = (activity: string): boolean => {
    const mealKeywords = ['breakfast', 'lunch', 'dinner'];
    return mealKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Render task activity with exercise links
  const renderTaskActivity = (activity: string) => {
    return activity;
  };

  if (!currentDate) return null;

  // Get routines for the current day
  const currentDayRoutine = routineData.find(day => day.day === currentDate.weekDay);
  const todayRoutines = currentDayRoutine?.routines || [];
  
  // Get current and next tasks using real routine data
  const { current, next } = getCurrentAndNextTask(todayRoutines);
  const currentDayOverview = getCurrentDayOverview(currentDate.weekDay);

  return (
    <div className="current-task-widget">
      {!isLoggedIn ? (
        <>
          <div className="current-task-header">
            <h3><a href="/lifestyle/routine" style={{ color: '#ff7300', textDecoration: 'none' }}>Schedule</a></h3>
            <div className="current-time">{currentTime}</div>
          </div>
          
          <div className="current-task-info">
            <div className="current-date">{formatGregorianDate(currentDate)}</div>
          </div>
          
          <div className="current-task">
            <div className="task-activity">
              <a href="/auth/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>
                Log in to see your schedule
              </a>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="current-task-header">
            <h3><a href="/lifestyle/routine" style={{ color: '#ff7300', textDecoration: 'none' }}>Schedule</a></h3>
            <div className="current-time">{currentTime}</div>
          </div>
          
          <div className="current-task-info">
            <div className="current-day">
              {getDayName(currentDate.weekDay)}, {orbitalCalendar.getMonthName(currentDate.month)} {currentDate.day} ({formatOrbitalDate(currentDate)})
            </div>
            <div className="current-date">{formatGregorianDate(currentDate)}</div>
          </div>

          <div className="daily-description">
            <span className="description-label">Day Overview: </span>
            {currentDayOverview.length > 0 ? (
              currentDayOverview.map((tag, index) => (
                tag.category === 'exercise' ? (
                  <a key={index} href="/lifestyle/exercise" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    <span className={`day-overview-tag-display category-${tag.category}`} style={{ cursor: 'pointer' }}>
                      {tag.text}
                    </span>
                  </a>
                ) : tag.category === 'meals' ? (
                  <a key={index} href="/lifestyle/diet" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    <span className={`day-overview-tag-display category-${tag.category}`} style={{ cursor: 'pointer' }}>
                      {tag.text}
                    </span>
                  </a>
                ) : (
                  <span key={index} className={`day-overview-tag-display category-${tag.category}`}>
                    {tag.text}
                  </span>
                )
              ))
            ) : (
              <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>
                No overview set
              </span>
            )}
          </div>

          {loading && (
            <div className="current-task">
              <div className="task-label">Loading routine...</div>
            </div>
          )}

          {error && (
            <div className="current-task">
              <div className="task-label">Error loading routine</div>
              <div className="task-activity">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <>
              {routineData.length === 0 ? (
                <div className="current-task">
                  <div className="task-label">No Routine Found</div>
                  <div className="task-activity">
                    <a href="/auth/login" style={{ color: '#27ae60', textDecoration: 'none', fontWeight: '600' }}>
                      Log in to create your routine
                    </a>
                  </div>
                </div>
              ) : current ? (
                isExerciseTask(current.activity) ? (
                  <a href="/lifestyle/exercise" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="current-task" style={{ cursor: 'pointer' }}>
                      <div className="task-label">Current Task:</div>
                      <div className="task-time">{current.time}</div>
                      <div className="task-activity">{renderTaskActivity(current.activity)}</div>
                    </div>
                  </a>
                ) : isMealTask(current.activity) ? (
                  <a href="/lifestyle/diet" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="current-task" style={{ cursor: 'pointer' }}>
                      <div className="task-label">Current Task:</div>
                      <div className="task-time">{current.time}</div>
                      <div className="task-activity">{renderTaskActivity(current.activity)}</div>
                    </div>
                  </a>
                ) : (
                  <div className="current-task">
                    <div className="task-label">Current Task:</div>
                    <div className="task-time">{current.time}</div>
                    <div className="task-activity">{renderTaskActivity(current.activity)}</div>
                  </div>
                )
              ) : (
                <div className="current-task">
                  <div className="task-label">Current Task:</div>
                  <div className="task-activity">No scheduled task</div>
                </div>
              )}

              {routineData.length > 0 && next && (
                isExerciseTask(next.activity) ? (
                  <a href="/lifestyle/exercise" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="next-task" style={{ cursor: 'pointer' }}>
                      <div className="task-label">Next Task:</div>
                      <div className="task-time">{next.time}</div>
                      <div className="task-activity">{renderTaskActivity(next.activity)}</div>
                    </div>
                  </a>
                ) : isMealTask(next.activity) ? (
                  <a href="/lifestyle/diet" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="next-task" style={{ cursor: 'pointer' }}>
                      <div className="task-label">Next Task:</div>
                      <div className="task-time">{next.time}</div>
                      <div className="task-activity">{renderTaskActivity(next.activity)}</div>
                    </div>
                  </a>
                ) : (
                  <div className="next-task">
                    <div className="task-label">Next Task:</div>
                    <div className="task-time">{next.time}</div>
                    <div className="task-activity">{renderTaskActivity(next.activity)}</div>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CurrentTask; 