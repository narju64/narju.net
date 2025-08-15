# Diet System Upgrade Plan

## Overview
This document outlines the current state of the diet tracking system and the planned upgrade to integrate it with our user-based backend system. The goal is to move from localStorage-based tracking to a comprehensive database-backed system with advanced analytics and weight tracking.

## Current State Analysis

### What We Currently Have ✅ PHASE 1.7 COMPLETED + MEAL HISTORY IMPLEMENTATION

#### Frontend Components
- **Diet.tsx**: Main diet tracking component with comprehensive functionality
- **Ingredient Management**: 
  - Preset ingredients database (API-fetched from `/api/diet/preset-ingredients`)
  - Category-based filtering (protein, vegetables, fats, nuts-seeds, seasonings, beverages, fruits, dairy)
  - Serving size selectors with multipliers (0.25x to 20x)
  - Real-time nutrition calculations
  - **Custom Ingredients**: ✅ Full interface for creating, editing, and managing user ingredients
  - **Ingredient Hiding**: ✅ Users can hide both preset and custom ingredients
  - **Hidden Ingredients Tab**: ✅ Dedicated tab for viewing and restoring hidden ingredients

#### Meal Building System
- **Current Meal Panel**: 
  - Add/remove ingredients with quantity controls
  - Real-time nutrition totals (calories, protein, fat, carbs, sugar, fiber)
  - Calorie distribution analysis (protein 20-30%, fat 70-80%, carbs 0-10%)
  - Meal naming and type selection (breakfast, lunch, dinner, snack)
  - Duplicate prevention for main meals per day

#### Meal Management
- **Saved Meals**: 
  - Save custom meals to database (`user_saved_meals` table)
  - Load saved meals from database
  - Meal duplication prevention
  - Delete saved meals functionality
  - **UI Improvements**: ✅ Clickable meal cards, delete button repositioned, improved ingredient display

#### Daily Tracking
- **Daily Meals Panel**: 
  - Track all meals for the current day
  - Daily nutrition totals and calorie distribution
  - Meal type organization
  - Remove meals from daily tracking
  - Data persisted to database (`user_meals` table)

#### Meal History System ✅ NEWLY IMPLEMENTED
- **MealHistory Component**: Complete meal history viewing component
- **Date Selection**: HTML date picker with automatic format conversion
- **Historical Data**: View meals from any selected date
- **Daily Totals**: Calculate and display nutrition totals for selected dates
- **API Integration**: Connected to `/api/diet/meals/history` and `/api/diet/meals/{date}`
- **Route Integration**: New `/lifestyle/diet/history` route in main app
- **Button Integration**: "View Meal History" button positioned in right panel meal header

#### Data Persistence
- **Database Integration**: 
  - Saved meals stored in `user_saved_meals` table
  - Daily meals stored in `user_meals` table
  - **All additional tables created and working**: `user_ingredients`, `user_ingredient_preferences`, `user_weight`
  - Ingredient serving sizes (localStorage for UI state)
  - Current meal serving sizes (localStorage for UI state)
  - Event dispatching for widget updates

#### Home Page Integration ✅ RECENTLY FIXED
- **DailyMealsWidget**: Updated to use user-based API instead of localStorage
- **Smart Date Handling**: Uses local timezone to avoid UTC conversion issues
- **Fallback Loading**: Shows recent meals if no meals for today
- **Dynamic Titles**: Shows "Today's Meals" or "Recent Meals" based on data
- **Proper Authentication**: Only loads meals when user is logged in
- **Data Parsing**: Handles both JSON string and object nutrition data from database

#### User Authentication
- **Login Required**: Diet page requires authentication
- **API Integration**: Fetches ingredients from backend when logged in
- **Backend Storage**: All meals saved to user-specific database tables
- **Fallback System**: Uses hardcoded data when API unavailable

#### Weight Tracking System ✅ RECENTLY FIXED
- **Weight Input**: Daily weight entry with time categories (morning, afternoon, night)
- **Smart Time Slots**: Form only shows available time slots (prevents duplicates)
- **Date Handling**: Fixed timezone issues by using text storage (MM-DD-YYYY format)
- **Unique Constraints**: Proper constraint on (user_id, date, time) allows multiple entries per day
- **Data Persistence**: Weight entries stored in `user_weight` table with proper user isolation
- **Clean Interface**: Removed notes field for streamlined weight tracking

### Current Limitations ❌

