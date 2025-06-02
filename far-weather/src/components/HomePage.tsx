import { FC, useState, useEffect } from 'react';
import { MapPin, Search, Globe, Zap, Heart, Plus, Check } from 'lucide-react';
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
  const [isAppAlreadyAdded, setIsAppAlreadyAdded] = useState<boolean | null>(null);
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);

  // Check if app is already added on component mount
  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(isInMiniApp);
        if (isInMiniApp) {
          const context = await sdk.context;
          setIsAppAlreadyAdded(context?.client?.added || false);
          console.log('isAppAlreadyAdded', isAppAlreadyAdded);
        } else {
          setIsAppAlreadyAdded(false);
        }
      } catch (error) {
        console.error('Failed to check app status:', error);
        setIsAppAlreadyAdded(false);
      }
    };

    checkAppStatus();

    console.log('isAppAlreadyAdded', isAppAlreadyAdded);
  }, [sdk]);

  const handleAddMiniApp = async () => {
    try {
      console.log('handleAddMiniApp');
      console.log('isAppAlreadyAdded', isAppAlreadyAdded);
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
      setIsAppAlreadyAdded(true); // Update local state
      
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

  // Determine what to show in the Add to Home section
  const getAddToHomeContent = () => {
    if (isAppAlreadyAdded === null) {
      // Still checking status
      return {
        icon: <Plus className="icon large" />,
        title: 'Checking Status...',
        description: 'Please wait while we check your app status',
        arrow: '⏳',
        clickable: false
      };
    }

    if (isAppAlreadyAdded) {
      // App is already added
      return {
        icon: <Check className="icon large" style={{ color: '#22c55e' }} />,
        title: 'Already Added!',
        description: 'Weather app is saved to your Farcaster client',
        arrow: '✓',
        clickable: false
      };
    }

    // App not added yet - show normal add flow
    if (addAppStatus === 'success') {
      return {
        icon: <Heart className="icon large" style={{ color: '#22c55e' }} />,
        title: 'Added to Home!',
        description: 'Weather app has been added to your Farcaster client',
        arrow: '✓',
        clickable: false
      };
    }

    if (addAppStatus === 'error') {
      return {
        icon: <Plus className="icon large" />,
        title: 'Failed to Add',
        description: 'Could not add app. Try again later.',
        arrow: '→',
        clickable: true
      };
    }

    // Default state - ready to add
    return {
      icon: <Plus className="icon large" />,
      title: 'Add to Home',
      description: 'Save this weather app to your Farcaster client for quick access',
      arrow: '→',
      clickable: true
    };
  };

  const addToHomeContent = getAddToHomeContent();

  return (
    <div className="home-page">
      <div className="weather-card welcome">
        <div className="welcome-header">
          <h1>🌤️ Weather App</h1>
          <p>Get real-time weather forecasts for any location worldwide</p>
        </div>

        {/* Add to Home section */}
        {isInMiniApp && !isAppAlreadyAdded && <div className="add-app-section">
          <div 
            className={`option-card add-app-option ${
              addAppStatus !== 'idle' ? addAppStatus : ''
            } ${isAppAlreadyAdded ? 'already-added' : ''} ${
              !addToHomeContent.clickable ? 'non-clickable' : ''
            }`}
            onClick={addToHomeContent.clickable ? handleAddMiniApp : undefined}
            style={{ 
              opacity: isAddingApp ? 0.7 : 1,
              cursor: addToHomeContent.clickable ? 'pointer' : 'default'
            }}
          >
            <div className="option-icon">
              {addToHomeContent.icon}
            </div>
            <div className="option-content">
              <h3>{addToHomeContent.title}</h3>
              <p>{addToHomeContent.description}</p>
              {addAppStatus === 'idle' && !isAppAlreadyAdded && (
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
              {isAddingApp ? '⏳' : addToHomeContent.arrow}
            </div>
          </div>
        </div>
}
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