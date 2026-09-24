import { render, screen } from "@testing-library/react";
import PropertiesPage from "./page";

describe("PropertiesPage", () => {
  it("presents a curated Homestay by Patricia collection with search", () => {
    render(<PropertiesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /private homes, hosted with care/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/homestay by patricia/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /browse stays/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /request dates\. patricia reviews/i })).toBeInTheDocument();
    const stayLinks = screen.getAllByRole("link", { name: /patricia modern terrace homestay/i });
    expect(stayLinks.length).toBeGreaterThan(0);
    stayLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/properties/patricia-modern-terrace-homestay");
    });
  });
});
