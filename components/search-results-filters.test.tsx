import { fireEvent, render, screen } from "@testing-library/react";

import { SearchResultsFilters } from "./search-results-filters";

describe("SearchResultsFilters", () => {
  it("renders only the filter trigger until the popup opens", () => {
    render(
      <SearchResultsFilters
        city="Tel Aviv"
        dogCount="1"
        dogSizes={[]}
        extraFilters={[
          {
            field_key: "house_type",
            label: "House type",
            field_type: "select",
            options: [
              { value: "apartment", label: "Apartment" },
              { value: "house", label: "House" }
            ]
          }
        ]}
        goodWithCats={false}
        goodWithDogs={false}
        goodWithKids={false}
        selectedExtraFilters={{}}
        serviceType="walking"
      />
    );

    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Where")).not.toBeInTheDocument();
  });

  it("shows price, house type, and distance filters in the popup", () => {
    render(
      <SearchResultsFilters
        city="Tel Aviv"
        dogCount="2"
        dogSizes={["m"]}
        extraFilters={[
          {
            field_key: "house_type",
            label: "House type",
            field_type: "select",
            options: [
              { value: "apartment", label: "Apartment" },
              { value: "house", label: "House" }
            ]
          }
        ]}
        goodWithCats={true}
        goodWithDogs={true}
        goodWithKids={false}
        maxDistanceKm="5"
        maxPriceIls="120"
        minPriceIls="80"
        selectedExtraFilters={{ house_type: "apartment" }}
        serviceType="boarding"
        fromDate="2026-04-24"
        toDate="2026-04-26"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter (4)" }));

    expect(screen.getByRole("dialog", { name: "Refine results" })).toBeInTheDocument();
    expect(screen.getByLabelText("Min price")).toHaveValue(80);
    expect(screen.getByLabelText("Max price")).toHaveValue(120);
    expect(screen.getByDisplayValue("apartment")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });
});
