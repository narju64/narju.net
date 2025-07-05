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

export const generateTimes = () => {
  const times = [];
  for (let hour = 6; hour <= 22; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Skip 7, 8, 9 AM as they'll be combined
    if (hour >= 7 && hour <= 9) {
      if (hour === 7) {
        times.push(`7:00 AM - 10:00 AM`);
      }
      continue;
    }
    
    // Skip 11 AM, 12 PM, 1 PM as they'll be combined
    if (hour >= 11 && hour <= 13) {
      if (hour === 11) {
        times.push(`10:30 AM - 2:00 PM`);
      }
      continue;
    }
    
    // Skip 3 PM, 4 PM as they'll be combined
    if (hour >= 15 && hour <= 16) {
      if (hour === 15) {
        times.push(`2:30 PM - 5:00 PM`);
      }
      continue;
    }
    
    times.push(`${displayHour}:00 ${ampm}`);
    
    // Add 6:30 AM specifically
    if (hour === 6) {
      times.push(`6:30 AM`);
    }
    // Add 6:45 PM specifically
    if (hour === 18) {
      times.push(`6:45 PM`);
    }
    // Add 8:45 PM specifically
    if (hour === 20) {
      times.push(`8:45 PM`);
    }
  }
  return times;
};

export const getCurrentRoutine = (dayNumber: number): RoutineItem[] => {
  const times = generateTimes();
  return times.map(time => {
    if (time === '6:00 AM') {
      return { time, activity: 'Wake up, make bed, brush teeth, shower', category: '' };
    } else if (time === '6:30 AM') {
      return { time, activity: 'Walk', category: '' };
    } else if (time === '7:00 AM - 10:00 AM') {
      return { time, activity: 'Coding & Website', category: '' };
    } else if (time === '10:30 AM - 2:00 PM') {
      return { time, activity: 'Podcasts & Media', category: '' };
    } else if (time === '2:30 PM - 5:00 PM') {
      return { time, activity: 'Art & Music', category: '' };
    } else if (time === '10:00 AM') {
      return { time, activity: 'Breakfast & Vitamins', category: '' };
    } else if (time === '2:00 PM') {
      return { time, activity: 'Lunch', category: '' };
    } else if (time === '5:00 PM') {
      // Weekly tasks
      if (dayNumber === 1) return { time, activity: 'Grooming', category: '' };
      if (dayNumber === 2) return { time, activity: 'Laundry', category: '' };
      if (dayNumber === 3) return { time, activity: 'Groceries', category: '' };
      if (dayNumber === 4) return { time, activity: 'Cleaning', category: '' };
      if (dayNumber === 5) return { time, activity: 'Plants / mail', category: '' };
      if (dayNumber === 6) return { time, activity: 'Meal Prep', category: '' };
      return { time, activity: '', category: '' };
    } else if (time === '6:00 PM') {
      return { time, activity: 'Dinner', category: '' };
    } else if (time === '7:00 PM') {
      if (dayNumber === 1 || dayNumber === 3 || dayNumber === 5) {
        return { time, activity: 'Workout', category: '' };
      } else {
        return { time, activity: 'Basketball', category: '' };
      }
    } else if (time === '9:00 PM') {
      return { time, activity: 'Read', category: '' };
    } else if (time === '10:00 PM') {
      return { time, activity: 'Pray, sleep', category: '' };
    } else if (time === '8:00 PM') {
      return { time, activity: 'Walk', category: '' };
    } else if (time === '8:45 PM') {
      return { time, activity: 'Shower and brush teeth', category: '' };
    } else if (time === '6:45 PM') {
      return { time, activity: 'Yoga', category: '' };
    } else {
      return { time, activity: '', category: '' };
    }
  });
};

export const isCurrentTime = (time: string) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Handle the special 7:00 AM - 10:00 AM combined slot
  if (time === '7:00 AM - 10:00 AM') {
    return currentHour >= 7 && currentHour <= 9;
  }
  
  // Handle the special 10:30 AM - 2:00 PM combined slot
  if (time === '10:30 AM - 2:00 PM') {
    return (currentHour === 10 && currentMinute >= 30) || (currentHour >= 11 && currentHour <= 13);
  }
  
  // Handle the special 2:30 PM - 5:00 PM combined slot
  if (time === '2:30 PM - 5:00 PM') {
    return (currentHour === 14 && currentMinute >= 30) || (currentHour >= 15 && currentHour <= 16);
  }
  
  // Handle specific minute times
  if (time === '6:30 AM') {
    return currentHour === 6 && currentMinute >= 30 && currentMinute < 60;
  }
  
  if (time === '6:45 PM') {
    return currentHour === 18 && currentMinute >= 45 && currentMinute < 60;
  }
  
  if (time === '8:45 PM') {
    return currentHour === 20 && currentMinute >= 45 && currentMinute < 60;
  }
  
  const timeHour = parseInt(time.split(':')[0]);
  const timeAMPM = time.includes('PM') ? 'PM' : 'AM';
  
  // Convert time to 24-hour format for comparison
  let time24Hour = timeHour;
  if (timeAMPM === 'PM' && timeHour !== 12) {
    time24Hour = timeHour + 12;
  } else if (timeAMPM === 'AM' && timeHour === 12) {
    time24Hour = 0;
  }
  
  // Special handling for 10:00 AM to exclude 10:30+ time
  if (time === '10:00 AM') {
    return currentHour === 10 && currentMinute < 30;
  }
  
  // Special handling for 2:00 PM to exclude 2:30+ time
  if (time === '2:00 PM') {
    return currentHour === 14 && currentMinute < 30;
  }
  
  return currentHour === time24Hour;
};

export const getCurrentAndNextTask = (currentDate: OrbitalDate) => {
  const routines = getCurrentRoutine(currentDate.weekDay);
  let currentTask = null;
  let nextTask = null;

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