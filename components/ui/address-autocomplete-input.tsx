"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AddressValue = {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
};

type AddressAutocompleteInputProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

type Suggestion = {
  description: string;
  place_id: string;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: { input: string; componentRestrictions?: { country: string } },
              callback: (
                predictions: Array<{ description: string; place_id: string }> | null,
                status: string,
              ) => void,
            ) => void;
          };
          PlacesService: new (container: HTMLDivElement) => {
            getDetails: (
              request: { placeId: string; fields: string[] },
              callback: (
                place: {
                  formatted_address?: string;
                  geometry?: { location?: { lat: () => number; lng: () => number } };
                  address_components?: Array<{ long_name: string; types: string[] }>;
                } | null,
                status: string,
              ) => void,
            ) => void;
          };
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let scriptPromise: Promise<void> | null = null;

function loadGoogleMapsPlaces(): Promise<void> {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps key"));
  if (window.google?.maps?.places) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function AddressAutocompleteInput({
  placeholder = "Start typing an address",
  required = false,
  value,
  onChange,
}: AddressAutocompleteInputProps) {
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const placesContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteServiceRef = useRef<InstanceType<NonNullable<NonNullable<typeof window.google>["maps"]>["places"]["AutocompleteService"]> | null>(null);
  const placesServiceRef = useRef<InstanceType<NonNullable<NonNullable<typeof window.google>["maps"]>["places"]["PlacesService"]> | null>(null);

  useEffect(() => {
    setQuery(value.address);
  }, [value.address]);

  useEffect(() => {
    if (typeof window === "undefined" || !apiKey) return;
    let isMounted = true;
    loadGoogleMapsPlaces()
      .then(() => {
        if (!isMounted || !window.google?.maps?.places || !placesContainerRef.current) return;
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        placesServiceRef.current = new window.google.maps.places.PlacesService(placesContainerRef.current);
        setIsReady(true);
      })
      .catch(() => setIsReady(false));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !query.trim() || query.trim().length < 3 || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }
    const handle = window.setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "il" },
        },
        (predictions, status) => {
          if (!window.google?.maps?.places || status !== window.google.maps.places.PlacesServiceStatus.OK) {
            setSuggestions([]);
            return;
          }
          setSuggestions(
            (predictions ?? []).map((item) => ({
              description: item.description,
              place_id: item.place_id,
            })),
          );
          setIsOpen(true);
        },
      );
    }, 180);
    return () => window.clearTimeout(handle);
  }, [isReady, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resolvedPlaceholder = useMemo(
    () => (apiKey ? placeholder : "Address or city"),
    [placeholder],
  );

  function handleManualChange(nextAddress: string) {
    setQuery(nextAddress);
    onChange({
      address: nextAddress,
      city: value.city || nextAddress,
      latitude: undefined,
      longitude: undefined,
    });
  }

  function selectSuggestion(suggestion: Suggestion) {
    if (!placesServiceRef.current) {
      onChange({ address: suggestion.description, city: suggestion.description });
      setQuery(suggestion.description);
      setIsOpen(false);
      return;
    }
    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ["formatted_address", "geometry", "address_components"],
      },
      (place) => {
        const city = place?.address_components?.find((item) =>
          item.types.some((type) =>
            ["locality", "postal_town", "administrative_area_level_2"].includes(type),
          ),
        )?.long_name;
        const nextAddress = place?.formatted_address || suggestion.description;
        const latitude = place?.geometry?.location?.lat();
        const longitude = place?.geometry?.location?.lng();
        onChange({
          address: nextAddress,
          city: city || nextAddress,
          latitude,
          longitude,
        });
        setQuery(nextAddress);
        setSuggestions([]);
        setIsOpen(false);
      },
    );
  }

  return (
    <div className="address-autocomplete" ref={containerRef}>
      <input
        onChange={(event) => handleManualChange(event.target.value)}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        placeholder={resolvedPlaceholder}
        required={required}
        value={query}
      />
      <div aria-hidden="true" ref={placesContainerRef} style={{ display: "none" }} />
      {isReady && isOpen && suggestions.length ? (
        <div className="address-suggestion-list">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              className="address-suggestion"
              onClick={() => selectSuggestion(suggestion)}
              type="button"
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
