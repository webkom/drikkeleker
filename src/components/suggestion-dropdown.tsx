import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";

type SuggestionDropdownProps = {
  suggestions: string[];
  onSelect: (template: string) => void;
  label?: string;
};

export default function SuggestionDropdown({
  suggestions,
  onSelect,
  label = "Forslag",
}: SuggestionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/90 hover:bg-white border-violet-200 hover:border-violet-300 text-violet-700 hover:text-violet-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 bg-white/95 backdrop-blur-sm border-violet-200 shadow-xl"
        align="start"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-violet-700 font-semibold flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Velg ett forslag:
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-violet-100" />
        {suggestions.map((suggestion, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelect(suggestion)}
            className="cursor-pointer hover:bg-violet-50 focus:bg-violet-50 text-gray-700 hover:text-violet-700 transition-colors duration-150 py-3"
          >
            <span className="text-sm leading-relaxed">
              {suggestion.replace("{{cursor}}", "___")}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
