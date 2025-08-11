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

// Time slots are now defined in the database, not hardcoded
export const generateTimes = () => {
  // This will be populated from the database routine data
  // For now, return an empty array - the actual times will come from the API
  return [];
};

export const isCurrentTime = (time: string) => {
  // Parse the time string (e.g., "6:00 AM", "2:00 PM")
  const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return false;
  
  const hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();
  
  // Convert to 24-hour format
  let hour24 = hour;
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0;
  }
  
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if current time is within this time slot (within 30 minutes)
  const timeSlotStart = hour24 * 60 + minute;
  const timeSlotEnd = timeSlotStart + 60; // 1 hour slot
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  return currentTimeMinutes >= timeSlotStart && currentTimeMinutes < timeSlotEnd;
};

export const getCurrentAndNextTask = (routines: RoutineItem[] = []) => {
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
    // Normal routine logic - this will need to be updated when we implement proper time checking
    for (let i = 0; i < routines.length; i++) {
      const routine = routines[i];
      if (routine.activity && isCurrentTime(routine.time)) {
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