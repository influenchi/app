
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { locationData } from "./constants";

interface LocationSelectorProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

const LocationSelector = ({ selected, onSelectionChange }: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLocation = (location: string) => {
    if (selected.includes(location)) {
      onSelectionChange(selected.filter(item => item !== location));
    } else {
      onSelectionChange([...selected, location]);
    }
  };

  const removeLocation = (location: string) => {
    onSelectionChange(selected.filter(item => item !== location));
  };

  return (
    <div className="space-y-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            type="button"
          >
            {selected.length > 0 ? `${selected.length} locations selected` : "Select locations"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px] max-h-80 overflow-y-auto bg-white">
          {/* Global option */}
          <DropdownMenuItem
            className="flex items-center space-x-2 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              toggleLocation('Global');
            }}
          >
            <Checkbox checked={selected.includes('Global')} />
            <span>Global</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Country-based selections */}
          {Object.entries(locationData).map(([country, states]) => (
            <DropdownMenuSub key={country}>
              <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={selected.includes(country)} />
                  <span>{country}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-white max-h-60 overflow-y-auto">
                <DropdownMenuItem
                  className="flex items-center space-x-2 cursor-pointer font-medium"
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleLocation(country);
                  }}
                >
                  <Checkbox checked={selected.includes(country)} />
                  <span>Entire {country}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {Object.entries(states).map(([state, cities]) => (
                  <DropdownMenuSub key={state}>
                    <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={selected.includes(`${country} - ${state}`)} />
                        <span>{state}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-white max-h-48 overflow-y-auto">
                      <DropdownMenuItem
                        className="flex items-center space-x-2 cursor-pointer font-medium"
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleLocation(`${country} - ${state}`);
                        }}
                      >
                        <Checkbox checked={selected.includes(`${country} - ${state}`)} />
                        <span>Entire {state}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {cities.map((city) => (
                        <DropdownMenuItem
                          key={city}
                          className="flex items-center space-x-2 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleLocation(`${country} - ${state} - ${city}`);
                          }}
                        >
                          <Checkbox checked={selected.includes(`${country} - ${state} - ${city}`)} />
                          <span>{city}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
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

export default LocationSelector;
