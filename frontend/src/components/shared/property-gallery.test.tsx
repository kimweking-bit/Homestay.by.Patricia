import { fireEvent, render, screen } from "@testing-library/react";
import { PropertyGallery } from "./property-gallery";
import { imagePaths } from "@/lib/image-paths";

describe("PropertyGallery", () => {
  it("opens, advances, and closes the gallery dialog", () => {
    render(
      <PropertyGallery
        images={[imagePaths.properties.legacyHero, imagePaths.properties.legacyHero, imagePaths.properties.legacyHero]}
        propertyName="Patricia Modern Terrace Homestay"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View all photos" }));
    expect(screen.getByRole("dialog", { name: "Patricia Modern Terrace Homestay photo gallery" })).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
