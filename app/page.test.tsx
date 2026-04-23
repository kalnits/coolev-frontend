import { render, screen } from "@testing-library/react";

import HomePage from "./page";

describe("HomePage", () => {
  it("shows the two primary marketplace actions", () => {
    render(<HomePage />);
    expect(screen.getByText("Become a sitter / walker")).toBeInTheDocument();
    expect(screen.getByText("Find a sitter / walker")).toBeInTheDocument();
  });
});
