import React from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { 
  generateTimes, 
  getCurrentRoutine, 
  isCurrentTime, 
  formatOrbitalDate, 
  formatGregorianDate, 
  getDayName,
  DayRoutine
} from '../utils/routineLogic';
import './Routine.css';

// Interface for processed routine data with row spans
interface ProcessedRoutine {
  time: string;
  activity: string;
  category: string;
  rowSpan: number;
  isExtended: boolean;
}

interface RoutineData {
  day: number;
  routines: {
    time: string;
    activity: string;
    category: string;
  }[];
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: RoutineData[];
  };
}

const Routine: React.FC = () => {
  const [currentDate] = React.useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [currentTime, setCurrentTime] = React.useState<string>('');
  const [routineData, setRoutineData] = React.useState<DayRoutine[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check if user is logged in
  React.useEffect(() => {
    const loggedIn = !!(localStorage.getItem('adminUser') && localStorage.getItem('adminToken'));
    
    if (loggedIn) {
      fetchRoutineFromApi();
    } else {
      loadHardcodedRoutine();
    }
  }, []);

  const fetchRoutineFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/lists/routine');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API Response:', data);
      
      // Use API data if available, otherwise fall back to hardcoded
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        const apiRoutines: DayRoutine[] = data.list.items_json.map(item => ({
          day: item.day,
          routines: item.routines
        }));
        setRoutineData(apiRoutines);
      } else {
        console.log('No API data available, using hardcoded data');
        loadHardcodedRoutine();
      }
    } catch (err) {
      console.error('Error fetching routine from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fall back to hardcoded data on error
      loadHardcodedRoutine();
    } finally {
      setLoading(false);
    }
  };

  const loadHardcodedRoutine = () => {
    // Generate weekly routine using shared logic
    const weeklyRoutine: DayRoutine[] = Array.from({ length: 7 }, (_, index) => ({
      day: index + 1,
      routines: getCurrentRoutine(index + 1)
    }));
    setRoutineData(weeklyRoutine);
  };

  // Update current time every minute
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${displayHour}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const times = generateTimes();

  // Process routine data to calculate row spans for visual extension
  const processRoutineForDay = (routines: any[]): ProcessedRoutine[] => {
    const processed: ProcessedRoutine[] = [];
    
    for (let i = 0; i < routines.length; i++) {
      const routine = routines[i];
      const activity = routine.activity || '';
      
      if (activity) {
        // This slot has an activity, calculate how many empty slots follow
        let rowSpan = 1;
        let j = i + 1;
        
        // Count consecutive empty slots
        while (j < routines.length && !routines[j].activity) {
          rowSpan++;
          j++;
        }
        
        processed.push({
          time: routine.time,
          activity: routine.activity,
          category: routine.category,
          rowSpan,
          isExtended: rowSpan > 1
        });
      } else {
        // This slot is empty, skip it (will be covered by the extended cell above)
        continue;
      }
    }
    
    return processed;
  };

  // Use routineData if available, otherwise fall back to hardcoded
  const weeklyRoutine: DayRoutine[] = routineData.length > 0 
    ? routineData 
    : Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        routines: getCurrentRoutine(index + 1)
      }));

  // Process each day's routine for visual extension
  const processedWeeklyRoutine = weeklyRoutine.map(day => ({
    day: day.day,
    processedRoutines: processRoutineForDay(day.routines)
  }));

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'health': '#27ae60',
      'leisure': '#3498db',
      'meal': '#e74c3c', // Red color for meals
      'chores': '#9b59b6' // Purple color for chores
    };
    return colors[category] || '#95a5a6';
  };

  const getCategoryBackgroundTint = (category: string) => {
    const tints: { [key: string]: string } = {
      'health': 'rgba(39, 174, 96, 0.05)', // Very light green
      'leisure': 'rgba(52, 152, 219, 0.05)', // Very light blue
      'meal': 'rgba(231, 76, 60, 0.05)', // Very light red
      'chores': 'rgba(155, 89, 182, 0.05)' // Very light purple
    };
    return tints[category] || 'transparent';
  };

  // Check if an activity is exercise-related
  const isExerciseActivity = (activity: string): boolean => {
    const exerciseKeywords = ['exercise', 'upper body', 'vert', 'core', 'workout'];
    return exerciseKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Check if an activity is meal-related
  const isMealActivity = (activity: string): boolean => {
    const mealKeywords = ['breakfast', 'lunch', 'dinner', 'meal', 'eat', 'food'];
    return mealKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Render activity with exercise links
  const renderActivity = (activity: string) => {
    return activity;
  };

  const getDateForDay = (dayNumber: number): OrbitalDate => {
    // Calculate the orbital date for this specific day of the week
    const currentWeekStart = currentDate.day - currentDate.weekDay + 1;
    const targetDay = currentWeekStart + dayNumber - 1;
    
    // Handle month/year boundaries
    let targetMonth = currentDate.month;
    let targetYear = currentDate.year;
    
    if (targetDay > 28) {
      targetMonth += 1;
      if (targetMonth > 13) {
        targetMonth = 1;
        targetYear += 1;
      }
    } else if (targetDay < 1) {
      targetMonth -= 1;
      if (targetMonth < 1) {
        targetMonth = 13;
        targetYear -= 1;
      }
    }
    
    const finalDay = targetDay > 28 ? targetDay - 28 : targetDay < 1 ? targetDay + 28 : targetDay;
    
    // Get the days for this month and find the correct one
    const daysInMonth = orbitalCalendar.getDaysInMonth(targetYear, targetMonth);
    const targetDate = daysInMonth.find(day => day.day === finalDay && day.weekDay === dayNumber);
    
    if (targetDate) {
      return targetDate;
    }
    
    // Fallback: create a basic orbital date
    const gregorianDate = new Date(); // This will be approximate
    return {
      day: finalDay,
      month: targetMonth,
      year: targetYear,
      weekDay: dayNumber,
      gregorianDate,
      isSpecialDay: false,
      specialDayType: undefined
    };
  };

  const isCurrentDay = (dayNumber: number) => {
    return dayNumber === currentDate.weekDay;
  };

  const isCurrentCell = (dayNumber: number, time: string) => {
    return isCurrentDay(dayNumber) && isCurrentTime(time);
  };

  return (
    <div className="routine-page">
      <div className="routine-header">
        <h1>Weekly Routine</h1>
        <div className="current-date">
          <span>Current: {getDayName(currentDate.weekDay)} ({formatOrbitalDate(currentDate)})</span>
          <span>{formatGregorianDate(currentDate)}</span>
          <span>Time: {currentTime}</span>
        </div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e67e22', fontWeight: 'bold' }}>
            Loading routine from database...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e53e3e' }}>
            Error loading from database: {error}. Using hardcoded data.
          </div>
        )}
      </div>

      <div className="month-week-header">
        <h2>{orbitalCalendar.getMonthName(currentDate.month)} - Week {Math.ceil(currentDate.day / 7)}</h2>
      </div>

      <div className="routine-grid-container">
        <table className="routine-grid">
          <thead>
            <tr>
              <th className="time-header">Time</th>
              {weeklyRoutine.map(day => (
                <th key={day.day} className={`day-header ${isCurrentDay(day.day) ? 'current-day' : ''}`}>
                  <div className="day-name">
                    {getDayName(day.day)} <span className="orbital-date">({formatOrbitalDate(getDateForDay(day.day))})</span>
                  </div>
                  <div className="day-date">{formatGregorianDate(getDateForDay(day.day))}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time}>
                <td className={`time-cell ${isCurrentTime(time) ? 'current-time' : ''}`}>{time}</td>
                {processedWeeklyRoutine.map(day => {
                  const processedRoutine = day.processedRoutines.find(r => r.time === time);
                  
                  if (!processedRoutine) {
                    // This time slot is empty and covered by an extended cell above
                    return <td key={day.day} className="routine-cell hidden-cell"></td>;
                  }
                  
                  return (
                                         <td 
                       key={day.day} 
                       className={`routine-cell ${isCurrentCell(day.day, time) ? 'current-cell' : ''} ${processedRoutine.isExtended ? 'extended-cell' : ''}`}
                       rowSpan={processedRoutine.rowSpan > 1 ? processedRoutine.rowSpan : undefined}
                     >
                       {isExerciseActivity(processedRoutine.activity) ? (
                         <a 
                           href="/lifestyle/exercise" 
                           style={{ 
                             textDecoration: 'none', 
                             display: 'block', 
                             height: '100%',
                             cursor: 'pointer'
                           }}
                         >
                           <div 
                             className={`routine-item ${processedRoutine.activity ? '' : 'empty-activity'}`}
                             style={{ 
                               borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                               backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                               height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                             }}
                           >
                             <div className="routine-activity">
                               {processedRoutine.activity ? renderActivity(processedRoutine.activity) : 'Add activity...'}
                             </div>
                           </div>
                         </a>
                       ) : isMealActivity(processedRoutine.activity) ? (
                         <a 
                           href="/lifestyle/diet" 
                           style={{ 
                             textDecoration: 'none', 
                             display: 'block', 
                             height: '100%',
                             cursor: 'pointer'
                           }}
                         >
                           <div 
                             className={`routine-item ${processedRoutine.activity ? '' : 'empty-activity'}`}
                             style={{ 
                               borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                               backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                               height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                             }}
                           >
                             <div className="routine-activity">
                               {processedRoutine.activity ? renderActivity(processedRoutine.activity) : 'Add activity...'}
                             </div>
                           </div>
                         </a>
                       ) : (
                         <div 
                           className={`routine-item ${processedRoutine.activity ? '' : 'empty-activity'}`}
                           style={{ 
                             borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                             backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                             height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                           }}
                         >
                           <div className="routine-activity">
                             {processedRoutine.activity ? renderActivity(processedRoutine.activity) : 'Add activity...'}
                           </div>
                         </div>
                       )}
                     </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Routine; 