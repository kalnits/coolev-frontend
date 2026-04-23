import { render, screen } from "@testing-library/react";

import SitterProfilePage from "./page";

describe("SitterProfilePage", () => {
  it("renders the public sitter profile layout", async () => {
    const page = await SitterProfilePage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({})
    });
    render(page);

    expect(screen.getByText("Book dog care with confidence.")).toBeInTheDocument();
    expect(screen.getByText("Boarding details")).toBeInTheDocument();
    expect(screen.getByText("Walking details")).toBeInTheDocument();
    expect(screen.getAllByText("Reviews").length).toBeGreaterThan(0);
    expect(screen.getByText("Starting price:")).toBeInTheDocument();
    expect(screen.getAllByText("Starting price").length).toBeGreaterThan(0);
  });
});
