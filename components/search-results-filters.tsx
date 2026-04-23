"use client";

import { useState } from "react";

import type { SearchFilterField } from "../lib/types";
import { SinglePickerCards } from "./ui/picker-cards";
import { SiteModal } from "./ui/site-modal";

type SearchResultsFiltersProps = {
  city: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  serviceType: string;
  startsAt?: string;
  fromDate?: string;
  toDate?: string;
  dogCount?: string;
  dogSizes: string[];
  goodWithDogs: boolean;
  goodWithCats: boolean;
  goodWithKids: boolean;
  extraFilters: SearchFilterField[];
  selectedExtraFilters: Record<string, string | string[]>;
  minPriceIls?: string;
  maxPriceIls?: string;
  maxDistanceKm?: string;
};

const houseOptions = [
  { value: "", label: "Any home", note: "Show all", icon: "✨" },
  { value: "apartment", label: "Apartment", note: "City home", icon: "🏢" },
  { value: "house", label: "House", note: "More space", icon: "🏠" }
];

const distanceOptions = [
  { value: "", label: "Any distance", note: "Show all", icon: "∞" },
  { value: "3", label: "Up to 3 km", note: "Closest first", icon: "📍" },
  { value: "5", label: "Up to 5 km", note: "Short ride", icon: "🗺️" },
  { value: "10", label: "Up to 10 km", note: "Wider area", icon: "🚗" },
  { value: "25", label: "Up to 25 km", note: "Regional", icon: "🌍" }
];

export function SearchResultsFilters({
  city,
  address,
  latitude,
  longitude,
  serviceType,
  startsAt,
  fromDate,
  toDate,
  dogCount,
  dogSizes,
  goodWithDogs,
  goodWithCats,
  goodWithKids,
  extraFilters,
  selectedExtraFilters,
  minPriceIls,
  maxPriceIls,
  maxDistanceKm
}: SearchResultsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [houseType, setHouseType] = useState(
    Array.isArray(selectedExtraFilters.house_type) ? selectedExtraFilters.house_type[0] : String(selectedExtraFilters.house_type || "")
  );
  const [distance, setDistance] = useState(maxDistanceKm ?? "");
  const activeFilterCount = [minPriceIls, maxPriceIls, distance, houseType].filter(Boolean).length;

  return (
    <>
      <div className="filter-toolbar">
        <button className="secondary-cta" onClick={() => setIsOpen(true)} type="button">
          Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      <SiteModal
        actions={<button className="primary-cta" form="results-filter-form" type="submit">Apply filters</button>}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Refine results"
      >
        <form action="/search" className="filter-form" id="results-filter-form" method="GET">
          <input name="city" type="hidden" value={city} />
          {address ? <input name="address" type="hidden" value={address} /> : null}
          {latitude ? <input name="latitude" type="hidden" value={latitude} /> : null}
          {longitude ? <input name="longitude" type="hidden" value={longitude} /> : null}
          <input name="serviceType" type="hidden" value={serviceType} />
          {startsAt ? <input name="startsAt" type="hidden" value={startsAt} /> : null}
          {fromDate ? <input name="fromDate" type="hidden" value={fromDate} /> : null}
          {toDate ? <input name="toDate" type="hidden" value={toDate} /> : null}
          {dogCount ? <input name="dogCount" type="hidden" value={dogCount} /> : null}
          {dogSizes.map((dogSize) => (
            <input key={dogSize} name="dogSizes" type="hidden" value={dogSize} />
          ))}
          {goodWithDogs ? <input name="goodWithDogs" type="hidden" value="true" /> : null}
          {goodWithCats ? <input name="goodWithCats" type="hidden" value="true" /> : null}
          {goodWithKids ? <input name="goodWithKids" type="hidden" value="true" /> : null}

          <div className="dynamic-filter-stack">
            <div className="search-grid">
              <label>
                Min price
                <input defaultValue={minPriceIls} min="0" name="minPriceIls" type="number" />
              </label>
              <label>
                Max price
                <input defaultValue={maxPriceIls} min="0" name="maxPriceIls" type="number" />
              </label>
            </div>

            {extraFilters.find((field) => field.field_key === "house_type") ? (
              <label>
                Home type
                <SinglePickerCards name="house_type" onChange={setHouseType} options={houseOptions} value={houseType} />
              </label>
            ) : null}

            <label>
              Distance
              <SinglePickerCards name="maxDistanceKm" onChange={setDistance} options={distanceOptions} value={distance} />
            </label>
          </div>
        </form>
      </SiteModal>
    </>
  );
}
