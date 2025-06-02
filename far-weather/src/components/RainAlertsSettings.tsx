import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Droplets, Settings, TestTube, AlertCircle, CheckCircle, X } from 'lucide-react';
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

interface ErrorState {
  message: string;
  type: 'error' | 'success' | 'info';
}

const API_BASE_URL = process.env.BACKEND_URL || 'https://farweather-8shtm0qsr-navdiya-nikunjs-projects.vercel.app';


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
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  useEffect(() => {
    if (userContext) {
      loadPreferences();
    }
  }, [userContext]);

  // Auto-hide success messages after 5 seconds
  useEffect(() => {
    if (errorState?.type === 'success') {
      const timer = setTimeout(() => {
        setErrorState(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorState]);

  const showError = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setErrorState({ message, type });
  };

  const hideError = () => {
    setErrorState(null);
  };

  const parseErrorMessage = async (response: Response): Promise<string> => {
    try {
      const data = await response.json();
      return data.error || data.message || `Server error (${response.status})`;
    } catch {
      return `Network error (${response.status} ${response.statusText})`;
    }
  };

  const loadUserContext = async () => {
    try {
      const context = await sdk.context;
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
      showError('Failed to load user context. Please refresh and try again.');
    }
  };

  const loadPreferences = async () => {
    if (!userContext?.user?.fid) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/preferences/${userContext.user.fid}`);
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.rainAlerts);
      } else if (response.status === 404) {
        // User preferences not found, use defaults
        console.log('No existing preferences found, using defaults');
      } else {
        const errorMessage = await parseErrorMessage(response);
        showError(`Failed to load settings: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      showError('Network error while loading settings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!userContext?.user) {
      showError('User context not available. Please refresh and try again.');
      return;
    }
    
    setSaving(true);
    hideError();
    
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
        showError('Rain alert settings saved successfully! 🎉', 'success');
      } else {
        const errorMessage = await parseErrorMessage(response);
        showError(`Failed to save settings: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showError('Network error while saving settings. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    if (!userContext?.user?.fid) {
      showError('User context not available. Please refresh and try again.');
      return;
    }
    
    setTesting(true);
    hideError();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/test/${userContext.user.fid}`, {
        method: 'POST',
      });

      if (response.ok) {
        showError('Test notification sent successfully! Check your Farcaster direct messages. 📱', 'success');
      } else {
        const errorMessage = await parseErrorMessage(response);
        if (response.status === 404) {
          showError('Please save your settings first before sending a test notification.');
        } else if (response.status === 429) {
          showError('Too many test notifications. Please wait a moment before trying again.');
        } else {
          showError(`Failed to send test notification: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error sending test:', error);
      showError('Network error while sending test notification. Please check your connection.');
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
          
          {/* Error/Success Messages */}
          {errorState && (
            <div className={`rain-alerts-message rain-alerts-message-${errorState.type}`}>
              <div className="rain-alerts-message-content">
                <div className="rain-alerts-message-icon">
                  {errorState.type === 'error' && <AlertCircle className="icon" />}
                  {errorState.type === 'success' && <CheckCircle className="icon" />}
                  {errorState.type === 'info' && <Bell className="icon" />}
                </div>
                <div className="rain-alerts-message-text">
                  {errorState.message}
                </div>
                <button
                  onClick={hideError}
                  className="rain-alerts-message-close"
                >
                  <X className="icon" />
                </button>
              </div>
            </div>
          )}
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