import { format } from 'date-fns';
import type { WeatherCondition } from '../types/weather';

// WMO Weather interpretation codes (WW)
export const WEATHER_CONDITIONS: Record<number, WeatherCondition> = {
  0: {
    description: 'Clear sky',
    icon: '☀️',
    color: '#FFD700',
  },
  1: {
    description: 'Mainly clear',
    icon: '🌤️',
    color: '#FFA500',
  },
  2: {
    description: 'Partly cloudy',
    icon: '⛅',
    color: '#87CEEB',
  },
  3: {
    description: 'Overcast',
    icon: '☁️',
    color: '#B0C4DE',
  },
  45: {
    description: 'Fog',
    icon: '🌫️',
    color: '#A9A9A9',
  },
  48: {
    description: 'Depositing rime fog',
    icon: '🌫️',
    color: '#A9A9A9',
  },
  51: {
    description: 'Light drizzle',
    icon: '🌦️',
    color: '#4682B4',
  },
  53: {
    description: 'Moderate drizzle',
    icon: '🌦️',
    color: '#4682B4',
  },
  55: {
    description: 'Dense drizzle',
    icon: '🌧️',
    color: '#4169E1',
  },
  56: {
    description: 'Light freezing drizzle',
    icon: '🌨️',
    color: '#6495ED',
  },
  57: {
    description: 'Dense freezing drizzle',
    icon: '🌨️',
    color: '#4169E1',
  },
  61: {
    description: 'Slight rain',
    icon: '🌦️',
    color: '#4682B4',
  },
  63: {
    description: 'Moderate rain',
    icon: '🌧️',
    color: '#4169E1',
  },
  65: {
    description: 'Heavy rain',
    icon: '🌧️',
    color: '#191970',
  },
  66: {
    description: 'Light freezing rain',
    icon: '🌨️',
    color: '#6495ED',
  },
  67: {
    description: 'Heavy freezing rain',
    icon: '🌨️',
    color: '#4169E1',
  },
  71: {
    description: 'Slight snow',
    icon: '🌨️',
    color: '#B0E0E6',
  },
  73: {
    description: 'Moderate snow',
    icon: '❄️',
    color: '#87CEFA',
  },
  75: {
    description: 'Heavy snow',
    icon: '❄️',
    color: '#6495ED',
  },
  77: {
    description: 'Snow grains',
    icon: '❄️',
    color: '#87CEFA',
  },
  80: {
    description: 'Slight rain showers',
    icon: '🌦️',
    color: '#4682B4',
  },
  81: {
    description: 'Moderate rain showers',
    icon: '🌧️',
    color: '#4169E1',
  },
  82: {
    description: 'Violent rain showers',
    icon: '⛈️',
    color: '#191970',
  },
  85: {
    description: 'Slight snow showers',
    icon: '🌨️',
    color: '#B0E0E6',
  },
  86: {
    description: 'Heavy snow showers',
    icon: '❄️',
    color: '#6495ED',
  },
  95: {
    description: 'Thunderstorm',
    icon: '⛈️',
    color: '#8A2BE2',
  },
  96: {
    description: 'Thunderstorm with hail',
    icon: '⛈️',
    color: '#4B0082',
  },
  99: {
    description: 'Thunderstorm with heavy hail',
    icon: '⛈️',
    color: '#4B0082',
  },
};

/**
 * Get weather condition information from weather code
 */
export const getWeatherCondition = (code: number): WeatherCondition => {
  return WEATHER_CONDITIONS[code] || {
    description: 'Unknown',
    icon: '❓',
    color: '#808080',
  };
};

/**
 * Format temperature with unit
 */
export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'C'): string => {
  return `${Math.round(temp)}°${unit}`;
};

/**
 * Format wind speed
 */
export const formatWindSpeed = (speed: number, unit: 'kmh' | 'mph' = 'kmh'): string => {
  if (unit === 'mph') {
    return `${Math.round(speed * 0.621371)} mph`;
  }
  return `${Math.round(speed)} km/h`;
};

