import { fireEvent, render, screen } from "@testing-library/react";
import BookingPage from "./page";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ propertyId: "property-001" }),
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("BookingPage", () => {
  it("shows validation feedback when required request details are missing", () => {
    render(<BookingPage />);

    fireEvent.submit(screen.getByRole("button", { name: "Submit booking request" }).closest("form")!);

    expect(screen.getByText("Please complete the required booking request details.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
