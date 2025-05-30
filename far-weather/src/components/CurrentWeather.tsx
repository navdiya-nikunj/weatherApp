import { FC } from 'react';
import { Wind, Droplets,  Gauge, Sun, Cloud } from 'lucide-react';
import type { CurrentWeather as CurrentWeatherType, Location } from '../types/weather';
import { 
  getWeatherCondition, 
  formatTemperature, 
  formatWindSpeed, 
  getWindDirection, 
  formatPressure, 
  formatHumidity,
  formatPrecipitation,
  getFeelsLikeDescription
} from '../utils/weatherUtils';

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  location: Location;
}

export const CurrentWeather: FC<CurrentWeatherProps> = ({ 
  weather, 
  location 
}) => {
  const condition = getWeatherCondition(weather.weather_code);
  const isDay = weather.is_day === 1;

  return (
    <div className="current-weather weather-card">
      <div className="location">
        📍 {location.name}
        {location.country && `, ${location.country}`}
      </div>
      
      <div className="weather-icon">
        <span style={{ fontSize: '48px' }}>{condition.icon}</span>
      </div>
      
      <div className="main-temp">
        {formatTemperature(weather.temperature_2m)}
      </div>
      
      <div className="condition">
        {condition.description}
      </div>
      
      <div className="feels-like">
        {getFeelsLikeDescription(weather.temperature_2m, weather.apparent_temperature)}
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <Wind className="detail-icon" size={20} />
          <div className="label">Wind</div>
          <div className="value">
            {formatWindSpeed(weather.wind_speed_10m)} {getWindDirection(weather.wind_direction_10m)}
          </div>
        </div>

        <div className="detail-item">
          <Droplets className="detail-icon" size={20} />
          <div className="label">Humidity</div>
          <div className="value">{formatHumidity(weather.relative_humidity_2m)}</div>
        </div>

        <div className="detail-item">
          <Gauge className="detail-icon" size={20} />
          <div className="label">Pressure</div>
          <div className="value">{formatPressure(weather.pressure_msl)}</div>
        </div>

        <div className="detail-item">
          <Cloud className="detail-icon" size={20} />
          <div className="label">Cloud Cover</div>
          <div className="value">{weather.cloud_cover}%</div>
        </div>

        {weather.precipitation > 0 && (
          <div className="detail-item">
            <Droplets className="detail-icon" size={20} />
            <div className="label">Precipitation</div>
            <div className="value">{formatPrecipitation(weather.precipitation)}</div>
          </div>
        )}

        {weather.wind_gusts_10m > weather.wind_speed_10m && (
          <div className="detail-item">
            <Wind className="detail-icon" size={20} />
            <div className="label">Gusts</div>
            <div className="value">{formatWindSpeed(weather.wind_gusts_10m)}</div>
          </div>
        )}
      </div>

      <div className="weather-meta">
        <div className="meta-item">
          <Sun className="meta-icon" size={16} />
          <span>{isDay ? 'Day' : 'Night'}</span>
        </div>
        <div className="meta-item">
          <span className="update-time">
            Updated: {new Date(weather.time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}; 