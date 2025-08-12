import React, { useState, useEffect } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { getCurrentAndNextTask, getDayName, formatOrbitalDate, formatGregorianDate, DayRoutine } from '../utils/routineLogic';
import { buildApiUrl } from '../utils/api';

const CurrentTask: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState<OrbitalDate | null>(null);
  const [routineData, setRoutineData] = useState<DayRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch routine data for the current day
  const fetchRoutineData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      const isLoggedIn = !!(localStorage.getItem('currentUser') && localStorage.getItem('authToken'));
      
      let endpoint = '/api/lists/routine'; // Default system routine endpoint
      let headers: HeadersInit = {};
      
      if (isLoggedIn) {
        // Get user ID from localStorage
        const currentUser = localStorage.getItem('currentUser');
        const authToken = localStorage.getItem('authToken');
        
        if (currentUser && authToken) {
          try {
            const userData = JSON.parse(currentUser);
            const userId = userData.id || userData.userId;
            if (userId) {
              endpoint = `/api/users/${userId}/routines`;
              headers = {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              };
            }
          } catch (parseError) {
            console.error('Error parsing current user data:', parseError);
            // Fallback to system routine if parsing fails
            endpoint = '/api/lists/routine';
          }
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
      
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        setRoutineData(data.list.items_json);
      } else if (data.routines && data.routines.length > 0) {
        setRoutineData(data.routines);
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
    
    // Fetch routine data when component mounts
    fetchRoutineData();
    
    return () => clearInterval(interval);
  }, []);

  const getDailyDescription = (weekDay: number): { exerciseType: string; weeklyTask: string; isRestDay: boolean } => {
    if (weekDay === 7) {
      return { exerciseType: 'Rest', weeklyTask: '24 Hour Fast', isRestDay: true };
    }
    
    const exerciseTypes = {
      1: 'Upper Body',
      2: 'Vert & Core', 
      3: 'Upper Body',
      4: 'Vert & Core',
      5: 'Upper Body',
      6: 'Vert & Core'
    };
    
    const weeklyTasks = {
      1: 'Grooming',
      2: 'Laundry', 
      3: 'Groceries',
      4: 'Cleaning',
      5: 'Plants',
      6: 'Meal Prep'
    };
    
    const exerciseType = exerciseTypes[weekDay as keyof typeof exerciseTypes];
    const weeklyTask = weeklyTasks[weekDay as keyof typeof weeklyTasks];
    
    return { exerciseType, weeklyTask, isRestDay: false };
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
  const dailyDescription = getDailyDescription(currentDate.weekDay);

  return (
    <div className="current-task-widget">
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
        <div className="description-label">Day Overview:</div>
        <div className="description-display">
          {dailyDescription.isRestDay ? (
            <>
              <a href="/lifestyle/exercise" style={{ color: '#ff7300', textDecoration: 'none', fontWeight: '600' }}>
                {dailyDescription.exerciseType} Day
              </a>
              {' • '}
              {dailyDescription.weeklyTask}
            </>
          ) : (
            <>
              <a href="/lifestyle/exercise" style={{ color: '#ff7300', textDecoration: 'none', fontWeight: '600' }}>
                {dailyDescription.exerciseType} Day
              </a>
              <span style={{ marginLeft: '8px' }}>•</span>
              <span style={{ marginLeft: '8px' }}>{dailyDescription.weeklyTask}</span>
            </>
          )}
        </div>
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
          {current ? (
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

          {next && (
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
    </div>
  );
};

export default CurrentTask; 