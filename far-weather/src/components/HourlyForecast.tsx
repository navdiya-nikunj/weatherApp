import { FC } from 'react';
import { Clock, Droplets } from 'lucide-react';
import type { HourlyWeather } from '../types/weather';
import { 
  getWeatherCondition, 
  formatTemperature, 
  formatHourlyTime,
  getCurrentHourIndex,
  formatPrecipitation
} from '../utils/weatherUtils';

interface HourlyForecastProps {
  hourlyData: HourlyWeather;
  timezone?: string;
}

export const HourlyForecast: FC<HourlyForecastProps> = ({ 
  hourlyData, 
}) => {
  const currentHourIndex = getCurrentHourIndex(hourlyData.time);
  const hoursToShow = 24;
  
  // Get the next 24 hours starting from current hour
  const hourlyItems = hourlyData.time
    .slice(currentHourIndex, currentHourIndex + hoursToShow)
    .map((time, index) => {
      const actualIndex = currentHourIndex + index;
      const condition = getWeatherCondition(hourlyData.weather_code[actualIndex]);
      const isCurrentHour = index === 0;
      
      return {
        time: isCurrentHour ? 'Now' : formatHourlyTime(time),
        temperature: Math.round(hourlyData.temperature_2m[actualIndex]),
        weatherCode: hourlyData.weather_code[actualIndex],
        condition,
        precipitation: hourlyData.precipitation[actualIndex] || 0,
        precipitationProbability: Math.round(hourlyData.precipitation_probability?.[actualIndex] || 0),
        humidity: Math.round(hourlyData.relative_humidity_2m[actualIndex]),
        isCurrentHour,
      };
    });

  return (
    <div className="forecast-section weather-card">
      <h3>
        <Clock size={20} />
        24-Hour Forecast
      </h3>
      
      <div className="hourly-forecast">
        {hourlyItems.map((item, index) => (
          <div 
            key={index} 
            className={`hourly-item ${item.isCurrentHour ? 'current' : ''}`}
          >
            <div className="time">{item.time}</div>
            
            <div className="weather-icon">
              <span style={{ fontSize: '24px' }}>{item.condition.icon}</span>
            </div>
            
            <div className="temp">
              {formatTemperature(item.temperature)}
            </div>
            
            {item.precipitationProbability > 0 && (
              <div className="precipitation">
                <Droplets size={12} />
                <span className="precip-prob">{item.precipitationProbability}%</span>
              </div>
            )}
            
            {item.precipitation > 0 && (
              <div className="precip-amount">
                {formatPrecipitation(item.precipitation)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 