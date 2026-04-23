import { render, screen } from "@testing-library/react";

import { BookingRequestForm } from "./booking-request-form";

describe("BookingRequestForm", () => {
  it("renders the booking request action", () => {
    render(<BookingRequestForm />);
    expect(screen.getByText("Request to book")).toBeInTheDocument();
  });
});
