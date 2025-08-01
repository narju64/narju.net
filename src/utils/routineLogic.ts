import { orbitalCalendar, OrbitalDate } from './orbitalCalendar';

export interface RoutineItem {
  time: string;
  activity: string;
  category: string;
}

export interface DayRoutine {
  day: number;
  routines: RoutineItem[];
}

// Single source of truth: each time slot defines both activity and time range
const ROUTINE_SLOTS = {
  '6:00 AM': {
    activity: (dayNumber: number) => {
      if (dayNumber === 7) {
        return 'Wake up, make bed, brush teeth, shower';
      }
      return 'Wake up, make bed, brush teeth';
    },
    category: '',
    timeRange: { startHour: 6, startMinute: 0, endHour: 6, endMinute: 29 }
  },
  '6:30 AM': {
    activity: (dayNumber: number) => {
      if (dayNumber === 7) return 'Religious Study';
      if (dayNumber === 1 || dayNumber === 3 || dayNumber === 5) return 'Exercise (Upper Body)';
      if (dayNumber === 2 || dayNumber === 4 || dayNumber === 6) return 'Exercise (Vert & Core)';
      return 'Exercise';
    },
    category: '',
    timeRange: { startHour: 6, startMinute: 30, endHour: 7, endMinute: 29 }
  },
  '7:30 AM': {
    activity: (dayNumber: number) => {
      if (dayNumber === 7) {
        return '';
      }
      return 'Shower';
    },
    category: '',
    timeRange: { startHour: 7, startMinute: 30, endHour: 7, endMinute: 59 }
  },
  '8:00 AM': {
    activity: (dayNumber: number) => dayNumber === 7 ? '' : 'Breakfast & Vitamins',
    category: '',
    timeRange: { startHour: 8, startMinute: 0, endHour: 8, endMinute: 29 }
  },
  '8:30 AM - 1:00 PM': {
    activity: 'Coding & Website',
    category: '',
    timeRange: { startHour: 8, startMinute: 30, endHour: 12, endMinute: 59 }
  },
  '1:00 PM': {
    activity: (dayNumber: number) => dayNumber === 7 ? '' : 'Lunch',
    category: '',
    timeRange: { startHour: 13, startMinute: 0, endHour: 13, endMinute: 29 }
  },
  '1:30 PM - 5:00 PM': {
    activity: 'Art & Music',
    category: '',
    timeRange: { startHour: 13, startMinute: 30, endHour: 16, endMinute: 59 }
  },
  '5:00 PM': {
    activity: (dayNumber: number) => {
      const weeklyTasks = {
        1: 'Grooming',
        2: 'Laundry', 
        3: 'Groceries',
        4: 'Cleaning',
        5: 'Plants / mail',
        6: 'Meal Prep'
      };
      return weeklyTasks[dayNumber as keyof typeof weeklyTasks] || '';
    },
    category: '',
    timeRange: { startHour: 17, startMinute: 0, endHour: 17, endMinute: 59 }
  },
  '6:00 PM': {
    activity: 'Dinner',
    category: '',
    timeRange: { startHour: 18, startMinute: 0, endHour: 18, endMinute: 29 }
  },
  '6:30 PM': {
    activity: 'Walk',
    category: '',
    timeRange: { startHour: 18, startMinute: 30, endHour: 18, endMinute: 59 }
  },
  '7:00 PM - 9:00 PM': {
    activity: 'Podcasts & Media',
    category: '',
    timeRange: { startHour: 19, startMinute: 0, endHour: 20, endMinute: 59 }
  },
  '9:00 PM': {
    activity: 'Read',
    category: '',
    timeRange: { startHour: 21, startMinute: 0, endHour: 21, endMinute: 59 }
  },
  '10:00 PM': {
    activity: 'Brush teeth, pray, sleep',
    category: '',
    timeRange: { startHour: 22, startMinute: 0, endHour: 22, endMinute: 29 }
  }
};

export const generateTimes = () => {
  return Object.keys(ROUTINE_SLOTS);
};

export const getCurrentRoutine = (dayNumber: number): RoutineItem[] => {
  const times = generateTimes();
  return times.map(time => {
    const config = ROUTINE_SLOTS[time as keyof typeof ROUTINE_SLOTS];
    if (!config) {
      return { time, activity: '', category: '' };
    }
    
    const activity = typeof config.activity === 'function' 
      ? config.activity(dayNumber) 
      : config.activity;
    
    return { 
      time, 
      activity, 
      category: config.category 
    };
  });
};

