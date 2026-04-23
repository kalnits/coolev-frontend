"use client";

import { useEffect, useState } from "react";

import type { SearchFilterField } from "../lib/types";
import type { IconName } from "./ui/icons";
import { MultiPickerCards, SinglePickerCards } from "./ui/picker-cards";
import { AddressAutocompleteInput } from "./ui/address-autocomplete-input";
import { SiteModal } from "./ui/site-modal";

type ServiceType = "boarding" | "walking";

const STORAGE_KEY = "coolev_search_draft";

const serviceOptions: { value: string; label: string; note: string; icon: IconName }[] = [
  { value: "boarding", label: "Boarding", note: "Overnight care", icon: "home" },
  { value: "walking", label: "Walking", note: "Daily walks", icon: "footprints" }
];

const dogCountOptions: { value: string; label: string; note: string; icon: IconName }[] = [
  { value: "1", label: "1 dog", note: "Solo care", icon: "dog" },
  { value: "2", label: "2 dogs", note: "Pair", icon: "users" },
  { value: "3", label: "3 dogs", note: "Small pack", icon: "users" },
  { value: "4", label: "4+", note: "Group", icon: "sparkles" }
];

const dogSizeOptions: { value: string; label: string; note: string; icon: IconName }[] = [
  { value: "xs", label: "Tiny", note: "0-7 kg", icon: "dog" },
  { value: "s", label: "Small", note: "8-15 kg", icon: "dog" },
  { value: "m", label: "Medium", note: "16-30 kg", icon: "dog" },
  { value: "l", label: "Large", note: "31+ kg", icon: "bone" }
];

const compatibilityOptions: { value: string; label: string; note: string; icon: IconName }[] = [
  { value: "goodWithDogs", label: "Dogs", note: "Friendly with dogs", icon: "dog" },
  { value: "goodWithCats", label: "Cats", note: "Friendly with cats", icon: "cat" },
  { value: "goodWithKids", label: "Kids", note: "Friendly with kids", icon: "baby" }
];

type SearchIntakeFormProps = {
  extraFilters: SearchFilterField[];
};

