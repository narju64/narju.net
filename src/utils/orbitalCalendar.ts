export interface OrbitalDate {
  year: number;
  month: number; // 1-13 for regular months, 0 for special days
  day: number;   // 1-28 for regular days, 1-2 for special days (1=Urobor, 2=Leap Day)
  weekDay: number; // 1-7 for regular days, 0 for special days
  gregorianDate: Date;
  isSpecialDay: boolean; // true for Urobor and Leap Day
  specialDayType?: 'urobor' | 'leap-day';
}

export interface OrbitalCalendarConfig {
  epochYear: number;
  epochMonth: number; // March
  epochDay: number;   // 20 (Spring Equinox)
}

// Orbital Calendar configuration based on Spring Equinox
export const ORBITAL_CONFIG: OrbitalCalendarConfig = {
  epochYear: 2024,
  epochMonth: 3,  // March
  epochDay: 20    // Spring Equinox
};

export class OrbitalCalendar {
  private config: OrbitalCalendarConfig;

  constructor(config: OrbitalCalendarConfig = ORBITAL_CONFIG) {
    this.config = config;
  }

  /**
   * Get month names
   */
  getMonthName(month: number): string {
    const monthNames = [
      'Special',      // 0 - special days
      'April',        // 1
      'Ceres',        // 2
      'May',          // 3
      'June',         // 4
      'July',         // 5
      'Hexember',     // 6
      'September',    // 7
      'October',      // 8
      'November',     // 9
      'December',     // 10
      'January',      // 11
      'February',     // 12
      'March'         // 13
    ];
    return monthNames[month] || 'Unknown';
  }

  /**
   * Get day of week names
   */
  getWeekDayName(weekDay: number): string {
    const weekDayNames = [
      'Special',     // 0 - for Urobor and Leap Day
      'Monday',      // 1
      'Tuesday',     // 2
      'Gaiday',      // 3
      'Quaday',      // 4
      'Friday',      // 5
      'Kinday',      // 6
      'Sunday'       // 7
    ];
    return weekDayNames[weekDay] || 'Unknown';
  }

