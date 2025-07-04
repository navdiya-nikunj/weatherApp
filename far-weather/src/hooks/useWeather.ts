import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Location, WeatherData, HourlyForecastItem, DailyForecastItem } from '../types/weather';
import {
  fetchWeatherData,
  searchLocations,
  getCurrentLocationFromProfile,
  validateCoordinates,
  withRetry,
} from '../services/weatherApi';
import {
  formatHourlyTime,
  formatDailyDate,
  getCurrentHourIndex,
} from '../utils/weatherUtils';

// Query keys
const QUERY_KEYS = {
  weather: (lat: number, lon: number) => ['weather', lat, lon],
  search: (query: string) => ['search', query],
  reverseGeocode: (lat: number, lon: number) => ['reverseGeocode', lat, lon],
} as const;

// Location permission states
export enum LocationPermissionState {
  NOT_REQUESTED = 'not_requested',
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  ERROR = 'error',
}

// Navigation states for better UX
export enum NavigationState {
  HOME = 'home',
  CURRENT_LOCATION = 'current_location',
  SEARCH_LOCATION = 'search_location',
  WEATHER_VIEW = 'weather_view',
}

/**
 * Hook for managing weather data
 */
export const useWeather = (location: Location | null) => {
  const queryClient = useQueryClient();

  const weatherQuery = useQuery({
    queryKey: location ? QUERY_KEYS.weather(location.latitude, location.longitude) : [],
    queryFn: () => {
      if (!location || !validateCoordinates(location.latitude, location.longitude)) {
        throw new Error('Invalid location coordinates');
      }
      return withRetry(() => fetchWeatherData(location.latitude, location.longitude));
    },
    enabled: !!location && validateCoordinates(location.latitude, location.longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshWeather = () => {
    if (location) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.weather(location.latitude, location.longitude),
      });
    }
  };

  return {
    data: weatherQuery.data,
    isLoading: weatherQuery.isLoading,
    error: weatherQuery.error,
    isError: weatherQuery.isError,
    isSuccess: weatherQuery.isSuccess,
    refetch: weatherQuery.refetch,
    refreshWeather,
  };
};

/**
 * Hook for location search
 */
export const useLocationSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchQuery_query = useQuery({
    queryKey: QUERY_KEYS.search(debouncedQuery),
    queryFn: () => withRetry(() => searchLocations(debouncedQuery)),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    searchQuery,
    setSearchQuery,
    results: searchQuery_query.data || [],
    isLoading: searchQuery_query.isLoading,
    error: searchQuery_query.error,
    isError: searchQuery_query.isError,
  };
};

/**
 * Enhanced hook for getting current location from Farcaster profile
 */
export const useCurrentLocation = () => {
  const queryClient = useQueryClient();
  const [permissionState, setPermissionState] = useState<LocationPermissionState>(
    LocationPermissionState.NOT_REQUESTED
  );

  const locationMutation = useMutation({
    mutationFn: async (): Promise<Location> => {
      setPermissionState(LocationPermissionState.PENDING);
      
      try {
        const locationData = await getCurrentLocationFromProfile();
        setPermissionState(LocationPermissionState.GRANTED);
        
        return {
          name: locationData.locationName || 'Profile Location',
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      } catch (error: any) {
        // Handle specific Farcaster/Neynar errors
        if (error.message.includes('Location not set')) {
          setPermissionState(LocationPermissionState.DENIED);
          throw new Error('Please set your location in your Farcaster profile settings to use this feature.');
        } else if (error.message.includes('not authenticated')) {
          setPermissionState(LocationPermissionState.ERROR);
          throw new Error('Unable to access your Farcaster profile. Please make sure you are logged in.');
        } else if (error.message.includes('API key')) {
          setPermissionState(LocationPermissionState.ERROR);
          throw new Error('Location service is temporarily unavailable. Please try again later.');
        } else {
          setPermissionState(LocationPermissionState.ERROR);
          throw new Error('Failed to get location from your profile. Please try again or search for your city manually.');
        }
      }
    },
    onSuccess: (location) => {
      // Pre-fetch weather data for the new location
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.weather(location.latitude, location.longitude),
        queryFn: () => fetchWeatherData(location.latitude, location.longitude),
        staleTime: 5 * 60 * 1000,
      });
    },
    onError: () => {
      // Permission state is already set in mutationFn
    },
  });

  const requestLocation = () => {
    locationMutation.mutate();
  };

  const resetPermission = () => {
    setPermissionState(LocationPermissionState.NOT_REQUESTED);
    locationMutation.reset();
  };

  return {
    requestLocation,
    location: locationMutation.data,
    isLoading: locationMutation.isPending,
    error: locationMutation.error,
    isError: locationMutation.isError,
    isSuccess: locationMutation.isSuccess,
    permissionState,
    resetPermission,
    reset: locationMutation.reset,
  };
};

/**
 * Hook for processed hourly forecast data
 */