#### Data Persistence
- ~~All data stored in localStorage (lost on browser clear/device change)~~ ✅ RESOLVED
- ~~No cross-device synchronization~~ ✅ RESOLVED
- ~~No data backup or recovery~~ ✅ RESOLVED

#### User Experience
- ~~No historical meal tracking beyond current day~~ ✅ RESOLVED - Meal history page implemented
- ~~No weight tracking~~ ✅ RESOLVED
- ~~No analytics or insights~~ ✅ PARTIALLY RESOLVED (basic historical data available)
- ~~Limited to single-day view~~ ✅ RESOLVED (custom ingredients + meal history added)

#### Backend Integration
- ~~Ingredients fetched from API but meals not saved to backend~~ ✅ RESOLVED
- ~~No user-specific meal storage~~ ✅ RESOLVED
- ~~No data sharing between users~~ ✅ RESOLVED

## Planned Features 🚀

### Phase 1: Backend Integration (Immediate Priority)

#### Database Schema
```sql
-- User meals table
CREATE TABLE user_meals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ingredients_json JSONB NOT NULL,
  nutrition_json JSONB NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User weight tracking table
CREATE TABLE user_weight (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one weight entry per user per day
  UNIQUE(user_id, date)
);

-- User saved meals table (for quick access)
CREATE TABLE user_saved_meals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  ingredients_json JSONB NOT NULL,
  nutrition_json JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Preset ingredients table (admin-managed)
CREATE TABLE preset_ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  fat DECIMAL(8,2) NOT NULL,
  carbs DECIMAL(8,2) NOT NULL,
  sugar DECIMAL(8,2) NOT NULL,
  fiber DECIMAL(8,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User ingredient preferences (personalization)
CREATE TABLE user_ingredient_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES preset_ingredients(id) ON DELETE CASCADE,
  is_hidden BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  custom_calories DECIMAL(8,2),
  custom_protein DECIMAL(8,2),
  custom_fat DECIMAL(8,2),
  custom_carbs DECIMAL(8,2),
  custom_sugar DECIMAL(8,2),
  custom_fiber DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, ingredient_id)
);

-- User custom ingredients table
CREATE TABLE user_ingredients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  fat DECIMAL(8,2) NOT NULL,
  carbs DECIMAL(8,2) NOT NULL,
  sugar DECIMAL(8,2) NOT NULL,
  fiber DECIMAL(8,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  serving_size VARCHAR(100) NOT NULL,
  serving_size_value DECIMAL(8,2),
  serving_size_unit VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Backend Routes
```typescript
// POST /api/diet/meals - Save daily meal
// GET /api/diet/meals/:date - Get meals for specific date
// GET /api/diet/meals/history - Get meal history with pagination
// DELETE /api/diet/meals/:id - Delete specific meal

// POST /api/diet/weight - Record weight
// GET /api/diet/weight/history - Get weight history
// PUT /api/diet/weight/:id - Update weight entry

// POST /api/diet/saved-meals - Save custom meal
// GET /api/diet/saved-meals - Get user's saved meals
// PUT /api/diet/saved-meals/:id - Update saved meal
// DELETE /api/diet/saved-meals/:id - Delete saved meal

// GET /api/diet/preset-ingredients - Get all preset ingredients (with user preferences)
// POST /api/diet/preset-ingredients - Add new preset ingredient (admin only)
// PUT /api/diet/preset-ingredients/:id - Update preset ingredient (admin only)
// DELETE /api/diet/preset-ingredients/:id - Delete preset ingredient (admin only)

// POST /api/diet/ingredient-preferences - Set user ingredient preferences
// GET /api/diet/ingredient-preferences - Get user's ingredient preferences
// PUT /api/diet/ingredient-preferences/:id - Update ingredient preference

