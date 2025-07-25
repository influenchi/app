
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, MapPin } from "lucide-react";
import { locationData } from "./constants";

interface SmartLocationInputProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

const SmartLocationInput = ({ selected, onSelectionChange }: SmartLocationInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Create a flat list of all locations for search
  const allLocations = React.useMemo(() => {
    const locations: string[] = ['Global'];
    
    Object.entries(locationData).forEach(([country, states]) => {
      locations.push(country);
      Object.entries(states).forEach(([state, cities]) => {
        locations.push(`${country} - ${state}`);
        cities.forEach(city => {
          locations.push(`${country} - ${state} - ${city}`);
        });
      });
    });
    
    return locations;
  }, []);

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = allLocations.filter(location =>
        location.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selected.includes(location)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, selected, allLocations]);

  const addLocation = (location?: string) => {
    const locationToAdd = location || inputValue.trim();
    if (locationToAdd && !selected.includes(locationToAdd)) {
      onSelectionChange([...selected, locationToAdd]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeLocation = (location: string) => {
    onSelectionChange(selected.filter(item => item !== location));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addLocation(suggestions[0]);
      } else {
        addLocation();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
              placeholder="Enter city, state, or country..."
              className="pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            type="button"
            onClick={() => addLocation()}
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => addLocation(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="cursor-pointer"
            >
              {location}
              <X
                className="h-3 w-3 ml-1"
                onClick={() => removeLocation(location)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartLocationInput;
