import React from "react";
import { render, screen } from "@testing-library/react";

import { SitterCard } from "./sitter-card";

describe("SitterCard", () => {
  it("renders sitter summary information", () => {
    render(
      <SitterCard
        sitter={{
          id: 1,
          displayName: "Maya",
          city: "Tel Aviv",
          addressLabel: "Tel Aviv, Old North",
          priceLabel: "₪90",
          ratingLabel: "4.9",
          reviewCountLabel: "18 reviews",
          description: "Calm boarding and city walks",
          photoUrl: "https://images.example.com/maya.jpg",
          badges: ["Fast replies", "Near park"]
        }}
      />
    );

    expect(screen.getByText("Maya")).toBeInTheDocument();
    expect(screen.getByText("Tel Aviv, Old North")).toBeInTheDocument();
    expect(screen.getByText("₪90")).toBeInTheDocument();
    expect(screen.getByText("18 reviews")).toBeInTheDocument();
    expect(screen.getByText("Calm boarding and city walks")).toBeInTheDocument();
    expect(screen.getByText("Fast replies")).toBeInTheDocument();
  });
});
