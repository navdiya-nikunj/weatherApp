import { FC } from 'react';
import { Calendar, Droplets, Wind, Sunrise, Sunset } from 'lucide-react';
import type { DailyWeather } from '../types/weather';
import { 
  getWeatherCondition, 
  formatTemperature, 
  formatDailyDate,
  formatPrecipitation,
  formatWindSpeed,
  formatSunTime,
  formatUVIndex
} from '../utils/weatherUtils';

interface DailyForecastProps {
  dailyData: DailyWeather;
  timezone?: string;
}

export const DailyForecast: FC<DailyForecastProps> = ({ 
  dailyData,  
}) => {
  const daysToShow = 7;
  
  const dailyItems = dailyData.time
    .slice(0, daysToShow)
    .map((time, index) => {
      const condition = getWeatherCondition(dailyData.weather_code[index]);
      const isToday = index === 0;
      
      return {
        date: isToday ? 'Today' : formatDailyDate(time),
        weatherCode: dailyData.weather_code[index],
        condition,
        maxTemp: Math.round(dailyData.temperature_2m_max[index]),
        minTemp: Math.round(dailyData.temperature_2m_min[index]),
        precipitation: dailyData.precipitation_sum[index] || 0,
        precipitationProbability: Math.round(dailyData.precipitation_probability_max?.[index] || 0),
        windSpeed: Math.round(dailyData.wind_speed_10m_max[index]),
        uvIndex: dailyData.uv_index_max?.[index] || 0,
        sunrise: dailyData.sunrise[index],
        sunset: dailyData.sunset[index],
        isToday,
      };
    });

  return (
    <div className="forecast-section weather-card">
      <h3>
        <Calendar size={20} />
        7-Day Forecast
      </h3>
      
      <div className="daily-forecast">
        {dailyItems.map((item, index) => (
          <div 
            key={index} 
            className={`daily-forecast-item ${item.isToday ? 'today' : ''}`}
          >
            <div className="day-info">
              <div className="day">{item.date}</div>
              <div className="condition-summary">
                <span style={{ fontSize: '24px', marginRight: '8px' }}>
                  {item.condition.icon}
                </span>
                <span className="condition-text">{item.condition.description}</span>
              </div>
            </div>
            
            <div className="temps">
              <span className="high">{formatTemperature(item.maxTemp)}</span>
              <span className="separator">/</span>
              <span className="low">{formatTemperature(item.minTemp)}</span>
            </div>
            
            <div className="day-details">
              {item.precipitationProbability > 0 && (
                <div className="detail">
                  <Droplets size={14} />
                  <span>{item.precipitationProbability}%</span>
                  {item.precipitation > 0 && (
                    <span className="precip-amount">
                      ({formatPrecipitation(item.precipitation)})
                    </span>
                  )}
                </div>
              )}
              
              <div className="detail">
                <Wind size={14} />
                <span>{formatWindSpeed(item.windSpeed)}</span>
              </div>
              
              {item.uvIndex > 0 && (
                <div className="detail">
                  <span>☀️</span>
                  <span>UV: {formatUVIndex(item.uvIndex)}</span>
                </div>
              )}
            </div>
            
            <div className="sun-times">
              <div className="sun-time">
                <Sunrise size={14} />
                <span>{formatSunTime(item.sunrise)}</span>
              </div>
              <div className="sun-time">
                <Sunset size={14} />
                <span>{formatSunTime(item.sunset)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 