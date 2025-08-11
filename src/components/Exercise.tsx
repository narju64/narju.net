import React from 'react';
import './Exercise.css';
import { orbitalCalendar } from '../utils/orbitalCalendar';
import { buildApiUrl } from '../utils/api';

interface Exercise {
  name: string;
  reps: string;
  sets: string;
  rest: string;
  targetMuscles: string[];
}

interface ExerciseWorkout {
  name: string;
  type: 'strength' | 'hypertrophy' | 'rest';
  duration: string;
  exercises?: Exercise[];
  equipment?: string[];
  schedule: string;
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: ExerciseWorkout[];
  };
}

const Exercise: React.FC = () => {
  const [workouts, setWorkouts] = React.useState<ExerciseWorkout[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const loggedIn = !!(localStorage.getItem('currentUser') && localStorage.getItem('authToken'));
    setIsLoggedIn(loggedIn);
    
    // If logged in, fetch from API
    if (loggedIn) {
      fetchWorkoutsFromApi();
    }
  }, []);

  const fetchWorkoutsFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl('/api/lists/exercise'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API Response:', data);
      
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        setWorkouts(data.list.items_json);
      } else {
        setError('No exercise data available');
      }
    } catch (err) {
      console.error('Error fetching workouts from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };



  // Get current orbital day of the week
  const getCurrentDay = () => {
    const currentOrbitalDate = orbitalCalendar.getCurrentOrbitalDate();
    return orbitalCalendar.getWeekDayName(currentOrbitalDate.weekDay);
  };

  const currentDay = getCurrentDay();

  // Check if a workout is scheduled for today
  const isWorkoutToday = (workout: ExerciseWorkout) => {
    if (workout.type === 'rest') {
      return workout.schedule === currentDay;
    }
    return workout.schedule.includes(currentDay);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'strength': '#9b59b6',
      'hypertrophy': '#e74c3c',
      'rest': '#27ae60'
    };
    return colors[type] || '#95a5a6';
  };



  const getTypeBackgroundTint = (type: string) => {
    const tints: { [key: string]: string } = {
      'strength': 'rgba(155, 89, 182, 0.05)',
      'hypertrophy': 'rgba(231, 76, 60, 0.05)',
      'rest': 'rgba(39, 174, 96, 0.05)'
    };
    return tints[type] || 'transparent';
  };

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="exercise-page">
        <div className="exercise-header">
          <h1>Exercise Routine</h1>
          <p>Please log in to view your exercise routine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <h1>Exercise Routine</h1>
        <div className="exercise-stats">
          <span>Weekly workouts: 6</span>
          <span>Total time: ~5.5 hours</span>
          <span>Focus: Upper Body, Vertical Training, Core</span>
        </div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e67e22', fontWeight: 'bold' }}>
            Loading workouts from database...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e53e3e' }}>
            Error loading exercise data: {error}
          </div>
        )}
      </div>

      

             <div className="exercise-grid-container">
         <div className="exercise-grid">
           {/* First column with Upper Body Strength and Rest Day */}
           <div className="workout-column">
                           {workouts.filter(workout => workout.name === 'Upper Body Strength' || workout.name === 'Rest Day').map((workout, index) => (
                <div key={index} className={`workout-card ${isWorkoutToday(workout) ? 'today-highlight' : ''}`}>
               <div 
                 className="workout-header"
                 style={{ 
                   borderLeftColor: getTypeColor(workout.type),
                   backgroundColor: getTypeBackgroundTint(workout.type)
                 }}
               >
                 <div className="workout-title">
                   <h4>{workout.name}</h4>
                   <div className="workout-meta">
                     <span className="workout-type" style={{ color: getTypeColor(workout.type) }}>
                       {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                     </span>
                     <span className="workout-duration" style={workout.type === 'rest' ? { color: '#ff7300', textTransform: 'uppercase', fontWeight: '600' } : {}}>
                       {workout.duration}
                     </span>
                   </div>
                 </div>
               </div>
                                                               {(workout.type !== 'rest' || workout.exercises || (workout.equipment && workout.equipment.length > 0)) && (
                  <div className="workout-content">
                                         {workout.type !== 'rest' && (
                       <div className="workout-schedule">
                         {workout.schedule}
                       </div>
                     )}
                    {workout.exercises && (
                      <div className="exercise-table-container">
                        <table className="exercise-table">
                          <thead>
                            <tr>
                              <th>Exercise</th>
                              <th>Reps</th>
                              <th>Sets</th>
                              <th>Rest</th>
                              <th>Target Muscles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workout.exercises.map((exercise, index) => {
                              // Add a section break before core exercises (only for exercises that are primarily core-focused)
                              const isCoreExercise = exercise.targetMuscles.some(muscle => 
                                muscle.toLowerCase().includes('abs') || 
                                muscle.toLowerCase().includes('obliques') ||
                                (muscle.toLowerCase().includes('core') && !muscle.toLowerCase().includes('lower back'))
                              );
                              
                              const showCoreBreak = index > 0 && isCoreExercise && 
                                workout.exercises && !workout.exercises[index - 1].targetMuscles.some(muscle => 
                                  muscle.toLowerCase().includes('abs') || 
                                  muscle.toLowerCase().includes('obliques') ||
                                  (muscle.toLowerCase().includes('core') && !muscle.toLowerCase().includes('lower back'))
                                );
                             
                             return (
                               <React.Fragment key={index}>
                                 {showCoreBreak && (
                                   <tr className="section-break">
                                     <td colSpan={5}>
                                       <div className="core-section-header">Core</div>
                                     </td>
                                   </tr>
                                 )}
                                 <tr>
                                   <td>{exercise.name}</td>
                                   <td>{exercise.reps}</td>
                                   <td>{exercise.sets}</td>
                                   <td>{exercise.rest}</td>
                                   <td>{exercise.targetMuscles.join(', ')}</td>
                                 </tr>
                               </React.Fragment>
                             );
                           })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {workout.equipment && workout.equipment.length > 0 && (
                      <div className="workout-equipment">
                        <strong>Equipment:</strong> {workout.equipment.join(', ')}
                      </div>
                    )}
                  </div>
                )}
               </div>
             ))}
           </div>
           
           {/* Second column with Vertical Training / Core */}
           <div className="workout-column">
                           {workouts.filter(workout => workout.name === 'Vertical Training / Core').map((workout, index) => (
                <div key={index} className={`workout-card ${isWorkoutToday(workout) ? 'today-highlight' : ''}`}>
                 <div 
                   className="workout-header"
                   style={{ 
                     borderLeftColor: getTypeColor(workout.type),
                     backgroundColor: getTypeBackgroundTint(workout.type)
                   }}
                 >
                   <div className="workout-title">
                     <h4>{workout.name}</h4>
                     <div className="workout-meta">
                       <span className="workout-type" style={{ color: getTypeColor(workout.type) }}>
                         {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                       </span>
                       <span className="workout-duration">{workout.duration}</span>
                     </div>
                   </div>
                 </div>
                                   <div className="workout-content">
                    <div className="workout-schedule">
                      {workout.schedule}
                    </div>
                   {workout.exercises && (
                     <div className="exercise-table-container">
                       <table className="exercise-table">
                         <thead>
                           <tr>
                             <th>Exercise</th>
                             <th>Reps</th>
                             <th>Sets</th>
                             <th>Rest</th>
                             <th>Target Muscles</th>
                           </tr>
                         </thead>
                         <tbody>
                           {workout.exercises.map((exercise, index) => {
                             // Add a section break before core exercises (only for exercises that are primarily core-focused)
                             const isCoreExercise = exercise.targetMuscles.some(muscle => 
                               muscle.toLowerCase().includes('abs') || 
                               muscle.toLowerCase().includes('obliques') ||
                               (muscle.toLowerCase().includes('core') && !muscle.toLowerCase().includes('lower back'))
                             );
                             
                             const showCoreBreak = index > 0 && isCoreExercise && 
                               workout.exercises && !workout.exercises[index - 1].targetMuscles.some(muscle => 
                                 muscle.toLowerCase().includes('abs') || 
                                 muscle.toLowerCase().includes('obliques') ||
                                 (muscle.toLowerCase().includes('core') && !muscle.toLowerCase().includes('lower back'))
                               );
                            
                            return (
                              <React.Fragment key={index}>
                                {showCoreBreak && (
                                  <tr className="section-break">
                                    <td colSpan={5}>
                                      <div className="core-section-header">Core</div>
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td>{exercise.name}</td>
                                  <td>{exercise.reps}</td>
                                  <td>{exercise.sets}</td>
                                  <td>{exercise.rest}</td>
                                  <td>{exercise.targetMuscles.join(', ')}</td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                         </tbody>
                       </table>
                     </div>
                   )}
                   {workout.equipment && workout.equipment.length > 0 && (
                     <div className="workout-equipment">
                       <strong>Equipment:</strong> {workout.equipment.join(', ')}
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 };

export default Exercise; 