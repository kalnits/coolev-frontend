import { render, screen } from "@testing-library/react";

import BookingPage from "./page";

describe("BookingPage", () => {
  it("renders the detailed booking flow with pet fields", async () => {
    const page = await BookingPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({ fromDate: "2026-04-25", toDate: "2026-04-27" })
    });
    render(page);

    expect(screen.getByText("Complete your request")).toBeInTheDocument();
    expect(screen.getByText(/Dates:/)).toBeInTheDocument();
    expect(screen.getByText("Login required")).toBeInTheDocument();
    expect(screen.getByText("Login or register")).toBeInTheDocument();
  });
});
