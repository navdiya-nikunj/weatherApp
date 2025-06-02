import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Droplets, Settings, TestTube, History } from 'lucide-react';
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

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://farweather-be.vercel.app/' 
  : 'http://localhost:3001';

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
  const [showHistory, setShowHistory] = useState(false);

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

  const intensityColors = {
    light: 'text-blue-600',
    moderate: 'text-yellow-600',
    heavy: 'text-red-600',
  };

  const intensityDescriptions = {
    light: 'Light rain (< 2.5mm/hr)',
    moderate: 'Moderate rain (2.5-7.5mm/hr)',
    heavy: 'Heavy rain (> 7.5mm/hr)',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Rain Alerts</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Get notified when rain is expected at {location.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {preferences.enabled ? (
                <Bell className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400 mr-3" />
              )}
              <div>
                <p className="font-medium">Rain Alerts</p>
                <p className="text-sm text-gray-600">
                  {preferences.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.enabled && (
            <>
              {/* Advance Time */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Minimum Intensity */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="h-4 w-4 mr-2" />
                  Minimum rain intensity
                </label>
                <div className="space-y-2">
                  {(['light', 'moderate', 'heavy'] as const).map((intensity) => (
                    <label key={intensity} className="flex items-center">
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
                        className="mr-3"
                      />
                      <span className={`font-medium capitalize ${intensityColors[intensity]}`}>
                        {intensity}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {intensityDescriptions[intensity]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Window */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Active hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
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
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
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
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Max Alerts Per Day */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} alert{i !== 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6">
          <div className="space-y-3">
            {preferences.enabled && (
              <button
                onClick={sendTestNotification}
                disabled={testing}
                className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? 'Sending...' : 'Send Test Alert'}
              </button>
            )}
            
            <button
              onClick={savePreferences}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 