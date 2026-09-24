import { fireEvent, render, screen } from "@testing-library/react";
import { GalleryGrid } from "./gallery-grid";
import { properties } from "@/lib/mock-data";

describe("GalleryGrid", () => {
  const galleryProperties = properties.filter((property) => property.collection);

  it("filters the stay rail by collection and search term", () => {
    render(<GalleryGrid properties={galleryProperties} />);

    fireEvent.click(screen.getByRole("button", { name: "Homes" }));
    expect(screen.getByRole("button", { name: "Open Garden Light Residence gallery" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Skyline Balcony Residence gallery" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search stays" }), { target: { value: "parkside" } });
    expect(screen.getByRole("button", { name: "Open Parkside Contemporary Home gallery" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Garden Light Residence gallery" })).not.toBeInTheDocument();
  });
});
