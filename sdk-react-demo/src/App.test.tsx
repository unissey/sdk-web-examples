import { render, screen } from "@testing-library/react";
import { test } from "vitest";
import App from "./App";

test("renders capture demo navigation", () => {
  render(<App />);
  expect(
    screen.getByRole("button", { name: /^video recorder$/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /iad video recorder/i }),
  ).toBeInTheDocument();
});
