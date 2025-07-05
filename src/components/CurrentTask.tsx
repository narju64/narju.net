import React, { useState, useEffect } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { getCurrentAndNextTask, getDayName, formatOrbitalDate, formatGregorianDate } from '../utils/routineLogic';


const CurrentTask: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState<OrbitalDate | null>(null);

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
    return () => clearInterval(interval);
  }, []);

  if (!currentDate) return null;

  const { current, next } = getCurrentAndNextTask(currentDate);

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

      {current ? (
        <div className="current-task">
          <div className="task-label">Current Task:</div>
          <div className="task-time">{current.time}</div>
          <div className="task-activity">{current.activity}</div>
        </div>
      ) : (
        <div className="current-task">
          <div className="task-label">Current Task:</div>
          <div className="task-activity">No scheduled task</div>
        </div>
      )}

      {next && (
        <div className="next-task">
          <div className="task-label">Next Task:</div>
          <div className="task-time">{next.time}</div>
          <div className="task-activity">{next.activity}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentTask; 