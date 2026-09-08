"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, MapPin } from "lucide-react";

import { searchPlaces, type PlaceSuggestion } from "@/features/geo/photon";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LocationSearchInput({
  id,
  placeholder,
  defaultValue,
  near,
  onSelect,
}: {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  near?: { lat: number; lng: number };
  onSelect: (place: PlaceSuggestion) => void;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [hasPicked, setHasPicked] = useState(Boolean(defaultValue));

  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["place-search", debouncedQuery, near?.lat, near?.lng],
    queryFn: ({ signal }) => searchPlaces(debouncedQuery, { near, signal }),
    enabled: !hasPicked && debouncedQuery.trim().length >= 3,
    staleTime: 60_000,
  });

  const shouldShowDropdown = isOpen && !hasPicked && suggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(place: PlaceSuggestion) {
    setQuery(place.label);
    setHasPicked(true);
    setIsOpen(false);
    onSelect(place);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!shouldShowDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(suggestions[highlighted]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={query}
          placeholder={placeholder ?? "Search for a place..."}
          className="pl-8"
          onChange={(e) => {
            setQuery(e.target.value);
            setHasPicked(false);
            setHighlighted(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {isFetching ? (
          <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {shouldShowDropdown ? (
        <ul className="absolute z-[1200] mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-popover shadow-lg">
          {suggestions.map((place, index) => (
            <li key={place.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                  index === highlighted && "bg-muted"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(place)}
                onMouseEnter={() => setHighlighted(index)}
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
