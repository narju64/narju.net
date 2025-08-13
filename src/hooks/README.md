# Authentication Auto-Refresh Hook

## Overview

The `useAuthRefresh` hook provides a clean, reusable way for any component to automatically refresh its data when users log in or out. This eliminates the need to manually handle authentication state changes on each individual page.

## How It Works

1. **Global State Management**: The `AuthContext` manages authentication state globally
2. **Automatic Triggers**: When `login()` or `logout()` is called, all components using `useAuthRefresh` automatically refresh
3. **No Manual Setup**: Components just need to use the hook - no complex state management required

## Usage

### Basic Example

```tsx
import { useAuthRefresh } from '../hooks/useAuthRefresh';

const MyComponent: React.FC = () => {
  const [data, setData] = useState([]);
  
  // This will automatically run when auth state changes
  useAuthRefresh(() => {
    if (isLoggedIn) {
      fetchMyData(); // Fetch data when logged in
    } else {
      setData([]); // Clear data when logged out
    }
  }, [isLoggedIn]);
  
  // ... rest of component
};
```

### Real-World Example (FavoriteAlbums)

```tsx
const FavoriteAlbums: React.FC = () => {
  const { isLoggedIn, authToken } = useAuth();
  
  // Automatically refresh when auth changes
  useAuthRefresh(() => {
    if (isLoggedIn) {
      fetchAlbumsFromApi(); // Load user's albums
    } else {
      setAlbums([]); // Clear albums when logged out
      setError(null);
    }
  }, [isLoggedIn]);
  
  // ... rest of component
};
```

## Benefits

✅ **Zero Configuration**: Just import and use the hook  
✅ **Automatic**: Works on all pages without manual setup  
✅ **Consistent**: Same pattern across all components  
✅ **Maintainable**: Single source of truth for auth state  
✅ **Performance**: Only refreshes when actually needed  

## Migration Guide

### Before (Manual Auth Handling)
```tsx
// ❌ Old way - manual localStorage checks
useEffect(() => {
  const storedUser = localStorage.getItem('currentUser');
  const storedToken = localStorage.getItem('authToken');
  const loggedIn = !!(storedUser && storedToken);
  setIsLoggedIn(loggedIn);
  
  if (loggedIn) {
    fetchData();
  }
}, []);
```

### After (Auto-Refresh Hook)
```tsx
// ✅ New way - automatic refresh
useAuthRefresh(() => {
  if (isLoggedIn) {
    fetchData();
  } else {
    setData([]);
  }
}, [isLoggedIn]);
```

## Components Already Updated

- ✅ `Routine.tsx` - Routine data
- ✅ `CurrentTask.tsx` - Current/next tasks  
- ✅ `FavoriteAlbums.tsx` - User's favorite albums
- ✅ `Header.tsx` - User display and logout

## Adding to New Components

To add automatic refresh to any new component:

1. **Import the hook**:
   ```tsx
   import { useAuthRefresh } from '../hooks/useAuthRefresh';
   ```

2. **Use the auth context**:
   ```tsx
   const { isLoggedIn, authToken } = useAuth();
   ```

3. **Add the refresh hook**:
   ```tsx
   useAuthRefresh(() => {
     // Your refresh logic here
   }, [isLoggedIn]);
   ```

That's it! The component will now automatically refresh whenever users log in or out.
