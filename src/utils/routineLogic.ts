import { orbitalCalendar, OrbitalDate } from './orbitalCalendar';

export interface RoutineItem {
  time: string;
  activity: string;
  category: string;
  endTime?: string; // Calculated end time (1 minute before next activity)
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

// Helper function to convert time string to minutes for comparison
const convertTimeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

// Helper function to convert minutes back to time string
const convertMinutesToTime = (totalMinutes: number): string => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let period = 'AM';
  if (hours >= 12) {
    period = 'PM';
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;
  
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Calculate end times for all activities in a day's routine
export const calculateEndTimes = (routines: RoutineItem[]): RoutineItem[] => {
  if (routines.length === 0) return routines;
  
  // Sort routines by time to ensure proper order
  const sortedRoutines = [...routines].sort((a, b) => 
    convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time)
  );
  
  const routinesWithEndTimes = sortedRoutines.map((routine, index) => {
    if (index === sortedRoutines.length - 1) {
      // Last activity of the day - extend until end of day (11:59 PM)
      return { ...routine, endTime: '11:59 PM' };
    }
    
    // Calculate end time as 1 minute before next activity starts
    const nextActivityTime = convertTimeToMinutes(sortedRoutines[index + 1].time);
    const endTimeMinutes = nextActivityTime - 1;
    const endTime = convertMinutesToTime(endTimeMinutes);
    
    return { ...routine, endTime };
  });
  
  return routinesWithEndTimes;
};

export const isCurrentTime = (time: string, routines: RoutineItem[] = []) => {
  if (routines.length === 0) return false;
  
  // Calculate end times for all routines
  const routinesWithEndTimes = calculateEndTimes(routines);
  
  // Get current time in minutes
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  // Find which activity is currently active
  for (const routine of routinesWithEndTimes) {
    if (!routine.activity || !routine.endTime) continue;
    
    const startMinutes = convertTimeToMinutes(routine.time);
    const endMinutes = convertTimeToMinutes(routine.endTime);
    
    // Handle activities that span midnight
    if (endMinutes < startMinutes) {
      // Activity spans midnight (e.g., sleep from 10 PM to 6 AM)
      if (currentTimeMinutes >= startMinutes || currentTimeMinutes <= endMinutes) {
        return routine.time === time;
      }
    } else {
      // Normal activity within same day
      if (currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes) {
        return routine.time === time;
      }
    }
  }
  
  return false;
};

export const getCurrentAndNextTask = (routines: RoutineItem[] = []) => {
  if (routines.length === 0) {
    return { current: null, next: null };
  }
  
  // Calculate end times for all routines
  const routinesWithEndTimes = calculateEndTimes(routines);
  
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  let currentTask = null;
  let nextTask = null;
  
  // Check if it's sleeping hours (10:30 PM to 6:00 AM)
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
    for (const routine of routinesWithEndTimes) {
      if (routine.activity && routine.activity.trim() !== '') {
        nextTask = routine;
        break;
      }
    }
  } else {
    // Find current task based on time ranges
    for (let i = 0; i < routinesWithEndTimes.length; i++) {
      const routine = routinesWithEndTimes[i];
      if (!routine.activity || !routine.endTime) continue;
      
      const startMinutes = convertTimeToMinutes(routine.time);
      const endMinutes = convertTimeToMinutes(routine.endTime);
      
      // Handle activities that span midnight
      if (endMinutes < startMinutes) {
        // Activity spans midnight
        if (currentTimeMinutes >= startMinutes || currentTimeMinutes <= endMinutes) {
          currentTask = routine;
          // Find next task
          for (let j = i + 1; j < routinesWithEndTimes.length; j++) {
            if (routinesWithEndTimes[j].activity && routinesWithEndTimes[j].activity.trim() !== '') {
              nextTask = routinesWithEndTimes[j];
              break;
            }
          }
          // If no next task found, look for first task of next day
          if (!nextTask) {
            for (const nextRoutine of routinesWithEndTimes) {
              if (nextRoutine.activity && nextRoutine.activity.trim() !== '') {
                nextTask = nextRoutine;
                break;
              }
            }
          }
          break;
        }
      } else {
        // Normal activity within same day
        if (currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes) {
          currentTask = routine;
          // Find next task
          for (let j = i + 1; j < routinesWithEndTimes.length; j++) {
            if (routinesWithEndTimes[j].activity && routinesWithEndTimes[j].activity.trim() !== '') {
              nextTask = routinesWithEndTimes[j];
              break;
            }
          }
          break;
        }
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