  /**
   * Check if a year is a leap year in the Gregorian calendar
   */
  isGregorianLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Calculate the day of week for a given date, accounting for special days
   */
  private calculateWeekDay(gregorianDate: Date): number {
    const epoch = new Date(this.config.epochYear, this.config.epochMonth - 1, this.config.epochDay);
    const daysSinceEpoch = Math.floor((gregorianDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate what weekday the epoch was (March 20, 2024)
    // Using a known reference date: January 1, 2024 was a Monday (1)
    const referenceDate = new Date(2024, 0, 1); // January 1, 2024
    const referenceWeekDay = 1; // Monday
    const daysFromReference = Math.floor((epoch.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    const epochWeekDay = ((daysFromReference % 7) + referenceWeekDay);
    const finalEpochWeekDay = epochWeekDay <= 0 ? epochWeekDay + 7 : epochWeekDay > 7 ? epochWeekDay - 7 : epochWeekDay;
    
    // Count special days that have occurred since epoch
    let specialDaysCount = 0;
    const currentYear = gregorianDate.getFullYear();
    
    // Count special days in previous years
    for (let year = this.config.epochYear; year < currentYear; year++) {
      specialDaysCount++; // Urobor every year
      if (this.isGregorianLeapYear(year)) {
        specialDaysCount++; // Leap Day in leap years
      }
    }
    
    // Count special days in current year that occur before this date
    const currentYearUrobor = new Date(currentYear, 11, 25); // December 25
    if (gregorianDate > currentYearUrobor) {
      specialDaysCount++; // Urobor has passed this year
    }
    
    if (this.isGregorianLeapYear(currentYear)) {
      const currentYearLeapDay = new Date(currentYear, 2, 19); // March 19
      if (gregorianDate > currentYearLeapDay) {
        specialDaysCount++; // Leap Day has passed this year
      }
    }
    
    // Adjust for special days and calculate week day
    const adjustedDays = daysSinceEpoch - specialDaysCount;
    const weekDay = ((adjustedDays % 7) + finalEpochWeekDay);
    return weekDay <= 0 ? weekDay + 7 : weekDay > 7 ? weekDay - 7 : weekDay;
  }

  /**
   * Get month ranges for a specific year, accounting for leap years
   */
  private getMonthRanges(year: number): Array<{ start: Date; end: Date }> {
    // For leap day calculation, we need to check if the NEXT Gregorian year is a leap year
    // because the Orbital year spans into the next Gregorian year
    const isLeapYear = this.isGregorianLeapYear(year + 1);
    
    return [
      { start: new Date(year, 2, 20), end: new Date(year, 3, 16) },   // April
      { start: new Date(year, 3, 17), end: new Date(year, 4, 14) },   // Ceres
      { start: new Date(year, 4, 15), end: new Date(year, 5, 11) },   // May
      { start: new Date(year, 5, 12), end: new Date(year, 6, 9) },    // June
      { start: new Date(year, 6, 10), end: new Date(year, 7, 6) },    // July
      { start: new Date(year, 7, 7), end: new Date(year, 8, 3) },     // Hexember
      { start: new Date(year, 8, 4), end: new Date(year, 9, 1) },     // September
      { start: new Date(year, 9, 2), end: new Date(year, 9, 29) },    // October
      { start: new Date(year, 9, 30), end: new Date(year, 10, 26) },  // November
      { start: new Date(year, 10, 27), end: new Date(year, 11, 24) }, // December
      { start: new Date(year, 11, 26), end: new Date(year, 0, 22) },  // January
      { start: new Date(year + 1, 0, 23), end: new Date(year + 1, 1, 19) },   // February (spans year boundary)
      { 
        start: new Date(year + 1, 1, 20), 
        end: isLeapYear ? new Date(year + 1, 2, 18) : new Date(year + 1, 2, 19)  // March (spans year boundary, adjusted for leap year)
      }
    ];
  }

  /**
   * Convert a Gregorian date to Orbital Calendar date
   */
  gregorianToOrbital(gregorianDate: Date): OrbitalDate {
    const epoch = new Date(this.config.epochYear, this.config.epochMonth - 1, this.config.epochDay);
    const daysSinceEpoch = Math.floor((gregorianDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
    
    // Handle negative dates (before epoch)
    if (daysSinceEpoch < 0) {
      throw new Error('Dates before the Spring Equinox epoch are not supported');
    }

    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();
    const year = gregorianDate.getFullYear();
    
    // Check for Urobor (December 25)
    if (gregorianMonth === 12 && gregorianDay === 25) {
      return {
        year,
        month: 0,
        day: 1, // Urobor is day 1 of month 0
        weekDay: 0,
        gregorianDate: new Date(gregorianDate),
        isSpecialDay: true,
        specialDayType: 'urobor'
      };
    }

    // Check for Leap Day (March 19 in leap years)
    if (this.isGregorianLeapYear(year) && gregorianMonth === 3 && gregorianDay === 19) {
      return {
        year: year - 1, // The Orbital year that contains this leap day is the previous year
        month: 0,
        day: 2, // Leap Day is day 2 of month 0
        weekDay: 0,
        gregorianDate: new Date(gregorianDate),
        isSpecialDay: true,
        specialDayType: 'leap-day'
      };
    }

    // Regular day calculation
    // We need to calculate which month this falls into based on the actual date ranges
    let month = 0;
    let day = 0;
    
    // Get month ranges for this specific year
    const monthRanges = this.getMonthRanges(year);

    // Find which month this date belongs to
    for (let i = 0; i < monthRanges.length; i++) {
      const range = monthRanges[i];
      if (gregorianDate >= range.start && gregorianDate <= range.end) {
        month = i + 1;
        // Calculate day within the month
        const daysInRange = Math.floor((gregorianDate.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
        day = daysInRange + 1;
        break;
      }
    }

    if (month === 0) {
      throw new Error('Date not found in any month range');
    }

    const weekDay = this.calculateWeekDay(gregorianDate);

    return {
      year,
      month,
      day,
      weekDay,
      gregorianDate: new Date(gregorianDate),
      isSpecialDay: false
    };
  }

  /**
   * Convert an Orbital Calendar date to Gregorian date
   */
  orbitalToGregorian(orbitalDate: OrbitalDate): Date {
    if (orbitalDate.isSpecialDay) {
      if (orbitalDate.specialDayType === 'urobor') {
        // Urobor is December 25
        return new Date(orbitalDate.year, 11, 25); // December 25
      } else if (orbitalDate.specialDayType === 'leap-day') {
        // Leap Day is March 19 of the NEXT Gregorian year
        return new Date(orbitalDate.year + 1, 2, 19); // March 19
      }
    }

    // For regular days, we need to calculate based on the month ranges
    const monthRanges = this.getMonthRanges(orbitalDate.year);
    const range = monthRanges[orbitalDate.month - 1];
    
    // Simply add the day offset to the start date
    const gregorianDate = new Date(range.start);
    gregorianDate.setDate(range.start.getDate() + orbitalDate.day - 1);
    
    return gregorianDate;
  }

  /**
   * Get current Orbital date
   */
  getCurrentOrbitalDate(): OrbitalDate {
    return this.gregorianToOrbital(new Date());
  }

  /**
   * Format an Orbital date as a string
   */
  formatOrbitalDate(orbitalDate: OrbitalDate, includeGregorian: boolean = true): string {
    if (orbitalDate.isSpecialDay) {
      let formatted = `${orbitalDate.specialDayType === 'urobor' ? 'Urobor' : 'Leap Day'} (${orbitalDate.month.toString().padStart(2, '0')}/${orbitalDate.day.toString().padStart(2, '0')}/${orbitalDate.year})`;
      if (includeGregorian) {
        formatted += ` (${orbitalDate.gregorianDate.toLocaleDateString()})`;
      }
      return formatted;
    }

    const monthName = this.getMonthName(orbitalDate.month);
    const weekDayName = this.getWeekDayName(orbitalDate.weekDay);
    
    let formatted = `${weekDayName}, ${monthName} ${orbitalDate.day}, Year ${orbitalDate.year}`;
    
    if (includeGregorian) {
      formatted += ` (${orbitalDate.gregorianDate.toLocaleDateString()})`;
    }
    
    return formatted;
  }

  /**
   * Get all days in a specific month
   */
  getDaysInMonth(year: number, month: number): OrbitalDate[] {
    if (month === 0) {
      // Special days
      const specialDays: OrbitalDate[] = [];
      
      // Add Urobor
      const uroborDate = new Date(year, 11, 25); // December 25
      specialDays.push({
        year,
        month: 0,
        day: 1,
        weekDay: 0,
        gregorianDate: uroborDate,
        isSpecialDay: true,
        specialDayType: 'urobor'
      });

      // Add Leap Day if the NEXT Gregorian year is a leap year
      // because the Orbital year spans into the next Gregorian year
      if (this.isGregorianLeapYear(year + 1)) {
        const leapDayDate = new Date(year + 1, 2, 19); // March 19 of the next year
        specialDays.push({
          year,
          month: 0,
          day: 2,
          weekDay: 0,
          gregorianDate: leapDayDate,
          isSpecialDay: true,
          specialDayType: 'leap-day'
        });
      }

      return specialDays;
    }

    const days: OrbitalDate[] = [];
    for (let day = 1; day <= 28; day++) {
      const orbitalDate: OrbitalDate = {
        year,
        month,
        day,
        weekDay: 0, // Will be calculated properly
        gregorianDate: new Date(), // Will be calculated properly
        isSpecialDay: false
      };
      orbitalDate.gregorianDate = this.orbitalToGregorian(orbitalDate);
      orbitalDate.weekDay = this.calculateWeekDay(orbitalDate.gregorianDate);
      days.push(orbitalDate);
    }
    return days;
  }

  /**
   * Get all months in a year
   */
  getMonthsInYear(year: number): OrbitalDate[][] {
    const months: OrbitalDate[][] = [];
    
    // Add regular months (1-13)
    for (let month = 1; month <= 13; month++) {
      months.push(this.getDaysInMonth(year, month));
    }
    
    // Add special days (month 0)
    months.unshift(this.getDaysInMonth(year, 0));
    
    return months;
  }

  /**
   * Get Gregorian date range for a month
   */
  getGregorianRangeForMonth(year: number, month: number): { start: Date; end: Date } {
    if (month === 0) {
      // Special days
      return {
        start: new Date(year, 11, 25), // December 25
        end: new Date(year, 11, 25)
      };
    }

    // Get month ranges for this specific year
    const monthRanges = this.getMonthRanges(year);
    return monthRanges[month - 1];
  }
}

// Export a default instance
export const orbitalCalendar = new OrbitalCalendar(); 