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

  // Render task activity with exercise links
  const renderTaskActivity = (activity: string) => {
    return activity;
  };

  if (!currentDate) return null;

  const { current, next } = getCurrentAndNextTask(currentDate);
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

      {current ? (
        isExerciseTask(current.activity) ? (
          <a href="/lifestyle/exercise" style={{ textDecoration: 'none', display: 'block' }}>
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
        ) : (
          <div className="next-task">
            <div className="task-label">Next Task:</div>
            <div className="task-time">{next.time}</div>
            <div className="task-activity">{renderTaskActivity(next.activity)}</div>
          </div>
        )
      )}
    </div>
  );
};

export default CurrentTask; 