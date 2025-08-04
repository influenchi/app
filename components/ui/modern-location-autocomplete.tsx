'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

interface PlaceSuggestion {
  placePrediction: {
    placeId: string;
    mainText: { text: string };
    secondaryText: { text: string };
  };
}

const ModernLocationAutocomplete = ({
  selected,
  onSelectionChange,
  placeholder = "Search for locations...",
  multiple = true
}: LocationAutocompleteProps) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);

  // Initialize Google Places API
  useEffect(() => {
    const initializeGooglePlaces = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
        console.error('Google Places API key is missing');
        return;
      }

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
          version: 'weekly',
        });

        placesLibRef.current = await loader.importLibrary('places') as google.maps.PlacesLibrary;
        setIsApiReady(true);
      } catch (error) {
        console.error('Failed to load Google Places API:', error);
      }
    };

    initializeGooglePlaces();
  }, []);

  // Search for places using the modern API
  const searchPlaces = async (query: string) => {
    if (!placesLibRef.current || !query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const { AutocompleteSuggestion } = placesLibRef.current;

      const request = {
        input: query,
        includedRegionCodes: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BR', 'JP'], // Major countries
      };

      const { suggestions: results } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      // Filter to only include city/region results
      const filteredResults = results.filter((suggestion: PlaceSuggestion) => {
        const prediction = suggestion.placePrediction;
        // You can add more filtering logic here if needed
        return prediction.mainText && prediction.secondaryText;
      });

      setSuggestions(filteredResults);
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleSelect = (suggestion: PlaceSuggestion) => {
    const prediction = suggestion.placePrediction;
    const fullAddress = `${prediction.mainText.text}, ${prediction.secondaryText.text}`;

    if (multiple) {
      if (!selected.includes(fullAddress)) {
        onSelectionChange([...selected, fullAddress]);
      }
    } else {
      onSelectionChange([fullAddress]);
    }

    setValue('');
    setSuggestions([]);
  };

  const removeLocation = (location: string) => {
    onSelectionChange(selected.filter(item => item !== location));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isApiReady ? placeholder : "Loading Google Places..."}
            disabled={!isApiReady}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => {
              const prediction = suggestion.placePrediction;
              return (
                <div
                  key={prediction.placeId}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center"
                  onClick={() => handleSelect(suggestion)}
                >
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {prediction.mainText.text}
                    </div>
                    <div className="text-xs text-gray-500">
                      {prediction.secondaryText.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          {selected.map((location, index) => (
            <Badge
              key={`${location}-${index}`}
              variant="secondary"
              className="cursor-pointer"
            >
              {location}
              <X
                className="h-3 w-3 ml-1 hover:text-red-500"
                onClick={() => removeLocation(location)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernLocationAutocomplete;