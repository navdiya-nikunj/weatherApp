# Farcaster Profile Location Integration

This document outlines the changes made to integrate Neynar API for accessing user location data from Farcaster profiles.

## Overview

The weather app now uses the Neynar API to fetch the user's location from their Farcaster profile instead of using browser geolocation. This provides a seamless experience within the Farcaster ecosystem.

## Changes Made

### 1. Environment Variables

- **Added**: `VITE_NEYNAR_API_KEY` environment variable
- **File**: `src/vite-env.d.ts` - Added TypeScript types for the environment variable
- **Usage**: Required for accessing Neynar API to fetch user profiles

### 2. Type Definitions

**File**: `src/types/weather.ts`

Added new interfaces for Neynar API responses:
- `NeynarLocation` - Location data structure from profile
- `NeynarUserProfile` - User profile structure 
- `NeynarUser` - Complete user object
- `NeynarUserResponse` - API response wrapper
- `NeynarError` - Error response structure

### 3. API Service Updates

**File**: `src/services/weatherApi.ts`

**New Functions:**
- `getCurrentUsername()` - Gets current user's username from Farcaster SDK
- `fetchNeynarUserProfile(username)` - Fetches user profile from Neynar API
- `getCurrentLocationFromProfile()` - Extracts location from user profile

**Updated Functions:**
- Renamed `getCurrentLocation()` to `getBrowserLocation()` (kept for fallback)
- Added `getCurrentLocation` as alias to `getCurrentLocationFromProfile()`

### 4. Hook Updates

**File**: `src/hooks/useWeather.ts`

**Updated `useCurrentLocation` hook:**
- Now uses `getCurrentLocationFromProfile()` instead of browser geolocation
- Enhanced error handling for Farcaster-specific scenarios:
  - Location not set in profile
  - User not authenticated
  - API key missing/invalid
  - Network/service errors

### 5. UI Component Updates

**File**: `src/components/LocationPermissionPrompt.tsx`

- Updated messaging to reflect Farcaster profile location access
- Changed icons and copy to emphasize profile-based location
- Removed browser permission-specific language

**File**: `src/components/WeatherApp.tsx`

- Updated error messages for profile location scenarios
- Changed error handling flow for Farcaster-specific cases

### 6. Documentation

**File**: `README.md`

- Added section on Farcaster profile location feature
- Documented environment variable requirement
- Added instructions for setting location in Farcaster profile
- Updated deployment guide with Neynar API key setup

## API Flow

1. **User requests location access** → App calls `getCurrentLocationFromProfile()`
2. **Get username** → Fetch current user's username from Farcaster SDK
3. **Fetch profile** → Call Neynar API with username to get profile data
4. **Extract location** → Parse latitude/longitude from profile location field
5. **Validate coordinates** → Ensure coordinates are valid
6. **Create location object** → Build location with coordinates and display name

## Error Handling

The integration handles several error scenarios:

1. **Location not set**: User hasn't set location in their Farcaster profile
2. **Not authenticated**: User not logged into Farcaster or SDK context unavailable
3. **API key missing**: `VITE_NEYNAR_API_KEY` not configured
4. **Network errors**: API requests fail due to connectivity
5. **Invalid coordinates**: Profile contains invalid latitude/longitude values

## Environment Setup

### Development

1. Get Neynar API key from [neynar.com](https://neynar.com/)
2. Create `.env.local` file:
   ```env
   VITE_NEYNAR_API_KEY=your_api_key_here
   ```
3. Restart development server

### Production

Set environment variable in your hosting platform:
```env
VITE_NEYNAR_API_KEY=your_api_key_here
```

## User Experience

### With Profile Location Set
1. User clicks "Use Profile Location"
2. App fetches location from profile instantly
3. Weather data loads for their location

### Without Profile Location
1. User clicks "Use Profile Location"  
2. App shows "Location not set" message
3. User can either:
   - Set location in Farcaster profile and try again
   - Search for city manually

## Security Considerations

- API key is exposed in client-side code (standard for Neynar public API)
- Only accesses public profile information
- No additional permissions required from user
- Falls back gracefully when location unavailable

## Testing

1. **With location set**: Set location in Farcaster profile, test location detection
2. **Without location**: Remove location from profile, test error handling
3. **Invalid API key**: Test with wrong/missing API key
4. **Network issues**: Test with poor connectivity

## Migration Notes

- Existing users won't be affected if they were using manual city search
- Users who previously used browser geolocation will need to set their location in Farcaster profile
- Fallback to manual search ensures app remains functional for all users 