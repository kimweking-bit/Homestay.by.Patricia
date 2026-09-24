import { render, screen } from "@testing-library/react";
import { PropertyCard } from "@/components/shared/property-card";
import { properties } from "@/lib/mock-data";

describe("PropertyCard", () => {
  it("links the full card to the stay detail route with clear hierarchy", () => {
    const property = properties[0];

    render(<PropertyCard property={property} />);

    expect(screen.getByRole("heading", { name: property.name })).toBeInTheDocument();
    expect(screen.getByText(property.location)).toBeInTheDocument();
    expect(screen.getByText(property.guests)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(property.name, "i") })).toHaveAttribute(
      "href",
      `/properties/${property.slug}`,
    );
  });
});
