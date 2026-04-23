import { render, screen } from "@testing-library/react";

import BecomeASitterPage from "./page";

describe("BecomeASitterPage", () => {
  it("renders the combined sitter onboarding form", () => {
    render(<BecomeASitterPage />);
    expect(screen.getByText("Become a sitter / walker")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText(/becomes visible in search/i)).toBeInTheDocument();
  });
});