export function SearchIntakeForm({ extraFilters }: SearchIntakeFormProps) {
  const boardingDefaults = getBoardingDefaults();
  const walkingDefault = getWalkingDefault();
  const [serviceType, setServiceType] = useState<ServiceType>("boarding");
  const [address, setAddress] = useState("Tel Aviv");
  const [city, setCity] = useState("Tel Aviv");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [fromDate, setFromDate] = useState(boardingDefaults.fromDate);
  const [toDate, setToDate] = useState(boardingDefaults.toDate);
  const [startsAt, setStartsAt] = useState(walkingDefault);
  const [dogCount, setDogCount] = useState("1");
  const [dogSizes, setDogSizes] = useState<string[]>(["s", "m"]);
  const [compatibility, setCompatibility] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") return;
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return;
    try {
      const saved = JSON.parse(rawValue) as Record<string, unknown>;
      setServiceType((saved.serviceType as ServiceType) || "boarding");
      setAddress(String(saved.address || "Tel Aviv"));
      setCity(String(saved.city || "Tel Aviv"));
      setLatitude(String(saved.latitude || ""));
      setLongitude(String(saved.longitude || ""));
      setFromDate(String(saved.fromDate || boardingDefaults.fromDate));
      setToDate(String(saved.toDate || boardingDefaults.toDate));
      setStartsAt(String(saved.startsAt || walkingDefault));
      setDogCount(String(saved.dogCount || "1"));
      setDogSizes(Array.isArray(saved.dogSizes) ? saved.dogSizes.map(String) : ["s", "m"]);
      setCompatibility(Array.isArray(saved.compatibility) ? saved.compatibility.map(String) : []);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.localStorage?.setItem !== "function") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        serviceType,
        address,
        city,
        latitude,
        longitude,
        fromDate,
        toDate,
        startsAt,
        dogCount,
        dogSizes,
        compatibility,
      })
    );
  }, [address, city, compatibility, dogCount, dogSizes, fromDate, latitude, longitude, serviceType, startsAt, toDate]);

  return (
    <>
      <form action="/search" className="search-form large-search-form" method="GET">
        <div className="search-form-head">
          <div>
            <p className="eyebrow">Start with the essentials</p>
            <h2>Search dog care</h2>
          </div>
          <button className="secondary-cta" onClick={() => setIsFiltersOpen(true)} type="button">
            Preferences
          </button>
        </div>

        <div className="search-form-shell">
          <label className="full-span">
            Service
            <SinglePickerCards
              name="serviceType"
              onChange={(value) => setServiceType(value as ServiceType)}
              options={serviceOptions}
              value={serviceType}
            />
          </label>

          <label className="full-span">
            Address
            <AddressAutocompleteInput
              onChange={(value) => {
                setAddress(value.address);
                setCity(value.city);
                setLatitude(value.latitude ? String(value.latitude) : "");
                setLongitude(value.longitude ? String(value.longitude) : "");
              }}
              required
              value={{ address, city, latitude: latitude ? Number(latitude) : undefined, longitude: longitude ? Number(longitude) : undefined }}
            />
            <input name="address" type="hidden" value={address} />
            <input name="city" type="hidden" value={city || address} />
            <input name="latitude" type="hidden" value={latitude} />
            <input name="longitude" type="hidden" value={longitude} />
          </label>

          {serviceType === "boarding" ? (
            <div className="search-grid full-span">
              <label>
                Drop off
                <input
                  name="fromDate"
                  onChange={(event) => {
                    const nextFromDate = event.target.value;
                    setFromDate(nextFromDate);
                    const suggestedToDate = addDaysToDateValue(nextFromDate, 2);
                    if (!toDate || toDate <= nextFromDate) {
                      setToDate(suggestedToDate);
                    }
                  }}
                  required
                  type="date"
                  value={fromDate}
                />
              </label>
              <label>
                Pick up
                <input name="toDate" onChange={(event) => setToDate(event.target.value)} required type="date" value={toDate} />
              </label>
            </div>
          ) : (
            <label className="full-span">
              Date and time
              <input name="startsAt" onChange={(event) => setStartsAt(event.target.value)} required type="datetime-local" value={startsAt} />
            </label>
          )}

          <label className="full-span">
            How many dogs
            <SinglePickerCards name="dogCount" onChange={setDogCount} options={dogCountOptions} value={dogCount} />
          </label>

          {dogSizes.map((value) => (
            <input key={value} name="dogSizes" type="hidden" value={value} />
          ))}
          {compatibility.includes("goodWithDogs") ? <input name="goodWithDogs" type="hidden" value="true" /> : null}
          {compatibility.includes("goodWithCats") ? <input name="goodWithCats" type="hidden" value="true" /> : null}
          {compatibility.includes("goodWithKids") ? <input name="goodWithKids" type="hidden" value="true" /> : null}

          <div className="search-compact-summary full-span">
            <span>{dogSizes.length} size preferences</span>
            {serviceType === "boarding" ? <span>{compatibility.length} boarding preferences</span> : null}
          </div>
        </div>

        <button className="primary-cta" type="submit">
          Search sitters
        </button>
      </form>

      <SiteModal
        actions={
          <button className="primary-cta" onClick={() => setIsFiltersOpen(false)} type="button">
            Done
          </button>
        }
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        title="Search preferences"
      >
        <div className="dynamic-filter-stack">
          <div>
            <p className="eyebrow">Dog sizes</p>
            <MultiPickerCards name="dogSizesPreview" onChange={setDogSizes} options={dogSizeOptions} values={dogSizes} />
          </div>

          {serviceType === "boarding" ? (
            <div>
              <p className="eyebrow">Compatibility</p>
              <MultiPickerCards name="compatibilityPreview" onChange={setCompatibility} options={compatibilityOptions} values={compatibility} />
            </div>
          ) : null}

          {extraFilters.length ? <input name="hasDynamicFilters" type="hidden" value="true" /> : null}
        </div>
      </SiteModal>
    </>
  );
}

function getBoardingDefaults() {
  const now = new Date();
  const pickup = new Date(now);
  pickup.setDate(pickup.getDate() + 2);
  return {
    fromDate: toDateValue(now),
    toDate: toDateValue(pickup)
  };
}

function getWalkingDefault() {
  return toDateTimeLocalValue(roundToHalfHour(new Date()));
}

function roundToHalfHour(value: Date) {
  const rounded = new Date(value);
  rounded.setMinutes(rounded.getMinutes() < 30 ? 30 : 0, 0, 0);
  if (value.getMinutes() >= 30) {
    rounded.setHours(rounded.getHours() + 1);
  }
  return rounded;
}

function toDateTimeLocalValue(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function toDateValue(value: Date) {
  return toDateTimeLocalValue(value).slice(0, 10);
}

function addDaysToDateValue(value: string, days: number) {
  const base = new Date(`${value}T00:00:00`);
  base.setDate(base.getDate() + days);
  return toDateValue(base);
}
