import { FC } from 'react';
import { useWeatherApp } from '../hooks/useWeather';
import { LocationSearch } from './LocationSearch';
import { CurrentWeather } from './CurrentWeather';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { MapPin, RefreshCw } from 'lucide-react';

export const WeatherApp: FC = () => {
  const {
    location,
    setLocation,
    detectCurrentLocation,
    isDetectingLocation,
    locationDetectionError,
    weatherData,
    isLoadingWeather,
    weatherError,
    refreshWeather,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    isInitializing,
    hasLocation,
  } = useWeatherApp();

  // Show initialization loading
  if (isInitializing) {
    return (
      <div className="weather-app">
        <div className="weather-header">
          <h1>🌤️ FarWeather App</h1>
        </div>
        <LoadingSpinner message="Initializing..." />
      </div>
    );
  }

  // Show location setup if no location is selected
  if (!hasLocation) {
    return (
      <div className="weather-app">
        <div className="weather-header">
          <h1>🌤️ FarWeather App</h1>
          <p>Choose your location to get started</p>
        </div>
        
        <div className="location-setup">
          <button
            className="btn btn-primary"
            onClick={detectCurrentLocation}
            disabled={isDetectingLocation}
          >
            <MapPin className="icon" />
            {isDetectingLocation ? 'Detecting...' : 'Use My Location'}
          </button>
          
          {locationDetectionError && (
            <ErrorMessage 
              message="Failed to detect location" 
              details={locationDetectionError.message}
            />
          )}
          
          <div className="or-divider">
            <span>or</span>
          </div>
          
          <LocationSearch
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchResults={searchResults}
            onLocationSelect={setLocation}
            isSearching={isSearching}
            searchError={searchError}
            placeholder="Search for a city..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="weather-app">
      <div className="weather-header">
        <div className="header-content">
          <h1>🌤️ Weather</h1>
          <div className="header-actions">
            <button
              className="btn btn-icon"
              onClick={refreshWeather}
              disabled={isLoadingWeather}
              title="Refresh weather data"
            >
              <RefreshCw className={`icon ${isLoadingWeather ? 'spinning' : ''}`} />
            </button>
          </div>
        </div>
        
        <LocationSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onLocationSelect={setLocation}
          isSearching={isSearching}
          searchError={searchError}
          placeholder={location?.name || 'Search location...'}
          compact
        />
      </div>

      {weatherError && (
        <ErrorMessage 
          message="Failed to load weather data" 
          details={weatherError.message}
          action={{
            label: 'Retry',
            onClick: refreshWeather
          }}
        />
      )}

      {isLoadingWeather && (
        <LoadingSpinner message="Loading weather data..." />
      )}

      {weatherData && (
        <div className="weather-content">
          <CurrentWeather 
            weather={weatherData.current}
            location={location!}
          />
          
          <HourlyForecast 
            hourlyData={weatherData.hourly}
            timezone={weatherData.timezone}
          />
          
          <DailyForecast 
            dailyData={weatherData.daily}
            timezone={weatherData.timezone}
          />
        </div>
      )}
    </div>
  );
}; 