// POST /api/diet/ingredients - Add custom ingredient
// GET /api/diet/ingredients - Get user's custom ingredients
// PUT /api/diet/ingredients/:id - Update custom ingredient
// DELETE /api/diet/ingredients/:id - Delete custom ingredient
```

### Phase 2: Enhanced Tracking Features

#### Historical Meal Tracking ✅ IMPLEMENTED
- **Meal History Page**: ✅ Complete meal history viewing component
- **Date Navigation**: ✅ HTML date picker with format conversion
- **Meal History**: ✅ View all meals for any selected date
- **Nutrition Trends**: ✅ Daily totals for selected dates
- **Route Integration**: ✅ `/lifestyle/diet/history` route added
- **Button Integration**: ✅ "View Meal History" button in right panel

#### Weight Tracking
- **Weight Input**: Daily weight entry field
- **Weight History**: Chart/graph showing weight changes over time
- **Notes**: Optional notes for each weight entry
- **Trends**: Weight change calculations (weekly, monthly)

#### Custom Ingredients
- **Add Ingredients**: Form to create custom ingredients with full nutrition data
- **User Ingredient Management**: Edit, delete, and organize personal ingredients
- **Category Assignment**: Assign custom ingredients to existing categories
- **Serving Size Control**: Define custom serving sizes and units

### Phase 3: Analytics & Insights

#### Weekly/Monthly Statistics
- **Calorie Averages**: Weekly and monthly calorie averages
- **Macro Averages**: Protein, fat, carb averages over time
- **Calendar Integration**: Support for both Gregorian and Orbital calendars
- **Goal Tracking**: Set and track nutrition goals

#### Advanced Analytics
- **Calorie Expenditure Estimation**: Compare weight changes to calorie intake
- **Trend Analysis**: Identify patterns in eating habits
- **Progress Reports**: Weekly/monthly summary reports
- **Export Functionality**: Data export for external analysis

#### User Preferences
- **Calendar Type**: Choose between Gregorian and Orbital calendars
- **Goal Settings**: Customize nutrition targets
- **Display Preferences**: Customize dashboard layout

## Implementation Checklist 📋

### Phase 1: Backend Integration ✅ COMPLETED

#### Database Setup
- [x] Create migration scripts for new diet tables
- [x] Add diet tables to main migration runner
- [x] Test database schema creation
- [x] Verify foreign key constraints
- [x] Create ingredient migration script
- [x] Migrate hardcoded ingredients to database (36 ingredients)

#### Backend Routes
- [x] Create `/api/diet/meals` routes
- [x] Create `/api/diet/weight` routes  
- [x] Create `/api/diet/saved-meals` routes
- [x] Create `/api/diet/ingredients` routes
- [x] Create `/api/diet/preset-ingredients` route
- [x] Implement proper error handling and validation
- [x] Add authentication middleware to all routes
- [x] Test all endpoints with Postman/Thunder Client

#### Frontend Integration
- [x] Update Diet.tsx to use backend API instead of localStorage
- [x] Implement API calls for fetching ingredients from new diet API
- [x] Remove all preset meal functionality (user-driven system only)
- [x] Implement API calls for saving meals
- [x] Implement API calls for fetching meal history
- [x] Add loading states and error handling
- [x] Maintain localStorage as fallback for offline use
- [x] Test all CRUD operations

#### Weight Tracking System ✅ COMPLETED
- [x] Fix timezone issues with weight date storage
- [x] Update unique constraints for proper time slot management
- [x] Add smart time slot filtering in frontend
- [x] Migrate existing weight data to new schema
- [x] Remove notes field for cleaner interface
- [x] Test weight tracking with multiple time slots per day

### Phase 1.5: Custom Ingredients Interface ✅ COMPLETED

#### User Interface
- [x] Add custom ingredient creation form to Diet page
- [x] Create ingredient management interface for users
- [x] Implement ingredient editing and deletion
- [x] Add ingredient search and filtering

#### Backend Integration
- [x] Implement `/api/diet/user-ingredients` CRUD endpoints
- [x] Implement `/api/diet/user-ingredient-preferences` endpoints
- [x] Add ingredient validation and error handling
- [x] Test user ingredient operations

#### Admin Features
- [ ] Create admin interface to view user ingredients
- [ ] Implement promotion of user ingredients to preset ingredients
- [ ] Add ingredient moderation and approval system
- [ ] Test admin ingredient management

#### Integration
- [x] Merge user ingredients with preset ingredients in UI
- [x] Implement ingredient preference system
- [x] Add ingredient categorization and organization
- [x] Test complete ingredient workflow

#### Home Page Widget Integration ✅ COMPLETED
- [x] Update DailyMealsWidget to use user-based API instead of localStorage
- [x] Fix timezone handling for proper date calculation
- [x] Add fallback loading for recent meals when no meals for today
- [x] Implement proper authentication handling
- [x] Add robust data parsing for nutrition information
- [x] Test widget with various data scenarios

### Phase 1.7: Meal History Implementation ✅ COMPLETED

#### UI Components
- [x] Create MealHistory component with date selection
- [x] Add meal history route to main app
- [x] Position "View Meal History" button in right panel
- [x] Implement date picker with format conversion
- [x] Design meal history display layout

#### Data Management
- [x] Implement date-based meal fetching from API
- [x] Add daily nutrition totals calculation
- [x] Create robust API response handling
- [x] Implement efficient data loading with error states

#### Integration
- [x] Connect to existing meal history API endpoints
- [x] Handle date format conversion (YYYY-MM-DD ↔ MM-DD-YYYY)
- [x] Integrate with existing authentication system
- [x] Test complete meal history workflow

### Phase 2: Historical Tracking ✅ PARTIALLY COMPLETED

#### UI Components
- [x] Add "View Meal History" button to diet page
- [x] Create date picker component
- [x] Design meal history display layout
- [ ] Implement weight input form
- [ ] Create weight history visualization

#### Data Management
- [x] Implement date-based meal fetching
- [ ] Add weight tracking to daily routine
- [x] Create data aggregation functions for daily totals
- [x] Implement efficient data loading

### Phase 3: Analytics & Insights

#### Statistics Engine
- [ ] Create weekly/monthly calculation functions
- [ ] Implement goal tracking system
- [ ] Add trend analysis algorithms
- [ ] Create progress reporting system

#### Advanced Features
- [ ] Implement calorie expenditure estimation
- [ ] Add pattern recognition for eating habits
- [ ] Create customizable dashboard layouts
- [ ] Add data export functionality

#### User Preferences
- [ ] Create settings panel for diet preferences
- [ ] Implement calendar type selection
- [ ] Add goal customization options
- [ ] Save preferences to user_settings table

## Recent Technical Fixes 🔧

### Weight Tracking System Fixes ✅ COMPLETED
- **Date Column Type**: Changed `user_weight.date` from `DATE` to `TEXT` to avoid timezone conversion issues
- **Unique Constraint**: Updated from `UNIQUE(user_id, date)` to `UNIQUE(user_id, date, time)` for proper time slot management
- **Frontend Logic**: Added smart time slot filtering to prevent duplicate entries per day
- **Data Migration**: Successfully migrated existing weight data to new schema

### Home Page Widget Fixes ✅ COMPLETED
- **API Integration**: Replaced localStorage with proper API calls to `/api/diet/meals/{date}`
- **Timezone Handling**: Fixed date calculation to use local timezone instead of UTC
- **Data Parsing**: Added robust handling for both JSON string and object nutrition data
- **Fallback System**: Added fallback to recent meals when no meals exist for today
- **Authentication**: Proper user authentication handling for meal loading

### Meal History Implementation ✅ COMPLETED
- **New Component**: Created complete MealHistory component with inline styles
- **Route Integration**: Added `/lifestyle/diet/history` route to main app
- **Button Positioning**: Moved "View Meal History" button to right panel meal header
- **Date Handling**: Implemented automatic date format conversion between frontend and backend
- **API Integration**: Connected to existing meal history endpoints with robust error handling
- **UI Layout**: Positioned button as far right as possible in meal title section

### Database Schema Improvements ✅ COMPLETED
- **Date Storage**: Both `user_meals.date` and `user_weight.date` now use `TEXT` type with `MM-DD-YYYY` format
- **Constraint Logic**: Proper unique constraints that allow multiple entries per day while preventing duplicates
- **Data Consistency**: All date-related operations now use consistent format across the system

## Technical Considerations 🔧

### Data Migration
- **Preset Ingredients**: Move hardcoded ingredients to database (no user data to migrate)
- **Backup Strategy**: Maintain hardcoded fallback during transition
- **Fallback System**: Keep localStorage as backup for offline use

### Performance
- **Lazy Loading**: Implement pagination for large datasets
- **Caching**: Cache frequently accessed data
- **Optimization**: Efficient database queries for analytics

### User Experience
- **Offline Support**: Handle network failures gracefully
- **Loading States**: Clear feedback during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Ensure mobile compatibility

### Security
- **Data Isolation**: Users can only access their own data
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Secure all endpoints

## Testing Strategy 🧪

### Unit Tests
- [ ] Test all calculation functions
- [ ] Test API endpoint logic
- [ ] Test data validation functions

### Integration Tests
- [ ] Test frontend-backend communication
- [ ] Test database operations
- [ ] Test authentication flow

### User Acceptance Tests
- [x] Test complete meal tracking workflow
- [x] Test weight tracking functionality
- [x] Test historical data viewing
- [ ] Test analytics and insights

## Success Metrics 📊

### User Engagement
- **Daily Active Users**: Track how many users use diet features daily
- **Feature Usage**: Monitor which features are most popular
- **Session Duration**: Measure time spent on diet page

### Data Quality
- **Data Completeness**: Track percentage of complete daily entries
- **Data Accuracy**: Validate nutrition calculations
- **User Retention**: Monitor long-term usage patterns

### Performance
- **Page Load Times**: Ensure fast loading of diet page
- **API Response Times**: Monitor backend performance
- **Database Performance**: Track query execution times

## Timeline Estimation ⏰

### Phase 1: Backend Integration ✅ COMPLETED
- **Database Setup**: 0.5 days ✅
- **Backend Routes**: 1 day ✅
- **Frontend Integration**: 1 day ✅
- **Testing & Bug Fixes**: 0.5 days ✅
- **Total**: 3 days ✅ COMPLETED

### Phase 1.5: Custom Ingredients Interface ✅ COMPLETED
- **User Interface**: 0.5 days ✅
- **Backend Integration**: 0.5 days ✅
- **Testing & Integration**: 0.5 days ✅
- **Total**: 1.5 days ✅ COMPLETED

### Phase 1.6: Weight Tracking & Widget Fixes ✅ COMPLETED
- **Weight System Fixes**: 0.5 days ✅
- **Home Page Widget Updates**: 0.5 days ✅
- **Testing & Bug Fixes**: 0.5 days ✅
- **Total**: 1.5 days ✅ COMPLETED

### Phase 1.7: Meal History Implementation ✅ COMPLETED
- **UI Components**: 0.5 days ✅
- **Data Management**: 0.5 days ✅
- **Integration & Testing**: 0.5 days ✅
- **Total**: 1.5 days ✅ COMPLETED

### Phase 2: Historical Tracking ✅ PARTIALLY COMPLETED
- **UI Components**: 0.5 days ✅ (meal history completed)
- **Data Management**: 0.5 days ✅ (meal history completed)
- **Weight History**: 0.5 days
- **Testing**: 0.5 days
- **Total**: 1 day remaining

### Phase 3: Analytics & Insights
- **Statistics Engine**: 1 day
- **Advanced Features**: 1 day
- **User Preferences**: 0.5 days
- **Testing**: 0.5 days
- **Total**: 3 days

### Overall Project
- **Total Estimated Time**: 9.5 days
- **Completed**: 8 days ✅ (Phase 1 + 1.5 + 1.6 + 1.7)
- **Remaining**: 1.5 days (Phase 2 completion + Phase 3)
- **Recommended Buffer**: 0.5-1 day additional time
- **Final Estimate**: 1-2 days remaining (based on our development speed)

## Risk Assessment ⚠️

### High Risk
- **Data Migration**: ✅ RESOLVED - Minimal risk, only moving preset ingredients, no user data
- **Performance**: Large datasets could impact page load times
- **User Experience**: Complex new features could confuse existing users

### Medium Risk
- **API Integration**: ✅ RESOLVED - Backend changes working well, no breaking changes
- **Database Performance**: Complex queries for analytics could be slow
- **Mobile Compatibility**: New UI components might not work well on mobile

### Low Risk
- **Feature Complexity**: Most planned features are straightforward to implement
- **Technology Stack**: Using familiar technologies (React, Express, PostgreSQL)
- **User Base**: Small user base means easier testing and iteration

## Next Steps 🚀

1. **Phase 1, 1.5, 1.6, and 1.7 COMPLETED** ✅ - Backend integration, custom ingredients, weight tracking fixes, and meal history working
2. **Phase 2 Planning**: Complete weight history visualization features
3. **Phase 2 Implementation**: Finish historical tracking work
4. **Phase 3 Planning**: Begin analytics and insights features
5. **Regular Reviews**: Continue progress reviews and plan adjustments

## Conclusion

This diet system upgrade represents a significant enhancement to our user experience, moving from simple daily tracking to comprehensive health analytics. The phased approach ensures we can deliver value incrementally while maintaining system stability. The integration with our user authentication system provides a solid foundation for future health and wellness features.

**Phase 1, 1.5, 1.6, and 1.7 have been completed successfully**, delivering backend integration, a full custom ingredients interface, fixing critical weight tracking and home page widget issues, and implementing comprehensive meal history functionality. The remaining phases (weight history completion and analytics) will complete the transformation from a daily tracking tool to a comprehensive health management system.

The estimated timeline of 1-2 days remaining is realistic given our development speed and the solid foundation we've built. By continuing with the phased approach, we can validate each remaining phase before moving to the next.

**Current Status**: Meal history system fully implemented with proper button positioning, ready for weight history completion and analytics features.
