import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("associates the input with its visible label", () => {
    render(<Input label="Location" placeholder="Kuala Lumpur" />);

    expect(screen.getByLabelText("Location")).toHaveAttribute("placeholder", "Kuala Lumpur");
  });
});
