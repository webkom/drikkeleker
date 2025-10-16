import React, { useRef } from "react";
import SuggestionDropdown from "./suggestion-dropdown";
import { Textarea } from "@/components/ui/textarea";

type QuestionInputProps = {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
};

const CURSOR_TOKEN = "{{cursor}}";

export default function QuestionInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Del ut 3 slurker til den som...",
  className,
}: QuestionInputProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const insertTemplate = (template: string) => {
    const tokenIndex = template.indexOf(CURSOR_TOKEN);
    const clean = template.replace(CURSOR_TOKEN, "");
    const ta = taRef.current;

    const newValue = clean;
    const caretPos = tokenIndex === -1 ? clean.length : tokenIndex;

    onChange(newValue);

    setTimeout(() => {
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(caretPos, caretPos);
    }, 300);
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className || ""}`}>
      {suggestions.length > 0 && (
        <div className="flex items-center">
          <SuggestionDropdown
            suggestions={suggestions}
            onSelect={insertTemplate}
            label="Forslag"
          />
        </div>
      )}

      <Textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none bg-white/90 backdrop-blur-sm border-violet-200 focus:border-violet-400 placeholder:text-gray-400 text-gray-700 shadow-sm transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-violet-500/20"
      />
    </div>
  );
}
