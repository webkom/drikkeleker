import React, { useRef, useEffect } from "react";
import SuggestionDropdown from "./suggestion-dropdown";
import { Textarea } from "@/components/ui/textarea";

const CURSOR_TOKEN = "{{cursor}}";

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export default function QuestionInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Del ut 3 slurker til den som...",
  className,
}: QuestionInputProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (taRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    const textarea = taRef.current;
    if (textarea) {
      textarea.addEventListener("focus", handleFocus);
      return () => {
        textarea.removeEventListener("focus", handleFocus);
      };
    }
  }, []);

  useEffect(() => {
    let lastTap = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        const now = Date.now();
        const timeDiff = now - lastTap;
        if (timeDiff < 300) {
          e.preventDefault();
        }
        lastTap = now;
      }
    };

    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, []);

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
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-3 pb-12 question-input-container ${className || ""}`}
    >
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
        rows={3}
        className="question-input-textarea resize-none !overflow-y-auto bg-white/90 backdrop-blur-sm border-violet-200 focus:border-violet-400 placeholder:text-gray-400 text-gray-700 shadow-sm transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-violet-500/20"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "manipulation",
          fontSize: "16px",
          marginBottom: "1rem",
        }}
      />
    </div>
  );
}
