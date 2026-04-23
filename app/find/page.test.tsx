import { fireEvent, render, screen } from "@testing-library/react";

import FindPage from "./page";

describe("FindPage", () => {
  it("renders boarding-specific fields when boarding is selected", async () => {
    const page = await FindPage();
    render(page);

    fireEvent.click(screen.getByText("Boarding"));

    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Drop off")).toBeInTheDocument();
    expect(screen.getByLabelText("Pick up")).toBeInTheDocument();
    expect(screen.getByText("How many dogs")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Preferences" }));

    expect(screen.getByRole("dialog", { name: "Search preferences" })).toBeInTheDocument();
    expect(screen.getByText("Compatibility")).toBeInTheDocument();
  });

  it("renders walking-specific date time field when walking is selected", async () => {
    const page = await FindPage();
    render(page);

    fireEvent.click(screen.getByText("Walking"));

    expect(screen.getByLabelText("Date and time")).toBeInTheDocument();
  });
});
