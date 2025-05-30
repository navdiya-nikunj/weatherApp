import { FC, useEffect, useState } from 'react';
import { sdk } from "@farcaster/frame-sdk";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeatherApp } from './components/WeatherApp';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: FC = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're in a Farcaster mini app environment
        const isInMiniApp = await sdk.isInMiniApp();
        
        if (isInMiniApp) {
          // Get context for safe area insets and other info
          const frameContext = await sdk.context;
          setContext(frameContext);
          
          console.log('Farcaster context:', frameContext);
          
          // Apply safe area insets if available
          if (frameContext?.client?.safeAreaInsets) {
            const { top, bottom, left, right } = frameContext.client.safeAreaInsets;
            document.documentElement.style.setProperty('--safe-area-top', `${top}px`);
            document.documentElement.style.setProperty('--safe-area-bottom', `${bottom}px`);
            document.documentElement.style.setProperty('--safe-area-left', `${left}px`);
            document.documentElement.style.setProperty('--safe-area-right', `${right}px`);
          }
        }
        
        // Signal that the app is ready
        await sdk.actions.ready();
        setIsSDKLoaded(true);
      } catch (error) {
        console.warn('Farcaster SDK initialization failed:', error);
        // Still allow the app to work outside of Farcaster
        setIsSDKLoaded(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading until SDK is ready
  if (!isSDKLoaded) {
    return (
      <div className="app">
        <div className="weather-app">
          <div className="loading">
            <div className="loading-spinner" />
            <p className="loading-message">Initializing app...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="app"
        style={{
          paddingTop: context?.client?.safeAreaInsets?.top || 0,
          paddingBottom: context?.client?.safeAreaInsets?.bottom || 0,
          paddingLeft: context?.client?.safeAreaInsets?.left || 0,
          paddingRight: context?.client?.safeAreaInsets?.right || 0,
        }}
      >
        <WeatherApp />
      </div>
    </QueryClientProvider>
  );
}

export default App;
