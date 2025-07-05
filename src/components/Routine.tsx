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



const Routine: React.FC = () => {
  const [currentDate] = React.useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [currentTime, setCurrentTime] = React.useState<string>('');

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

  // Generate weekly routine using shared logic
  const weeklyRoutine: DayRoutine[] = Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    routines: getCurrentRoutine(index + 1)
  }));

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'health': '#27ae60',
      'work': '#3498db',
      'creativity': '#9b59b6',
      'learning': '#f39c12',
      'planning': '#e74c3c',
      'social': '#1abc9c',
      'mindfulness': '#34495e',
      'adventure': '#e67e22'
    };
    return colors[category] || '#95a5a6';
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
                {weeklyRoutine.map(day => {
                  const routine = day.routines.find(r => r.time === time);
                  return (
                    <td key={day.day} className={`routine-cell ${isCurrentCell(day.day, time) ? 'current-cell' : ''}`}>
                      {routine ? (
                        <div 
                          className={`routine-item ${routine.activity ? '' : 'empty-activity'}`}
                          style={{ 
                            borderLeftColor: routine.category ? getCategoryColor(routine.category) : '#e1e5e9'
                          }}
                        >
                          <div className="routine-activity">
                            {routine.activity || 'Add activity...'}
                          </div>
                          {routine.category && (
                            <div className="routine-category">{routine.category}</div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-cell"></div>
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