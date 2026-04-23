import { render, screen } from "@testing-library/react";

import AdminSitterApplicationsPage from "./page";

describe("AdminSitterApplicationsPage", () => {
  it("renders the sitter approvals page", async () => {
    const page = await AdminSitterApplicationsPage();
    render(page);

    expect(screen.getByText("Review sitter applications")).toBeInTheDocument();
    expect(screen.getByText("Sitter applications")).toBeInTheDocument();
  });
});
