import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SmartSearchInputProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

const EXAMPLE_QUERIES = [
  "Land near Nairobi under 2M with growth potential",
  "3 bedroom house in Karen for rent",
  "Investment apartment in Westlands",
  "Commercial property in Mombasa",
  "Affordable land in Syokimau",
];

export function SmartSearchInput({
  onSearch,
  isSearching,
  suggestions,
  onSuggestionClick,
  className,
}: SmartSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-5 h-5 text-primary" />
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Ask AI: e.g., 'Land near Nairobi under 2M with growth potential'"
            className="pl-16 pr-24 py-6 text-base bg-background border-2 border-primary/20 focus:border-primary rounded-xl shadow-lg"
            disabled={isSearching}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isSearching}
              className="rounded-lg"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Example queries */}
      {isFocused && !query && (
        <div className="mt-2 p-3 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions from last search */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 relative z-20 bg-background/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-md">
          <span className="text-xs text-muted-foreground block mb-1.5">Related:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
