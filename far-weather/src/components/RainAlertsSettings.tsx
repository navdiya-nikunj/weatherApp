import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Droplets, Settings, TestTube } from 'lucide-react';
import { sdk } from "@farcaster/frame-sdk";

interface RainAlertPreferences {
  enabled: boolean;
  preferences: {
    advanceTime: number;
    minimumIntensity: 'light' | 'moderate' | 'heavy';
    timeWindow: {
      startHour: number;
      endHour: number;
    };
    maxAlertsPerDay: number;
  };
}

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface RainAlertsSettingsProps {
  location: Location;
  onClose: () => void;
}

const API_BASE_URL = process.env.BACKEND_URL || 'https://farweather-be.vercel.app';


export const RainAlertsSettings: React.FC<RainAlertsSettingsProps> = ({ location, onClose }) => {
  const [preferences, setPreferences] = useState<RainAlertPreferences>({
    enabled: false,
    preferences: {
      advanceTime: 60,
      minimumIntensity: 'light',
      timeWindow: {
        startHour: 6,
        endHour: 22,
      },
      maxAlertsPerDay: 3,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  useEffect(() => {
    if (userContext) {
      loadPreferences();
    }
  }, [userContext]);

  const loadUserContext = async () => {
    try {
      const context = await sdk.context;
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const loadPreferences = async () => {
    if (!userContext?.user?.fid) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/preferences/${userContext.user.fid}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.rainAlerts);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!userContext?.user) return;
    
    setSaving(true);
    try {
      const payload = {
        fid: userContext.user.fid,
        username: userContext.user.username,
        location,
        rainAlerts: preferences,
      };

      const response = await fetch(`${API_BASE_URL}/api/alerts/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Preferences saved successfully');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    if (!userContext?.user?.fid) return;
    
    setTesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/test/${userContext.user.fid}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Test notification sent! Check your Farcaster direct messages.');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      alert('Failed to send test notification. Please try again.');
    } finally {
      setTesting(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const intensityDescriptions = {
    light: 'Light rain (< 2.5mm/hr)',
    moderate: 'Moderate rain (2.5-7.5mm/hr)',
    heavy: 'Heavy rain (> 7.5mm/hr)',
  };

  if (loading) {
    return (
      <div className="rain-alerts-loading">
        <div className="rain-alerts-loading-content">
          <div className="rain-alerts-loading-spinner">
            <div className="loading-spinner"></div>
            <span>Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rain-alerts-settings-overlay">
      <div className="rain-alerts-settings-modal">
        {/* Header */}
        <div className="rain-alerts-settings-header">
          <div className="rain-alerts-settings-title">
            <h2>
              <Bell className="icon" />
              Rain Alerts
            </h2>
            <button
              onClick={onClose}
              className="rain-alerts-close-btn"
            >
              ✕
            </button>
          </div>
          <p className="rain-alerts-settings-subtitle">
            Get notified when rain is expected at {location.name}
          </p>
        </div>

        {/* Content */}
        <div className="rain-alerts-settings-content">
          {/* Enable/Disable Toggle */}
          <div className="rain-alerts-settings-section">
            <div className="rain-alerts-toggle-row">
              <div className="rain-alerts-toggle-info">
                {preferences.enabled ? (
                  <Bell className="icon enabled" />
                ) : (
                  <BellOff className="icon disabled" />
                )}
                <div className="rain-alerts-toggle-text">
                  <h3>Rain Alerts</h3>
                  <p>{preferences.enabled ? 'Active' : 'Disabled'}</p>
                </div>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`rain-alerts-toggle-switch ${preferences.enabled ? 'enabled' : 'disabled'}`}
              >
                <span className="rain-alerts-toggle-button" />
              </button>
            </div>
          </div>

          {preferences.enabled && (
            <>
              {/* Advance Time */}
              <div className="rain-alerts-settings-section">
                <div className="rain-alerts-form-group">
                  <label className="rain-alerts-form-label">
                    <Clock className="icon" />
                    Alert me this many minutes before rain
                  </label>
                  <select
                    value={preferences.preferences.advanceTime}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        advanceTime: parseInt(e.target.value)
                      }
                    }))}
                    className="rain-alerts-select"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={360}>6 hours</option>
                    <option value={720}>12 hours</option>
                  </select>
                </div>
              </div>

              {/* Minimum Intensity */}
              <div className="rain-alerts-settings-section">
                <div className="rain-alerts-form-group">
                  <label className="rain-alerts-form-label">
                    <Droplets className="icon" />
                    Minimum rain intensity
                  </label>
                  <div className="rain-alerts-radio-group">
                    {(['light', 'moderate', 'heavy'] as const).map((intensity) => (
                      <label key={intensity} className="rain-alerts-radio-option">
                        <input
                          type="radio"
                          name="intensity"
                          value={intensity}
                          checked={preferences.preferences.minimumIntensity === intensity}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              minimumIntensity: e.target.value as 'light' | 'moderate' | 'heavy'
                            }
                          }))}
                        />
                        <div className="rain-alerts-radio-label">
                          <span className={`rain-alerts-intensity-name ${intensity}`}>
                            {intensity}
                          </span>
                          <span className="rain-alerts-intensity-desc">
                            {intensityDescriptions[intensity]}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Window */}
              <div className="rain-alerts-settings-section">
                <div className="rain-alerts-form-group">
                  <label className="rain-alerts-form-label">
                    <Settings className="icon" />
                    Active hours
                  </label>
                  <div className="rain-alerts-time-grid">
                    <div className="rain-alerts-time-input-group">
                      <label className="rain-alerts-time-label">From</label>
                      <select
                        value={preferences.preferences.timeWindow.startHour}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            timeWindow: {
                              ...prev.preferences.timeWindow,
                              startHour: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className="rain-alerts-time-select"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{formatHour(i)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rain-alerts-time-input-group">
                      <label className="rain-alerts-time-label">To</label>
                      <select
                        value={preferences.preferences.timeWindow.endHour}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            timeWindow: {
                              ...prev.preferences.timeWindow,
                              endHour: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className="rain-alerts-time-select"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{formatHour(i)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Max Alerts Per Day */}
              <div className="rain-alerts-settings-section">
                <div className="rain-alerts-form-group">
                  <label className="rain-alerts-form-label">
                    Maximum alerts per day
                  </label>
                  <select
                    value={preferences.preferences.maxAlertsPerDay}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        maxAlertsPerDay: parseInt(e.target.value)
                      }
                    }))}
                    className="rain-alerts-select"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} alert{i !== 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="rain-alerts-settings-footer">
          <div className="rain-alerts-actions">
            {preferences.enabled && (
              <button
                onClick={sendTestNotification}
                disabled={testing}
                className="rain-alerts-test-btn"
              >
                <TestTube className="icon" />
                {testing ? 'Sending...' : 'Send Test Alert'}
              </button>
            )}
            
            <button
              onClick={savePreferences}
              disabled={saving}
              className="rain-alerts-save-btn"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 