/**
 * Format wind direction
 */
export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

/**
 * Format pressure
 */
export const formatPressure = (pressure: number): string => {
  return `${Math.round(pressure)} hPa`;
};

/**
 * Format humidity
 */
export const formatHumidity = (humidity: number): string => {
  return `${Math.round(humidity)}%`;
};

/**
 * Format precipitation
 */
export const formatPrecipitation = (precip: number): string => {
  return `${precip.toFixed(1)} mm`;
};

/**
 * Format visibility
 */
export const formatVisibility = (visibility: number): string => {
  if (visibility >= 1000) {
    return `${(visibility / 1000).toFixed(1)} km`;
  }
  return `${Math.round(visibility)} m`;
};

/**
 * Format UV Index
 */
export const formatUVIndex = (uv: number): string => {
  if (uv <= 2) return `${uv.toFixed(1)} (Low)`;
  if (uv <= 5) return `${uv.toFixed(1)} (Moderate)`;
  if (uv <= 7) return `${uv.toFixed(1)} (High)`;
  if (uv <= 10) return `${uv.toFixed(1)} (Very High)`;
  return `${uv.toFixed(1)} (Extreme)`;
};

/**
 * Format time for hourly forecast
 */
export const formatHourlyTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'HH:mm');
};

/**
 * Format date for daily forecast
 */
export const formatDailyDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return format(date, 'EEE, MMM d');
};

/**
 * Get current hour index from hourly data
 */
export const getCurrentHourIndex = (hourlyTimes: string[]): number => {
  const now = new Date();
  const currentHour = now.getHours();
  
  for (let i = 0; i < hourlyTimes.length; i++) {
    const time = new Date(hourlyTimes[i]);
    if (time.getHours() === currentHour && time.getDate() === now.getDate()) {
      return i;
    }
  }
  return 0;
};

/**
 * Check if it's currently day or night based on is_day value
 */
export const isDayTime = (isDay: number): boolean => {
  return isDay === 1;
};

/**
 * Get background gradient based on weather conditions and time
 */
export const getWeatherGradient = (weatherCode: number, isDay: number): string => {
  const condition = getWeatherCondition(weatherCode);
  console.log('condition', condition);
  if (!isDayTime(isDay)) {
    return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'; // Night
  }
  
  // Day gradients based on weather
  if (weatherCode === 0) {
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'; // Clear
  }
  if (weatherCode <= 3) {
    return 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)'; // Partly cloudy
  }
  if (weatherCode >= 51 && weatherCode <= 67) {
    return 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)'; // Rain
  }
  if (weatherCode >= 71 && weatherCode <= 86) {
    return 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)'; // Snow
  }
  if (weatherCode >= 95) {
    return 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'; // Thunderstorm
  }
  
  return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'; // Default
};

/**
 * Get precipitation probability color
 */
export const getPrecipitationColor = (probability: number): string => {
  if (probability >= 80) return '#FF6B6B';
  if (probability >= 60) return '#FFA500';
  if (probability >= 40) return '#FFD700';
  if (probability >= 20) return '#87CEEB';
  return '#E8F4FD';
};

/**
 * Format sunrise/sunset time
 */
export const formatSunTime = (timeStr: string): string => {
  return format(new Date(timeStr), 'HH:mm');
};

/**
 * Calculate feels like description
 */
export const getFeelsLikeDescription = (actual: number, feelsLike: number): string => {
  const diff = feelsLike - actual;
  if (Math.abs(diff) < 2) return 'Similar to actual';
  if (diff > 0) return `Feels ${Math.round(Math.abs(diff))}° warmer`;
  return `Feels ${Math.round(Math.abs(diff))}° cooler`;
};

/**
 * Get air quality description from visibility
 */
export const getAirQualityFromVisibility = (visibility: number): string => {
  if (visibility >= 10000) return 'Excellent';
  if (visibility >= 7000) return 'Good';
  if (visibility >= 5000) return 'Fair';
  if (visibility >= 3000) return 'Poor';
  return 'Very Poor';
}; 