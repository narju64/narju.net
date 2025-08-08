# Backend Development Plan - Website

## Overview
Backend system to support a personal website with multiple features including diet tracking, curated lists (albums, NBA players, etc.), and user management capabilities.

## Core Requirements

### 1. User Management System
- **Admin Account**: Primary admin user (you) with full privileges
- **User Authentication**: Secure login/logout system for entire website
- **User Roles**: Admin and regular user roles
- **User Profiles**: Store user preferences and settings across all features
- **Session Management**: Secure session handling with JWT tokens
- **Website-Wide Access**: Users can access all features they have permission for

### 2. Diet Page Management
- **Meal Tracking**: Save and track meals over multiple days
- **Ingredient Management**: 
  - Add new ingredients to the database
  - Edit existing ingredients (nutrition values, names, categories)
  - Delete ingredients (with confirmation)
- **Meal Management**:
  - Save personal meal combinations
  - Track daily meal selections
  - View meal history and analytics
- **Personalized Content**: Users see blank/default content until they log in and personalize

### 3. Content Management System
- **Curated Lists**: Manage various lists (albums, NBA players, etc.)
- **Routine Management**: Edit workout routines and fitness content
- **Content Organization**: Categorize and organize different types of content
- **Admin Control**: Full control over all website content
- **Future Expansion**: Easy to add new content types and features
- **Mixed Visibility**: Some content public (lists), some private (personal routines)

### 4. List Management System
- **Drag & Drop Interface**: Reorder lists visually (albums, NBA players, etc.)
- **Real-time Updates**: Changes reflect immediately across all users
- **List Operations**:
  - Add new items to lists
  - Remove items from lists
  - Reorder items via drag & drop
  - Create new list categories
- **Admin Control**: Only admin can modify system lists
- **Public Visibility**: Lists are visible to all users (logged in or not)

### 5. Data Management
- **Ingredient Database**: Centralized ingredient storage
- **Meal Data**: User-created meals and daily tracking
- **List Data**: System lists (albums, NBA players, etc.) with ordering
- **User Data**: Individual user's saved meals, preferences, and tracking history
- **Content Data**: Various website content and media
- **Data Validation**: Ensure data accuracy across all content types
- **Backup System**: Regular data backups

### 6. User Personalization
- **Website-Wide Preferences**: User settings and preferences across all features
- **Personal Meal Collections**: Users can save their own meal combinations
- **Daily Tracking**: Track meals and nutrition over time
- **User Preferences**: Dietary restrictions, favorite ingredients, etc.
- **Usage Analytics**: Track most used ingredients/meals per user

## Additional Feature Suggestions

### 7. Enhanced User Experience
- **Search & Filter**: Advanced ingredient search with filters (category, macros, etc.)
- **Nutrition Goals**: Set and track personal nutrition targets
- **Meal Planning**: Weekly meal planning functionality
- **Shopping Lists**: Generate shopping lists from planned meals
- **Recipe Sharing**: Users can share meal combinations
- **Nutrition Insights**: Analytics and recommendations

### 8. Admin Features
- **User Management**: View and manage all users
- **Usage Analytics**: Dashboard showing popular ingredients/meals
- **Content Moderation**: Review and approve user-generated content
- **System Health**: Monitor backend performance and usage

### 9. Data & API Features
- **RESTful API**: Clean API endpoints for frontend integration
- **Real-time Updates**: WebSocket support for live updates
- **Data Export**: Export user data in various formats
- **API Rate Limiting**: Prevent abuse and ensure performance (per user/IP)
- **Caching Strategy**: Cache public content (lists, ingredients) for performance
- **Data Migration**: Tools to migrate existing hardcoded data to database
- **Error Handling**: Comprehensive error logging and user-friendly error responses
- **CORS Configuration**: Proper setup for Netlify frontend to Railway backend

## Technical Architecture

### Database Schema
```
Users:
- id, email, username, password_hash, role, created_at, last_login

Ingredients:
- id, name, calories, protein, fat, carbs, sugar, fiber, category, serving_size, serving_unit

UserMeals:
- id, user_id, name, ingredients_json, created_at, is_daily_meal

DailyMeals:
- id, user_id, date, meals_json, total_nutrition

UserPreferences:
- user_id, dietary_restrictions, nutrition_goals, theme_preferences

Lists:
- id, name, category, items_json, order_index, created_at, updated_at

UserRoutineSchedule:
- id, user_id, day_number, time_slot, activity, category, time_range_json, created_at, updated_at

UserExerciseWorkouts:
- id, user_id, name, type, duration, schedule, equipment_json, created_at, updated_at

UserExercises:
- id, workout_id, name, reps, sets, rest, target_muscles_json, order_index, created_at

Content:
- id, type, title, content_json, created_at, updated_at
```

