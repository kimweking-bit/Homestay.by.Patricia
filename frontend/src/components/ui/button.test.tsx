import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible link button", () => {
    render(<Button href="/example">Example</Button>);

    expect(screen.getByRole("link", { name: "Example" })).toHaveAttribute("href", "/example");
  });

  it("renders an accessible native button", () => {
    render(<Button type="button">Submit</Button>);

    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "button");
  });
});
