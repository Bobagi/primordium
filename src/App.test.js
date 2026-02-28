import { render, screen } from "@testing-library/react";
import App from "./App";
import "./i18n";

test("renders Primordium brand", () => {
  render(<App />);
  const brandElement = screen.getByText(/Primordium/i);
  expect(brandElement).toBeInTheDocument();
});
