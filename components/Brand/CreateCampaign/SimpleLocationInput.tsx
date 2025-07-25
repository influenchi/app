
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface SimpleLocationInputProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

const SimpleLocationInput = ({ selected, onSelectionChange }: SimpleLocationInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addLocation = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !selected.includes(trimmedValue)) {
      onSelectionChange([...selected, trimmedValue]);
      setInputValue("");
    }
  };

  const removeLocation = (location: string) => {
    onSelectionChange(selected.filter(item => item !== location));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter city, state, or country..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addLocation}
          size="sm"
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
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

export default SimpleLocationInput;
