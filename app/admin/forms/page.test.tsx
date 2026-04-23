import { render, screen } from "@testing-library/react";

import AdminFormsPage from "./page";

describe("AdminFormsPage", () => {
  it("renders the schema manager headline", async () => {
    const page = await AdminFormsPage();
    render(page);

    expect(screen.getByText("Manage dynamic forms")).toBeInTheDocument();
  });
});
