import { FC } from 'react';
import { MapPin, User, Settings, Loader } from 'lucide-react';

interface LocationPermissionPromptProps {
  onAllowLocation: () => void;
  onDenyLocation: () => void;
  isDetecting: boolean;
}

export const LocationPermissionPrompt: FC<LocationPermissionPromptProps> = ({
  onAllowLocation,
  onDenyLocation,
  isDetecting,
}) => {
  return (
    <div className="weather-card">
      <div className="location-permission-prompt">
        <div className="permission-icon">
          {isDetecting ? (
            <Loader className="icon large spinning" />
          ) : (
            <User className="icon large" />
          )}
        </div>
        
        <div className="permission-content">
          <h2>Access Your Farcaster Location</h2>
          <p className="permission-description">
            {isDetecting 
              ? "Getting your location from your Farcaster profile..."
              : "We'll use the location you've set in your Farcaster profile to show you personalized weather information."
            }
          </p>
          
          {!isDetecting && (
            <>
              <div className="permission-benefits">
                <div className="benefit-item">
                  <MapPin className="icon small" />
                  <span>Instant weather for your location</span>
                </div>
                <div className="benefit-item">
                  <User className="icon small" />
                  <span>Uses your Farcaster profile location</span>
                </div>
                <div className="benefit-item">
                  <Settings className="icon small" />
                  <span>No additional permissions needed</span>
                </div>
              </div>
              
              <div className="permission-actions">
                <button
                  className="permission-button primary"
                  onClick={onAllowLocation}
                  disabled={isDetecting}
                >
                  <User className="icon" />
                  Use Profile Location
                </button>
                
                <button
                  className="permission-button secondary"
                  onClick={onDenyLocation}
                  disabled={isDetecting}
                >
                  Search for City Instead
                </button>
              </div>
              
              <p className="permission-note">
                Don't have a location set? You can add one in your Farcaster profile settings.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 