### API Endpoints
```
Authentication:
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
GET /api/auth/me

Ingredients:
GET /api/ingredients
POST /api/ingredients (admin)
PUT /api/ingredients/:id (admin)
DELETE /api/ingredients/:id (admin)
GET /api/ingredients/search

User Meals:
GET /api/user/meals
POST /api/user/meals
PUT /api/user/meals/:id
DELETE /api/user/meals/:id
GET /api/user/daily-meals
POST /api/user/daily-meals

Lists:
GET /api/lists
GET /api/lists/:category
POST /api/lists/:category/items (admin)
PUT /api/lists/:category/items/:id (admin)
DELETE /api/lists/:category/items/:id (admin)
PUT /api/lists/:category/reorder (admin)

User Routine Schedule:
GET /api/user/routine-schedule
POST /api/user/routine-schedule
PUT /api/user/routine-schedule/:id
DELETE /api/user/routine-schedule/:id

User Exercise Workouts:
GET /api/user/exercise-workouts
POST /api/user/exercise-workouts
PUT /api/user/exercise-workouts/:id
DELETE /api/user/exercise-workouts/:id

User Exercises:
GET /api/user/exercises/:workoutId
POST /api/user/exercises
PUT /api/user/exercises/:id
DELETE /api/user/exercises/:id
PUT /api/user/exercises/:workoutId/reorder

Content:
GET /api/content/:type
POST /api/content (admin)
PUT /api/content/:id (admin)
DELETE /api/content/:id (admin)

Users:
GET /api/users (admin)
PUT /api/users/:id
DELETE /api/users/:id (admin)

User Data:
GET /api/user/preferences
PUT /api/user/preferences
```

## Technology Stack Recommendations

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (good for relational data and JSON fields)
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Real-time**: Socket.io for live updates
- **Validation**: Joi or Zod for data validation
- **Testing**: Jest for unit and integration tests

### Deployment
- **Backend**: Railway (as planned)
- **Database**: Railway PostgreSQL add-on
- **Frontend**: Netlify (as planned)
- **Environment**: Separate dev/staging/production environments

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Set up project structure
- Database schema and migrations
- Basic authentication system
- Core API endpoints for ingredients and meals
- Data migration tools for existing hardcoded content

### Phase 2: Admin Features (Week 3-4)
- Admin dashboard
- Online editing interface
- Drag & drop functionality
- Real-time updates

### Phase 3: User Features (Week 5-6)
- User registration and profiles
- Personalization features
- User-specific data management

### Phase 4: Enhancement (Week 7-8)
- Advanced features (search, analytics, etc.)
- Performance optimization
- Testing and bug fixes

## Security Considerations
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Secure password storage
- HTTPS enforcement
- Regular security audits

## Future Considerations
- Mobile app support
- Social features (sharing, following)
- Integration with fitness trackers
- AI-powered meal suggestions
- Barcode scanning for ingredients
- Nutritional database API integration

## Implementation Decisions

### User Management
- **User Registration**: Users can create their own accounts with email, username, and password
- **Admin Users**: Single admin account (you) with full privileges
- **User Data**: Store basic user preferences and saved meals (no extensive analytics)

### Content Visibility & Editability
- **Public Content (Visible to All)**:
  - Lists: Albums, NBA players, and other curated lists
  - Ingredients: Diet/nutrition database (read-only for public)
- **Personal Content (User-Specific)**:
  - Weekly Routine Schedule: Personal daily activities and schedules
  - Exercise Workouts: Personal workout routines and preferences
  - User Meals: Personal meal tracking and combinations
- **Admin-Only Editable**:
  - System lists (albums, NBA players, etc.)
  - Ingredient database
  - General website content
- **User Creation**: Users can create their own routines and workouts

### Priority Features
1. **Admin Authentication**: Secure admin login system
2. **List Management**: Drag & drop reordering for albums, NBA players, and future lists
3. **Content Management**: Edit routines, workouts, and other hardcoded content
4. **Diet Page Backend**: User accounts, meal tracking, ingredient management
5. **User Accounts**: Self-registration for regular users

### Development Philosophy
- **Personal-First**: Primary focus is admin interface for personal content management
- **Incremental Development**: Build one feature at a time, not everything simultaneously
- **MVP Approach**: Start with core functionality, add features as needed
- **Future-Proof**: Architecture supports potential additions but doesn't require them
- **Flexible Scope**: Features can be added, modified, or skipped based on actual needs

### Future Considerations
- External nutrition database integration (lower priority)
- Advanced analytics and insights
- Social features and sharing
- Performance optimization with caching
- Data backup and recovery strategies 