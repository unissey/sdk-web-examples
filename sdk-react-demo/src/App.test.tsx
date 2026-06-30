import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "@unissey-web/sdk-react",
  () => ({
    AcquisitionPreset: { SELFIE_MJPEG: "selfie-mjpeg" },
    VideoRecorder: () => <div data-testid="video-recorder" />,
    SelfieCapture: () => <div data-testid="selfie-capture" />,
    ReferenceCapture: () => <div data-testid="reference-capture" />,
    FullCapture: () => <div data-testid="full-capture" />,
  }),
  { virtual: true },
);

test("renders capture demo navigation", () => {
  render(<App />);
  expect(
    screen.getByRole("button", { name: /^video recorder$/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /iad video recorder/i }),
  ).toBeInTheDocument();
});
