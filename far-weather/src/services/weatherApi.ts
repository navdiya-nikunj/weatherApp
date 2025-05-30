import type { 
  WeatherData, 
  GeocodingResponse, 
  Location 
} from '../types/weather';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

/**
 * Geocoding API - Search for locations by name
 */
export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data: GeocodingResponse = await response.json();
    
    return data.results?.map(result => ({
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1, // state/region
    })) || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    throw new Error('Failed to search locations. Please check your internet connection.');
  }
};

/**
 * Reverse geocoding - Get location name from coordinates
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<Location | null> => {
  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data: GeocodingResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        admin1: result.admin1,
      };
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Fetch current weather and forecast data
 */
export const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m', 
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(',');

    const hourlyParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(',');

    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'daylight_duration',
      'sunshine_duration',
      'uv_index_max',
      'precipitation_sum',
      'rain_sum',
      'showers_sum',
      'snowfall_sum',
      'precipitation_hours',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant'
    ].join(',');

    const url = new URL(`${OPEN_METEO_BASE_URL}/forecast`);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('current', currentParams);
    url.searchParams.set('hourly', hourlyParams);
    url.searchParams.set('daily', dailyParams);
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please check your internet connection.');
  }
};

/**
 * Get user's current location using browser geolocation
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Get weather alerts (if available in future API versions)
 * Currently Open-Meteo doesn't provide weather alerts in the free tier
 * This is a placeholder for future implementation or alternative API
 */
export const fetchWeatherAlerts = async (latitude: number, longitude: number): Promise<any[]> => {
  // Placeholder - Open-Meteo doesn't currently provide alerts in free tier
  // Could integrate with another service like OpenWeatherMap alerts
  console.log('Fetching weather alerts for:', latitude, longitude);
  return [];
};

/**
 * Check if coordinates are valid
 */
export const validateCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

/**
 * Utility to handle API rate limiting and retries
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}; 