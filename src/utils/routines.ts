import { OrbitalDate, orbitalCalendar } from './orbitalCalendar';

export interface Routine {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  orbitalDate: OrbitalDate;
  gregorianDate: Date;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  tags: string[];
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  tags: string[];
  // Conditions for when this routine should be applied
  conditions: {
    monthNumbers?: number[]; // Specific months when this applies
    dayNumbers?: number[];   // Specific days when this applies
    weekDayNumbers?: number[]; // Specific week days when this applies
    specialDays?: ('urobor' | 'leap-day')[]; // Special days when this applies
  };
}

export class RoutinesManager {
  private routines: Routine[] = [];
  private templates: RoutineTemplate[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Daily routine templates based on week day themes
    this.templates = [
      {
        id: 'monday-planning',
        title: 'Monday Planning Session',
        description: 'Start the week with goal setting and planning',
        type: 'daily',
        category: 'planning',
        priority: 'high',
        estimatedDuration: 30,
        tags: ['planning', 'monday', 'goals'],
        conditions: {
          weekDayNumbers: [1] // Monday
        }
      },
      {
        id: 'creative-friday',
        title: 'Creative Friday',
        description: 'Dedicated time for creative projects and innovation',
        type: 'daily',
        category: 'creativity',
        priority: 'medium',
        estimatedDuration: 60,
        tags: ['creativity', 'friday', 'projects'],
        conditions: {
          weekDayNumbers: [5] // Friday
        }
      },
      {
        id: 'sunday-reflection',
        title: 'Sunday Reflection',
        description: 'End the week with reflection and preparation for the next',
        type: 'daily',
        category: 'mindfulness',
        priority: 'medium',
        estimatedDuration: 20,
        tags: ['reflection', 'sunday', 'mindfulness'],
        conditions: {
          weekDayNumbers: [7] // Sunday
        }
      },
      {
        id: 'month-beginning',
        title: 'Month Beginning Ritual',
        description: 'Set intentions and goals for the new month',
        type: 'monthly',
        category: 'planning',
        priority: 'high',
        estimatedDuration: 45,
        tags: ['planning', 'month', 'goals'],
        conditions: {
          dayNumbers: [1, 2, 3] // First few days of each month
        }
      },
      {
        id: 'month-end-review',
        title: 'Month End Review',
        description: 'Review accomplishments and lessons from the month',
        type: 'monthly',
        category: 'reflection',
        priority: 'medium',
        estimatedDuration: 30,
        tags: ['review', 'month', 'reflection'],
        conditions: {
          dayNumbers: [26, 27, 28] // Last few days of each month
        }
      },
      {
        id: 'urobor-celebration',
        title: 'Urobor Celebration',
        description: 'Special activities and traditions for Urobor day',
        type: 'daily',
        category: 'celebration',
        priority: 'high',
        estimatedDuration: 120,
        tags: ['celebration', 'urobor', 'special'],
        conditions: {
          specialDays: ['urobor']
        }
      },
      {
        id: 'leap-day-adventure',
        title: 'Leap Day Adventure',
        description: 'Try something new and adventurous on this extra day',
        type: 'daily',
        category: 'adventure',
        priority: 'medium',
        estimatedDuration: 180,
        tags: ['adventure', 'leap-day', 'special'],
        conditions: {
          specialDays: ['leap-day']
        }
      }
    ];
  }

  /**
   * Get routines for a specific orbital date
   */
  getRoutinesForDate(orbitalDate: OrbitalDate): Routine[] {
    return this.routines.filter(routine => 
      routine.orbitalDate.year === orbitalDate.year &&
      routine.orbitalDate.month === orbitalDate.month &&
      routine.orbitalDate.day === orbitalDate.day
    );
  }

  /**
   * Get routine templates that apply to a specific orbital date
   */
  getTemplatesForDate(orbitalDate: OrbitalDate): RoutineTemplate[] {
    return this.templates.filter(template => {
      const conditions = template.conditions;
      
      // Check month numbers
      if (conditions.monthNumbers && !conditions.monthNumbers.includes(orbitalDate.month)) {
        return false;
      }
      
      // Check day numbers
      if (conditions.dayNumbers && !conditions.dayNumbers.includes(orbitalDate.day)) {
        return false;
      }
      
      // Check week day numbers
      if (conditions.weekDayNumbers && !conditions.weekDayNumbers.includes(orbitalDate.weekDay)) {
        return false;
      }
      
      // Check special days
      if (conditions.specialDays && orbitalDate.isSpecialDay && orbitalDate.specialDayType) {
        if (!conditions.specialDays.includes(orbitalDate.specialDayType)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Create a new routine from a template
   */
  createRoutineFromTemplate(templateId: string, orbitalDate: OrbitalDate): Routine {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const routine: Routine = {
      id: `${templateId}-${orbitalDate.year}-${orbitalDate.month}-${orbitalDate.day}`,
      title: template.title,
      description: template.description,
      type: template.type,
      orbitalDate,
      gregorianDate: orbitalCalendar.orbitalToGregorian(orbitalDate),
      completed: false,
      category: template.category,
      priority: template.priority,
      estimatedDuration: template.estimatedDuration,
      tags: template.tags
    };

    this.routines.push(routine);
    return routine;
  }

  /**
   * Add a custom routine
   */
  addCustomRoutine(routine: Omit<Routine, 'id'>): Routine {
    const newRoutine: Routine = {
      ...routine,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.routines.push(newRoutine);
    return newRoutine;
  }

  /**
   * Mark a routine as completed
   */
  completeRoutine(routineId: string): void {
    const routine = this.routines.find(r => r.id === routineId);
    if (routine) {
      routine.completed = true;
    }
  }

  /**
   * Get routines for a specific month
   */
  getRoutinesForMonth(year: number, month: number): Routine[] {
    return this.routines.filter(routine => 
      routine.orbitalDate.year === year && routine.orbitalDate.month === month
    );
  }

  /**
   * Get completion statistics for a month
   */
  getMonthStats(year: number, month: number): {
    total: number;
    completed: number;
    completionRate: number;
    byCategory: Record<string, { total: number; completed: number }>;
  } {
    const monthRoutines = this.getRoutinesForMonth(year, month);
    const completed = monthRoutines.filter(r => r.completed);
    
    const byCategory: Record<string, { total: number; completed: number }> = {};
    monthRoutines.forEach(routine => {
      if (!byCategory[routine.category]) {
        byCategory[routine.category] = { total: 0, completed: 0 };
      }
      byCategory[routine.category].total++;
      if (routine.completed) {
        byCategory[routine.category].completed++;
      }
    });

    return {
      total: monthRoutines.length,
      completed: completed.length,
      completionRate: monthRoutines.length > 0 ? (completed.length / monthRoutines.length) * 100 : 0,
      byCategory
    };
  }

  /**
   * Get all routine templates
   */
  getAllTemplates(): RoutineTemplate[] {
    return [...this.templates];
  }

  /**
   * Get all routines
   */
  getAllRoutines(): Routine[] {
    return [...this.routines];
  }

  /**
   * Delete a routine
   */
  deleteRoutine(routineId: string): boolean {
    const index = this.routines.findIndex(r => r.id === routineId);
    if (index !== -1) {
      this.routines.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export a default instance
export const routinesManager = new RoutinesManager(); 