export const useHourlyForecast = (weatherData: WeatherData | undefined, hours: number = 24) => {
  if (!weatherData?.hourly) {
    return { hourlyForecast: [], currentHourIndex: 0 };
  }

  const currentHourIndex = getCurrentHourIndex(weatherData.hourly.time);
  
  const hourlyForecast: HourlyForecastItem[] = weatherData.hourly.time
    .slice(currentHourIndex, currentHourIndex + hours)
    .map((time, index) => {
      const actualIndex = currentHourIndex + index;
      
      return {
        time: formatHourlyTime(time),
        temperature: weatherData.hourly.temperature_2m[actualIndex],
        weatherCode: weatherData.hourly.weather_code[actualIndex],
        precipitation: weatherData.hourly.precipitation[actualIndex] || 0,
        humidity: weatherData.hourly.relative_humidity_2m[actualIndex],
      };
    });

  return { hourlyForecast, currentHourIndex };
};

/**
 * Hook for processed daily forecast data
 */
export const useDailyForecast = (weatherData: WeatherData | undefined, days: number = 7) => {
  if (!weatherData?.daily) {
    return { dailyForecast: [] };
  }
  
  const dailyForecast: DailyForecastItem[] = weatherData.daily.time
    .slice(0, days)
    .map((time, index) => ({
      date: formatDailyDate(time),
      weatherCode: weatherData.daily.weather_code[index],
      maxTemp: weatherData.daily.temperature_2m_max[index],
      minTemp: weatherData.daily.temperature_2m_min[index],
      precipitation: weatherData.daily.precipitation_sum[index] || 0,
      precipitationProbability: weatherData.daily.precipitation_probability_max?.[index] || 0,
      windSpeed: weatherData.daily.wind_speed_10m_max[index],
      sunrise: weatherData.daily.sunrise[index],
      sunset: weatherData.daily.sunset[index],
    }));

  return { dailyForecast };
};

/**
 * Hook for persisting location state
 */
export const useLocationState = () => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  // Load saved location on mount
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('weather-location');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (validateCoordinates(parsed.latitude, parsed.longitude)) {
          setLocationState(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    } finally {
      setIsLocationLoaded(true);
    }
  }, []);

  // Save location to localStorage whenever it changes
  const setLocation = (newLocation: Location | null) => {
    setLocationState(newLocation);
    
    try {
      if (newLocation) {
        localStorage.setItem('weather-location', JSON.stringify(newLocation));
      } else {
        localStorage.removeItem('weather-location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return {
    location,
    setLocation,
    isLocationLoaded,
  };
};

/**
 * Enhanced hook for weather app with better permission handling
 */
export const useWeatherApp = () => {
  const { location, setLocation, isLocationLoaded } = useLocationState();
  const currentLocationHook = useCurrentLocation();
  const weatherHook = useWeather(location);
  const searchHook = useLocationSearch();
  const [navigationState, setNavigationState] = useState<NavigationState>(NavigationState.HOME);

  // Navigate to home page when app loads if no location is saved
  useEffect(() => {
    if (isLocationLoaded) {
      if (location) {
        setNavigationState(NavigationState.WEATHER_VIEW);
      } else {
        setNavigationState(NavigationState.HOME);
      }
    }
  }, [isLocationLoaded, location]);

  // Handle current location detection completion
  useEffect(() => {
    if (currentLocationHook.isSuccess && currentLocationHook.location) {
      setLocation(currentLocationHook.location);
      setNavigationState(NavigationState.WEATHER_VIEW);
    }
  }, [currentLocationHook.isSuccess, currentLocationHook.location, setLocation]);

  const selectLocation = (newLocation: Location) => {
    setLocation(newLocation);
    currentLocationHook.reset();
    searchHook.setSearchQuery('');
    setNavigationState(NavigationState.WEATHER_VIEW);
  };

  const requestCurrentLocation = () => {
    setNavigationState(NavigationState.CURRENT_LOCATION);
    currentLocationHook.requestLocation();
  };

  const startLocationSearch = () => {
    setNavigationState(NavigationState.SEARCH_LOCATION);
    searchHook.setSearchQuery('');
  };

  const goToHome = () => {
    setNavigationState(NavigationState.HOME);
    // Clear any ongoing operations
    currentLocationHook.reset();
    searchHook.setSearchQuery('');
  };

  const clearLocation = () => {
    setLocation(null);
    setNavigationState(NavigationState.HOME);
    currentLocationHook.reset();
    searchHook.setSearchQuery('');
  };

  const retryCurrentLocation = () => {
    currentLocationHook.resetPermission();
    requestCurrentLocation();
  };

  return {
    // Navigation state
    navigationState,
    goToHome,
    requestCurrentLocation,
    startLocationSearch,
    clearLocation,
    
    // Location state
    location,
    setLocation: selectLocation,
    
    // Permission handling
    locationPermissionState: currentLocationHook.permissionState,
    retryCurrentLocation,
    
    // Current location detection
    isDetectingLocation: currentLocationHook.isLoading,
    locationDetectionError: currentLocationHook.error,
    
    // Weather data
    weatherData: weatherHook.data,
    isLoadingWeather: weatherHook.isLoading,
    weatherError: weatherHook.error,
    refreshWeather: weatherHook.refreshWeather,
    
    // Location search
    searchQuery: searchHook.searchQuery,
    setSearchQuery: searchHook.setSearchQuery,
    searchResults: searchHook.results,
    isSearching: searchHook.isLoading,
    searchError: searchHook.error,
    
    // Loading states
    isInitializing: !isLocationLoaded,
    hasLocation: !!location,
  };
}; 