export const isCurrentTime = (time: string, dayNumber?: number) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const config = ROUTINE_SLOTS[time as keyof typeof ROUTINE_SLOTS];
  if (!config) {
    return false;
  }
  
  const { startHour, startMinute, endHour, endMinute } = config.timeRange;
  
  // Convert current time to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  // Check if current time falls within this slot's range
  const isInTimeRange = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  
  if (!isInTimeRange) {
    return false;
  }
  
  // If this slot has an activity, return true
  const activity = typeof config.activity === 'function' 
    ? config.activity(dayNumber || 1) 
    : config.activity;
  
  if (activity) {
    return true;
  }
  
  // If this slot is empty, check if we should extend the previous activity
  const times = generateTimes();
  const currentIndex = times.indexOf(time);
  
  // Look backward to find the most recent activity
  for (let i = currentIndex - 1; i >= 0; i--) {
    const previousTime = times[i];
    const previousConfig = ROUTINE_SLOTS[previousTime as keyof typeof ROUTINE_SLOTS];
    
    if (previousConfig) {
      const previousActivity = typeof previousConfig.activity === 'function' 
        ? previousConfig.activity(dayNumber || 1) 
        : previousConfig.activity;
      
      if (previousActivity) {
        // Check if the previous activity's time range extends to cover current time
        const { startHour: prevStartHour, startMinute: prevStartMinute, endHour: prevEndHour, endMinute: prevEndMinute } = previousConfig.timeRange;
        const prevStartTimeInMinutes = prevStartHour * 60 + prevStartMinute;
        const prevEndTimeInMinutes = prevEndHour * 60 + prevEndMinute;
        
        // If current time is within the previous activity's range, extend it
        return currentTimeInMinutes >= prevStartTimeInMinutes && currentTimeInMinutes <= prevEndTimeInMinutes;
      }
    }
  }
  
  return false;
};

export const getCurrentAndNextTask = (currentDate: OrbitalDate) => {
  const routines = getCurrentRoutine(currentDate.weekDay);
  let currentTask = null;
  let nextTask = null;

  // Check if it's sleeping hours (10:30 PM to 6:00 AM)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isSleepingHours = (currentHour === 22 && currentMinute >= 30) || 
                         (currentHour >= 23) || 
                         (currentHour >= 0 && currentHour < 6);

  if (isSleepingHours) {
    // Create a sleeping task
    currentTask = { 
      time: 'Sleeping', 
      activity: 'Sleeping', 
      category: '' 
    };
    
    // Find the first task of the day as next task
    for (const routine of routines) {
      if (routine.activity) {
        nextTask = routine;
        break;
      }
    }
  } else {
    // Normal routine logic
    for (let i = 0; i < routines.length; i++) {
      const routine = routines[i];
      if (routine.activity && isCurrentTime(routine.time, currentDate.weekDay)) {
        currentTask = routine;
        // Find next task
        for (let j = i + 1; j < routines.length; j++) {
          if (routines[j].activity) {
            nextTask = routines[j];
            break;
          }
        }
        break;
      }
    }
  }

  return { current: currentTask, next: nextTask };
};

export const formatOrbitalDate = (date: OrbitalDate) => {
  const orbitalDateStr = `${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}/${date.year.toString().slice(-2)}`;
  return orbitalDateStr;
};

export const formatOrbitalDateWithMonth = (date: OrbitalDate) => {
  const monthName = orbitalCalendar.getMonthName(date.month);
  const orbitalDateStr = `${date.month.toString().padStart(2, '0')}/${date.day.toString().padStart(2, '0')}/${date.year.toString().slice(-2)}`;
  return `${monthName} ${date.day} (${orbitalDateStr})`;
};

export const formatGregorianDate = (date: OrbitalDate) => {
  const gregorianDate = orbitalCalendar.orbitalToGregorian(date);
  const gregorianDateStr = gregorianDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  return gregorianDateStr;
};

export const getDayName = (dayNumber: number) => {
  return orbitalCalendar.getWeekDayName(dayNumber);
}; 