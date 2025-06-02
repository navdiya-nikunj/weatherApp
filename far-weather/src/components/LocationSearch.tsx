import { FC, useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import type { Location } from '../types/weather';

interface LocationSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: Location[];
  onLocationSelect: (location: Location) => void;
  isSearching: boolean;
  searchError: Error | null;
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export const LocationSearch: FC<LocationSearchProps> = ({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onLocationSelect,
  isSearching,
  searchError,
  placeholder = 'Search for a city...',
  compact = false,
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when search results are available
  useEffect(() => {
    if (searchResults.length > 0 && searchQuery.length >= 2) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [searchResults, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchQueryChange(value);
    if (value.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? searchResults.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleLocationSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearchQueryChange('');
    inputRef.current?.blur();
  };

  // const formatLocationName = (location: Location): string => {
  //   const parts = [location.name];
  //   if (location.admin1) parts.push(location.admin1);
  //   if (location.country) parts.push(location.country);
  //   return parts.join(', ');
  // };

  return (
    <div className={`location-search ${compact ? 'compact' : ''}`} ref={containerRef}>
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0 && searchQuery.length >= 2) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className="search-input"
            autoFocus={autoFocus}
          />
          {isSearching && (
            <Loader className="loading-icon" size={18} />
          )}
        </div>
      </div>

      {searchError && !isSearching && (
        <div className="search-error">
          <p className="text-sm text-red-600">
            {searchError.message}
          </p>
        </div>
      )}

      {isOpen && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((location, index) => (
            <button
              key={`${location.latitude}-${location.longitude}`}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleLocationSelect(location)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <MapPin className="result-icon" size={16} />
              <div className="result-content">
                <div className="result-name">{location.name}</div>
                <div className="result-details">
                  {[location.admin1, location.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="search-results">
          <div className="no-results">
            <p>No locations found for "{searchQuery}"</p>
          </div>
        </div>
      )}
    </div>
  );
}; 