import { FC, useState } from 'react';
import { MapPin, Search, Globe, Zap, Heart, Plus } from 'lucide-react';
import { sdk } from "@farcaster/frame-sdk";

interface HomePageProps {
  onRequestCurrentLocation: () => void;
  onStartLocationSearch: () => void;
  hasLocationBefore?: boolean;
}

export const HomePage: FC<HomePageProps> = ({
  onRequestCurrentLocation,
  onStartLocationSearch,
  hasLocationBefore = false,
}) => {
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [addAppStatus, setAddAppStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAddMiniApp = async () => {
    try {
      setIsAddingApp(true);
      setAddAppStatus('idle');
      
      // Check if we're in a mini app environment
      const isInMiniApp = await sdk.isInMiniApp();
      
      if (!isInMiniApp) {
        console.warn('Not in a Farcaster mini app environment');
        setAddAppStatus('error');
        return;
      }

      // Call the addMiniApp action
      await sdk.actions.addMiniApp();
      setAddAppStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setAddAppStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add mini app:', error);
      setAddAppStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setAddAppStatus('idle');
      }, 3000);
    } finally {
      setIsAddingApp(false);
    }
  };

  return (
    <div className="home-page">
      <div className="weather-card welcome">
        <div className="welcome-header">
          <h1>🌤️ Weather App</h1>
          <p>Get real-time weather forecasts for any location worldwide</p>
        </div>

        {/* Add to Home section */}
        <div className="add-app-section">
          <div 
            className={`option-card add-app-option ${addAppStatus !== 'idle' ? addAppStatus : ''}`}
            onClick={handleAddMiniApp}
            style={{ opacity: isAddingApp ? 0.7 : 1 }}
          >
            <div className="option-icon">
              {addAppStatus === 'success' ? (
                <Heart className="icon large" style={{ color: '#22c55e' }} />
              ) : (
                <Plus className="icon large" />
              )}
            </div>
            <div className="option-content">
              <h3>
                {addAppStatus === 'success' 
                  ? 'Added to Home!' 
                  : addAppStatus === 'error' 
                    ? 'Failed to Add' 
                    : 'Add to Home'
                }
              </h3>
              <p>
                {addAppStatus === 'success'
                  ? 'Weather app has been added to your Farcaster client'
                  : addAppStatus === 'error'
                    ? 'Could not add app. Try again later.'
                    : 'Save this weather app to your Farcaster client for quick access'
                }
              </p>
              {addAppStatus === 'idle' && (
                <div className="option-benefits">
                  <div className="benefit">
                    <Zap className="icon small" />
                    <span>Quick access</span>
                  </div>
                  <div className="benefit">
                    <Heart className="icon small" />
                    <span>Save favorite</span>
                  </div>
                </div>
              )}
            </div>
            <div className="option-arrow">
              {isAddingApp ? '⏳' : addAppStatus === 'success' ? '✓' : '→'}
            </div>
          </div>
        </div>

        <div className="divider">
          <span>Get Weather</span>
        </div>

        <div className="home-options">
          <div className="option-card location-option" onClick={onRequestCurrentLocation}>
            <div className="option-icon">
              <MapPin className="icon large" />
            </div>
            <div className="option-content">
              <h3>Use Current Location</h3>
              <p>Get weather for your current location set in your farcaster profile</p>
              <div className="option-benefits">
                <div className="benefit">
                  <Zap className="icon small" />
                  <span>Instant access</span>
                </div>
                <div className="benefit">
                  <Globe className="icon small" />
                  <span>Always accurate</span>
                </div>
              </div>
            </div>
            <div className="option-arrow">→</div>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="option-card search-option" onClick={onStartLocationSearch}>
            <div className="option-icon">
              <Search className="icon large" />
            </div>
            <div className="option-content">
              <h3>Search for City</h3>
              <p>Enter any city name to get weather information</p>
              <div className="option-benefits">
                <div className="benefit">
                  <Globe className="icon small" />
                  <span>Global coverage</span>
                </div>
                <div className="benefit">
                  <Search className="icon small" />
                  <span>Easy search</span>
                </div>
              </div>
            </div>
            <div className="option-arrow">→</div>
          </div>
        </div>

        {hasLocationBefore && (
          <div className="home-note">
            <p>Your previous location has been cleared. Choose an option above to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 