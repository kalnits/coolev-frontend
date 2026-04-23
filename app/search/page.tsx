import Link from "next/link";

import { Header } from "../../components/header";
import { SearchResultsFilters } from "../../components/search-results-filters";
import { SitterCard } from "../../components/sitter-card";
import { fetchSearchFilters, fetchSitters } from "../../lib/api";
import type { SearchFilterValues } from "../../lib/types";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    city?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    serviceType?: string;
    startsAt?: string;
    fromDate?: string;
    toDate?: string;
    dogCount?: string;
    dogSizes?: string | string[];
    goodWithDogs?: string;
    goodWithCats?: string;
    goodWithKids?: string;
    minPriceIls?: string;
    maxPriceIls?: string;
    maxDistanceKm?: string;
    [key: string]: string | string[] | undefined;
  }>;
};

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const city = params.city ?? "Tel Aviv";
  const address = params.address;
  const latitude = params.latitude;
  const longitude = params.longitude;
  const serviceType = params.serviceType ?? "walking";
  const startsAt = params.startsAt;
  const fromDate = params.fromDate;
  const toDate = params.toDate;
  const dogCount = params.dogCount;
  const dogSizes = toArray(params.dogSizes);
  const goodWithDogs = params.goodWithDogs === "true";
  const goodWithCats = params.goodWithCats === "true";
  const goodWithKids = params.goodWithKids === "true";
  const minPriceIls = params.minPriceIls;
  const maxPriceIls = params.maxPriceIls;
  const maxDistanceKm = params.maxDistanceKm;
  const extraFilters = await fetchSearchFilters().catch(() => []);
  const selectedExtraFilters = extraFilters.reduce<SearchFilterValues>((accumulator, field) => {
    const value = params[field.field_key];
    if (typeof value === "string" || Array.isArray(value)) {
      accumulator[field.field_key] = value;
    }
    return accumulator;
  }, {});

  const results = await fetchSitters({
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
    minPriceIls,
    maxPriceIls,
    maxDistanceKm,
    extraFilters: selectedExtraFilters
  }).catch(() => []);

  return (
    <main className="page-shell">
      <Header />
      <section className="results-header">
        <div>
          <p className="eyebrow">Search results</p>
          <h1>Available sitters</h1>
          <p>
            {(address || city)} · {serviceType} · list-first results with a map as a secondary
            view.
          </p>
        </div>
        <div className="results-actions">
          <Link className="secondary-cta" href="/find">
            Edit search
          </Link>
          <button className="map-toggle" type="button">
            Show map
          </button>
        </div>
      </section>
      <section className="results-layout">
        <SearchResultsFilters
          address={address}
          city={city}
          dogCount={dogCount}
          dogSizes={dogSizes}
          extraFilters={extraFilters}
          fromDate={fromDate}
          goodWithCats={goodWithCats}
          goodWithDogs={goodWithDogs}
          goodWithKids={goodWithKids}
          maxDistanceKm={maxDistanceKm}
          maxPriceIls={maxPriceIls}
          minPriceIls={minPriceIls}
          latitude={latitude}
          longitude={longitude}
          serviceType={serviceType}
          startsAt={startsAt}
          toDate={toDate}
          selectedExtraFilters={selectedExtraFilters}
        />
        <div className="results-list">
          {results.length > 0 ? (
            <section className="card-grid">
              {results.map((sitter) => (
                <SitterCard
                  href={`/sitters/${sitter.id}?${new URLSearchParams(
                    Object.entries({
                      serviceType,
                      fromDate,
                      toDate,
                      startsAt,
                      city,
                      address,
                      latitude,
                      longitude,
                    }).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
                  ).toString()}`}
                  key={sitter.id}
                  sitter={{
                    id: sitter.id,
                    displayName: sitter.display_name,
                    city: sitter.city,
                    addressLabel: sitter.address_label,
                    priceLabel: sitter.price_label,
                    ratingLabel: sitter.rating_label,
                    reviewCountLabel: `${sitter.review_count} reviews`,
                    description: sitter.short_description,
                    photoUrl: sitter.photo_url,
                    badges: sitter.badges
                  }}
                />
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <h2>No sitters yet for this search</h2>
              <p>Try another city or switch between walking and boarding.</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
