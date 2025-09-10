# API URL Resolution Fix

## Problem
API calls were incorrectly formatted as `https://donorspherex.vercel.app/server-donorspherex.vercel.app/api/auth/login` instead of the correct URL `https://server-donorspherex.vercel.app/api/auth/login`.

## Solution
Created a centralized API client to ensure all requests use the correct base URL:

1. Created a dedicated API client in `src/utils/api.js`:
   - Uses Axios with a consistent baseURL configuration
   - Adds authorization tokens automatically
   - Handles common error cases

2. Added a custom hook `useApi` in `src/utils/useApi.js` to provide:
   - Loading and error states
   - Consistent data fetching patterns
   - Error handling

3. Updated Vite configuration in `vite.config.js`:
   - Added proper base URL configuration
   - Ensured environment variables are processed correctly

4. Updated components to use the centralized API client:
   - Refactored `AuthContext.jsx` to use the API client
   - Refactored `userStore.js` to use the API client
   - Updated Dashboard component API calls

## Usage
Use the API client and hooks in your components:

```jsx
// Option 1: Using the API utilities directly
import { apiGet, apiPost } from '../utils/api';

const fetchData = async () => {
  try {
    // Note that you don't include the base URL - just the endpoint path
    const response = await apiGet('auth/profile');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// Option 2: Using the useApi hook
import { useApi } from '../utils/useApi';

const MyComponent = () => {
  const { isLoading, error, get, post } = useApi();
  
  const handleFetchData = async () => {
    try {
      const data = await get('auth/profile');
      console.log(data);
    } catch (error) {
      // Error already handled by the hook
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleFetchData}>Fetch Data</button>
    </div>
  );
};
```

## Benefits
- Consistent URL handling across the application
- Automatic authentication token management
- Centralized error handling
- Simplified API calls in components
- Loading and error states built into the hooks
