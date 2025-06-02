import { FC } from 'react';
import { useWeatherApp, LocationPermissionState, NavigationState } from '../hooks/useWeather';
import { HomePage } from './HomePage';
import { LocationSearch } from './LocationSearch';
import { CurrentWeather } from './CurrentWeather';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { LocationPermissionPrompt } from './LocationPermissionPrompt';
import { Home, RefreshCw, AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

export const WeatherApp: FC = () => {
  const {
    navigationState,
    goToHome,
    requestCurrentLocation,
    startLocationSearch,
    clearLocation,
    location,
    setLocation,
    locationPermissionState,
    retryCurrentLocation,
    isDetectingLocation,
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
        <LoadingSpinner message="Initializing weather app..." />
      </div>
    );
  }

  // Navigation based on current state
  switch (navigationState) {
    case NavigationState.HOME:
      return (
        <div className="weather-app">
          <HomePage
            onRequestCurrentLocation={requestCurrentLocation}
            onStartLocationSearch={startLocationSearch}
            hasLocationBefore={hasLocation}
          />
        </div>
      );

    case NavigationState.CURRENT_LOCATION:
      return (
        <div className="weather-app">
          {/* Header with back button */}
          <div className="navigation-header">
            <button className="back-button" onClick={goToHome}>
              <ArrowLeft className="icon" />
              Back to Home
            </button>
          </div>

          {/* Show permission prompt or location detection */}
          {locationPermissionState === LocationPermissionState.NOT_REQUESTED ||
           locationPermissionState === LocationPermissionState.PENDING ? (
            <LocationPermissionPrompt
              onAllowLocation={requestCurrentLocation}
              onDenyLocation={goToHome}
              isDetecting={isDetectingLocation}
            />
          ) : locationPermissionState === LocationPermissionState.DENIED ? (
            <div className="weather-card">
              <div className="location-error-card">
                <AlertTriangle className="icon" />
                <div className="error-content">
                  <h3>Location Not Set in Profile</h3>
                  <p>You haven't set a location in your Farcaster profile. Please add your location in your Farcaster settings or search for a city manually.</p>
                  <div className="error-actions">
                    <button className="retry-button" onClick={retryCurrentLocation}>
                      <RotateCcw className="icon" />
                      Check Again
                    </button>
                    <button className="secondary-button" onClick={startLocationSearch}>
                      Search for City
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : locationPermissionState === LocationPermissionState.ERROR ? (
            <div className="weather-card">
              <div className="location-error-card">
                <AlertTriangle className="icon" />
                <div className="error-content">
                  <h3>Unable to Access Profile Location</h3>
                  <p>We couldn't get your location from your Farcaster profile. This might be due to a temporary issue or your location not being set. Please try again or search for your city manually.</p>
                  <div className="error-actions">
                    <button className="retry-button" onClick={retryCurrentLocation}>
                      <RotateCcw className="icon" />
                      Try Again
                    </button>
                    <button className="secondary-button" onClick={startLocationSearch}>
                      Search for City
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );

    case NavigationState.SEARCH_LOCATION:
      return (
        <div className="weather-app">
          {/* Header with back button */}
          <div className="navigation-header">
            <button className="back-button" onClick={goToHome}>
              <ArrowLeft className="icon" />
              Back to Home
            </button>
          </div>

          {/* Search interface */}
          <div className="weather-card">
            <h2>Search for City</h2>
            <p>Enter a city name to get weather information</p>
            
            <div className="search-container">
              <LocationSearch
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                searchResults={searchResults}
                onLocationSelect={setLocation}
                isSearching={isSearching}
                searchError={searchError}
                placeholder="Search for a city..."
                autoFocus
              />
            </div>
          </div>
        </div>
      );

    case NavigationState.WEATHER_VIEW:
      return (
        <div className="weather-app">
          {/* Header with navigation */}
          <div className="weather-header">
            <div className="header-content">
              <button className="back-button compact" onClick={goToHome} title="Back to Home">
                <Home className="icon" />
              </button>
              
              <div className="location-display">
                <span className="location-name">{location?.name || 'Unknown Location'}</span>
                <button className="clear-location-btn" onClick={clearLocation} title="Change Location">
                  ×
                </button>
              </div>
              
              <button 
                className="refresh-button"
                onClick={refreshWeather}
                disabled={isLoadingWeather}
                title="Refresh weather data"
              >
                <RefreshCw className={`icon ${isLoadingWeather ? 'spinning' : ''}`} />
              </button>
            </div>
          </div>

          {/* Weather content */}
          {isLoadingWeather && !weatherData ? (
            <LoadingSpinner message="Loading weather data..." />
          ) : weatherError ? (
            <ErrorMessage 
              message="Failed to load weather data"
              details={weatherError.message}
              action={{
                label: 'Retry',
                onClick: refreshWeather
              }}
            />
          ) : weatherData && location ? (
            <div className="weather-content">
              <CurrentWeather 
                weather={weatherData.current} 
                location={location} 
              />
              
              <HourlyForecast 
                hourlyData={weatherData.hourly}
              />
              
              <DailyForecast 
                dailyData={weatherData.daily}
              />
            </div>
          ) : (
            <div className="weather-card">
              <p>No weather data available</p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="weather-app">
          <div className="weather-card">
            <p>Something went wrong. Please refresh the app.</p>
            <button className="btn btn-primary" onClick={goToHome}>
              Go to Home
            </button>
          </div>
        </div>
      );
  }
}; 