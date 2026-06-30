# Unissey Web SDK v6.0.0 Integration Guide
> High-density integration reference for AI agents and human developers implementing Unissey's biometric capture tools.

This document describes how to integrate Unissey's Web SDK components into Web Applications using:
1. **Core Web Components** (`@unissey-web/web-components`)
2. **React Wrappers** (`@unissey-web/sdk-react`)
3. **Angular Wrappers** (`@unissey-web/sdk-angular`)

---

## 1. Installation & Environment Setup

All packages require **Version 6.0.0** for compatibility.

### Package Selection
```bash
# Core Web Components (Lit-based)
npm install @unissey-web/web-components@6.0.0

# React Wrappers (supports React 17+)
npm install @unissey-web/sdk-react@6.0.0

# Angular Wrappers (supports Angular 12+)
npm install @unissey-web/sdk-angular@6.0.0
```

### Essential Polyfills
The core library requires browser-level support for web components and async runtimes. 

#### For Web Components & React Projects:
```bash
npm install core-js regenerator-runtime @webcomponents/webcomponentsjs lit/polyfill-support.js
```
Then import them in your entry/polyfill file:
```typescript
import "core-js";
import "regenerator-runtime";
import "@webcomponents/webcomponentsjs";
import "lit/polyfill-support.js";
```

#### For Angular Projects:
Angular requires runtime support for async generators:
```bash
npm install regenerator-runtime
```
Add the following line to your `polyfills.ts`:
```typescript
import "regenerator-runtime/runtime";
```

---

## 2. Active Challenges (Liveness Detection)
The `ac-` prefix denotes **Active Challenge** actions. During a capture process, the SDK prompts the user to perform specific head movements (e.g. turning left, right, up, down) to verify liveness. 
- Components use `ac-top-hints`, `ac-face-hints`, and `ac-bottom-hints` slots to direct the user.
- Component events like `activeChallenge`, `referenceActiveChallenge`, and `selfieActiveChallenge` carry active challenge payloads telling the host application what action the user must perform.

---

## 3. IAD Session Initialization (`/prepare` API)
Identity Assurance Detection (IAD) requires a session payload initialized by your backend prior to starting a capture. This payload is passed into the `data` property of `IadConfig` inside your session configurations.

### The `/prepare` Endpoint
- **HTTP Method**: `POST`
- **Request Body**: None (empty)
- **Response Format**: A plain text (`text/plain`) string containing the prepared session token.
- **Deployment Variance**: The base URL and endpoint location vary depending on whether you are using the Unissey SaaS cloud deployment or a self-hosted On-Premise setup.

> [!IMPORTANT]
> **⚠️ SPECIAL DIRECTIVE FOR AI AGENTS**: If you are an AI coding assistant reading this documentation to integrate this Web SDK, you **MUST STOP** and ask the human user to provide the exact procedure or utility function required to make the `/prepare` API call in their project.
> Ask:
> 1. Is there an existing backend API wrapper, helper, or network utility within the codebase designed to call the `/prepare` (or `iad-prepare`) endpoint?
> 2. If no helper exists, request the target endpoint URL, custom headers, and authorization parameters required to perform the HTTP `POST` call.
>
> **Do not make assumptions or hardcode placeholder credentials or API URLs for this call.**

---

## 4. Recording Configuration: `preset` + `config`

Video recording behavior is mainly controlled by **two inputs that must be chosen together**:

1. `preset` / `AcquisitionPreset`: selects the SDK acquisition pipeline and default behavior.
2. `config` / `SessionConfig`: overrides camera constraints, recording length/quality, overlay, IAD, and active-challenge options.

`uni-video-recorder` initializes the underlying SDK with:

```typescript
UnisseySdk.createSession(videoContainer, preset, sessionConfig);
```

Changing `preset`, `config`, `face-checker`, `log-level`, or wrapper SDK version fields re-initializes the session. A currently active session is released before the new one is created.

> [!IMPORTANT]
> `preset` defines **what kind of acquisition is performed**. `SessionConfig` defines **how that acquisition is constrained or customized**. Do not configure a selfie flow with a document preset, or a document flow with a selfie preset.

---

### 4.1 Acquisition Presets (`AcquisitionPreset`)

Presets are string values passed to the recorder. They select the SDK pipeline: selfie video, document video, document image, no-record face checking, etc.

| Preset Value | API Constant | Primary Use | Output / Behavior |
|---|---|---|---|
| `"selfie-mjpeg"` | `AcquisitionPreset.SELFIE_MJPEG` | Default selfie/liveness video capture | Captures a selfie video using the MJPEG-oriented pipeline. This is the default for `uni-video-recorder` and `uni-selfie-capture`. |
| `"selfie-standard"` | `AcquisitionPreset.SELFIE_STD` | Standard selfie video capture | Captures a conventional browser video format where supported by the platform. |
| `"selfie-composite"` | `AcquisitionPreset.SELFIE_COMPOSITE` | Selfie capture with composite SDK behavior | Use only when the backend/product flow expects this selfie acquisition mode. |
| `"no-record"` | `AcquisitionPreset.NO_RECORD` | Face-position / presence checking without producing a final recording | Useful for pre-checks or UI validation flows. Do not expect a normal video file result. |
| `"doc-video"` | `AcquisitionPreset.DOC_VIDEO` | Physical document video capture | Uses document-oriented defaults, usually the back/environment camera. Default in `uni-reference-capture` video step. |
| `"doc-image"` | `AcquisitionPreset.DOC_IMAGE` | Physical document image capture | Captures a still/high-quality document image. Default in picture/document recorder flows. |

#### Default presets by component

| Component / Wrapper | Default preset |
|---|---|
| `uni-video-recorder` / `VideoRecorder` | `AcquisitionPreset.SELFIE_MJPEG` |
| `uni-selfie-capture` / `SelfieCapture` | `recorderOptions.preset ?? AcquisitionPreset.SELFIE_MJPEG` |
| `uni-reference-capture` / `ReferenceCapture` | Uses `AcquisitionPreset.DOC_VIDEO` for the document video recorder step |
| `uni-picture-recorder` / `PictureRecorder` | `AcquisitionPreset.DOC_IMAGE` |

#### Choosing the right preset

```typescript
// Selfie/liveness
preset: AcquisitionPreset.SELFIE_MJPEG

// Identity document as video
preset: AcquisitionPreset.DOC_VIDEO

// Identity document as still image
preset: AcquisitionPreset.DOC_IMAGE

// Face pre-check only, no final recording
preset: AcquisitionPreset.NO_RECORD
```

---

### 4.2 Session Configuration (`SessionConfig`)

`SessionConfig` is a partial object. You only set the fields you need; SDK/preset defaults supply the rest.

```typescript
type SessionConfig = {
  overlayConfig?: Partial<OverlayConfig>;
  cameraConfig?: Partial<CameraConfig>;
  recordingConfig?: Partial<RecordingConfig>;
  iadConfig?: IadConfig;
  versions?: Record<string, string>;
};
```

Common pattern:

```typescript
const config: SessionConfig = {
  cameraConfig: {
    cameraSelection: FacingMode.FRONT,
    preferredResolution: VideoResolutionPreset.STD_720P,
    preferredFps: 30,
    preferredOrientation: VideoOrientation.PORTRAIT,
  },
  recordingConfig: {
    audio: false,
    bitRateKbps: 2000,
    length: { type: "duration", durationMs: 1000 },
  },
  overlayConfig: {
    displayMode: OverlayDisplayMode.OVAL,
  },
};
```

#### Passing `SessionConfig` to components

Web Components:

```html
<uni-video-recorder preset="selfie-mjpeg"></uni-video-recorder>

<script type="module">
  import { AcquisitionPreset, FacingMode, VideoResolutionPreset } from "@unissey-web/web-components";

  const recorder = document.querySelector("uni-video-recorder");
  recorder.preset = AcquisitionPreset.SELFIE_MJPEG;
  recorder.config = {
    cameraConfig: {
      cameraSelection: FacingMode.FRONT,
      preferredResolution: VideoResolutionPreset.STD_720P,
      preferredFps: 30,
    },
    recordingConfig: {
      audio: false,
      bitRateKbps: 2000,
      length: { type: "duration", durationMs: 1000 },
    },
  };
</script>
```

React:

```tsx
<VideoRecorder
  preset={AcquisitionPreset.SELFIE_MJPEG}
  config={{
    cameraConfig: { cameraSelection: FacingMode.FRONT },
    recordingConfig: { audio: false, bitRateKbps: 2000, length: { type: "duration", durationMs: 1000 } },
  }}
/>
```

Angular:

```html
<uni-video-recorder
  [preset]="AcquisitionPreset.SELFIE_MJPEG"
  [config]="sessionConfig"
></uni-video-recorder>
```

> [!NOTE]
> Prefer property binding for `config` because it is an object. Avoid passing hand-written JSON strings unless the consuming framework explicitly converts them to objects.

---

### 4.3 Camera Settings (`cameraConfig`)

`cameraConfig` controls browser camera constraints. The SDK still depends on browser/device support, so requested values are preferences, not absolute guarantees.

| Field | Type | Meaning |
|---|---|---|
| `cameraSelection` | `FacingMode.FRONT`, `FacingMode.BACK`, or device id string | Selects front camera (`"user"`), back camera (`"environment"`), or an exact device id. |
| `preferredResolution` | `VideoResolutionPreset` | Requested capture resolution. |
| `preferredFps` | `number` | Requested frame rate. |
| `preferredOrientation` | `VideoOrientation` | Requested orientation, usually `PORTRAIT` for selfie and `LANDSCAPE` for wide documents. |

Available resolution constants include `STD_480P`, `STD_720P`, `STD_1080P`, `STD_VGA`, `STD_SVGA`, `STD_XVGA`, `SQUARE_600P`, and `NO_SPECIFIC_RESOLUTION`.

```typescript
const cameraConfig: Partial<CameraConfig> = {
  cameraSelection: FacingMode.BACK,
  preferredResolution: VideoResolutionPreset.STD_1080P,
  preferredFps: 30,
  preferredOrientation: VideoOrientation.LANDSCAPE,
};
```

#### Flip camera behavior

When the user flips the camera, `uni-video-recorder` computes the opposite of the preset default facing mode and writes it to `sessionConfig.cameraConfig.cameraSelection`. This can temporarily override your configured `cameraSelection` for the recreated session.

---

### 4.4 Recording Controls (`recordingConfig`)

`recordingConfig` controls media capture characteristics: audio, compression, duration, frame count, and face-checking behavior.

| Field | Type | Meaning |
|---|---|---|
| `audio` | `boolean` | Include audio in the recorded media. Set `false` for silent biometric/document videos unless your product requires sound. |
| `bitRateKbps` | `number` | Target video bitrate in kilobits per second. Prefer around `2000` kbps for biometric/liveness captures unless bandwidth constraints require less. Higher values improve quality but increase upload size. |
| `length` | `VideoLength` | Stop condition: duration in milliseconds or exact frame count. |
| `faceCheckerConfig` | `FaceCheckerConfig` | Low-level face-checking mode used by the underlying SDK. See interaction with component `face-checker` below. |

```typescript
const recordingConfig: Partial<RecordingConfig> = {
  audio: false,
  bitRateKbps: 2000,
  length: { type: "duration", durationMs: 1000 },
};
```

`length` guidance:

- Liveness algorithms need only a few usable frames; approximately 4 frames can be enough for checks, so a short capture such as `1000ms` can work well.
- Use longer recordings only when the video will be reviewed by human operators or when the product/backend flow explicitly requires more context.

```typescript
{ type: "duration", durationMs: 1000 }   // short liveness capture
{ type: "duration", durationMs: 4000 }   // longer capture for human review / product-specific requirements
{ type: "frame-count", frameCount: 4 }   // minimum algorithm-oriented frame-count example
```

#### Interaction with `face-checker`

The component-level `face-checker` attribute/property is important:

```typescript
type FaceChecker = "enabled" | "disabled" | "disabled-on-retry";
```

During session creation, `uni-video-recorder` sets `recordingConfig.faceCheckerConfig.check` from `face-checker`:

- `face-checker="disabled"` -> `{ check: "disabled" }`
- `face-checker="enabled"` -> `{ check: "beforeRecording" }`
- `face-checker="disabled-on-retry"` -> `{ check: "beforeRecording" }` initially, then disables face checking after a face-detection failure/retry

Therefore, do not rely only on `config.recordingConfig.faceCheckerConfig.check` when using `uni-video-recorder`; the component can override it. Use the `face-checker` property for the high-level behavior. `noFaceIssueDelayMs` can still be supplied in `config.recordingConfig.faceCheckerConfig` for before-recording checks.

---

### 4.5 Overlay & Mask Styling (`overlayConfig`)

`overlayConfig` changes the guide/mask drawn over the camera feed.

| Field | Type | Meaning |
|---|---|---|
| `displayMode` | `OverlayDisplayMode` | Shape/guide type: face oval, document rectangle, debug frame, etc. |
| `colors` | `OverlayColors` | RGBA color arrays for `background`, `innerBorder`, and `progressColor`. |
| `filter` | `string` | CSS filter applied around/over the video area, for example `"blur(4px)"`. |
| `disableCropping` | `boolean` | Prevents SDK-side crop behavior where supported. |

```typescript
const overlayConfig: Partial<OverlayConfig> = {
  displayMode: OverlayDisplayMode.OVAL,
  colors: {
    background: [0, 0, 0, 180],
    innerBorder: [5, 219, 145, 255],
    progressColor: [0, 223, 137, 255],
  },
  filter: "blur(4px)",
  disableCropping: false,
};
```

Recommended pairings:

| Use case | Preset | Overlay |
|---|---|---|
| Selfie/liveness | `SELFIE_MJPEG` or `SELFIE_STD` | `OverlayDisplayMode.OVAL` |
| ID card portrait | `DOC_IMAGE` or `DOC_VIDEO` | `OverlayDisplayMode.RECT_PORTRAIT` or `ID_DOCUMENT` |
| Passport / landscape document | `DOC_IMAGE` or `DOC_VIDEO` | `OverlayDisplayMode.RECT_LANDSCAPE` or `ID_DOCUMENT` |
| Debugging alignment | Any | `OverlayDisplayMode.DEBUG_FRAME` |

---

### 4.6 IAD and Active Challenge (`iadConfig`)

`iadConfig` connects the recording session to Identity Assurance Detection and active liveness challenges.

```typescript
const config: SessionConfig = {
  iadConfig: {
    data: preparedSessionToken,
    activeChallengeConfig: {
      maxSecondsBetweenActions: 8,
      additionalRecord: false,
      selfieBeforeAction: 1,
      customActions: [
        { durationSec: 2, position: 4, label: "smile", message: "Smile" },
      ],
    },
  },
};
```

- `data`: session payload/token returned by the backend `/prepare` or `iad-prepare` call. See section 3; do not invent this value.
- `activeChallengeConfig.maxSecondsBetweenActions`: time budget for each requested action.
- `additionalRecord`: whether to produce an additional active-challenge recording when supported by the backend flow.
- `selfieBeforeAction`: number/configuration of selfie frames before action sequence, where supported.
- `customActions`: extra challenge actions. The component appends each `message` to the active-challenge instruction list.

If `activeChallengeConfig` is present, `uni-video-recorder` listens to SDK active-challenge events and emits component `activeChallenge` events with details like `{ action: "left" }`, `{ status: "success" }`, or `{ status: "completed" }`.

---

### 4.7 Practical Recipes

#### Selfie liveness, short capture, front camera

```typescript
const preset = AcquisitionPreset.SELFIE_MJPEG;
const config: SessionConfig = {
  cameraConfig: {
    cameraSelection: FacingMode.FRONT,
    preferredResolution: VideoResolutionPreset.STD_720P,
    preferredOrientation: VideoOrientation.PORTRAIT,
    preferredFps: 30,
  },
  recordingConfig: {
    audio: false,
    bitRateKbps: 2000,
    length: { type: "duration", durationMs: 1000 },
  },
  overlayConfig: {
    displayMode: OverlayDisplayMode.OVAL,
  },
};
```

#### Document video, back camera, landscape overlay

```typescript
const preset = AcquisitionPreset.DOC_VIDEO;
const config: SessionConfig = {
  cameraConfig: {
    cameraSelection: FacingMode.BACK,
    preferredResolution: VideoResolutionPreset.STD_1080P,
    preferredOrientation: VideoOrientation.LANDSCAPE,
  },
  recordingConfig: {
    audio: false,
    bitRateKbps: 2000,
    length: { type: "duration", durationMs: 1000 },
  },
  overlayConfig: {
    displayMode: OverlayDisplayMode.RECT_LANDSCAPE,
  },
};
```

#### Active challenge selfie with prepared IAD data

```typescript
const preset = AcquisitionPreset.SELFIE_MJPEG;
const config: SessionConfig = {
  iadConfig: {
    data: preparedSessionToken,
    activeChallengeConfig: {
      maxSecondsBetweenActions: 8,
      additionalRecord: false,
    },
  },
};
```

---

## 5. Theming & Styling Customization

All components support extensive customization using CSS Custom Properties (CSS variables). These properties can be set at the root level (`:root`), at a wrapper container, or directly inline on the custom element styles.

### Core Color Palette Variables
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-primary-color` | `#0a175c` | Primary color used on buttons and overlays |
| `--uni-secondary-color` | `#05db91` | Secondary success color for active challenge completeness |
| `--uni-primary-color-lighter` | `#222f6c` | Lighter primary accent color |
| `--uni-secondary-color-lighter` | `#00df89` | Lighter secondary accent color |
| `--uni-alt-color` | `#1943ba` | Alternate primary brand color |
| `--uni-alt-color-lighter` | `#3b54f0` | Alternate primary brand hover/active color |
| `--uni-light-color-variant-1` | `#e8edfe` | Soft light background variant 1 |
| `--uni-light-color-variant-2` | `#d8e1fd` | Soft light background variant 2 |
| `--uni-light-color` | `#fff` | Background default for text or containers |
| `--uni-dark-color` | `#202020` | Default text and dark elements color |
| `--uni-error-color` | `#f44336` | Accent color for errors and alerts |

### Video Recorder Component Variables (`uni-video-recorder`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-recorder-border-radius` | `10px` | Border radius of the video container |
| `--uni-recorder-buttons-margin` | `30px 0` | Margin spacing for controls |
| `--uni-recorder-box-shadow` | `0 4px 4px rgba(0, 0, 0, 0.12)` | Shadow depth applied on the frame |
| `--uni-recorder-hints-font-size` | `16px` | Font size for active directions and hints |
| `--uni-recorder-hints-color` | `#202020` | Font color for face position guidelines |
| `--uni-recorder-instructions-font-size` | `16px` | Main instruction text size |
| `--uni-recorder-instructions-color` | `#202020` | Instruction font color |
| `--uni-recorder-instructions-timer-font-size` | `24px` | Text size for countdown timer |
| `--uni-recorder-instructions-timer-color` | `#333333` | Font color for countdown timer |
| `--uni-recorder-instructions-timer-font-weight` | `bold` | Timer font weight |
| `--uni-recorder-instructions-timer-position-top` | `90%` | Timer absolute vertical position |
| `--uni-recorder-instructions-timer-position-left` | `3%` | Timer absolute horizontal position |
| `--uni-recorder-instructions-position-top` | `-10%` | Vertical offset of instructions |
| `--uni-recorder-instructions-padding` | `0px` | Frame padding constraints |
| `--uni-recorder-video-filter` | `none` | Filter effect applied to the raw video |
| `--uni-recorder-video-width` | `300px` | Feed container width |

### Selfie Capture Wrapper Variables (`uni-selfie-capture`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-selfie-capture-video-recorder-width` | `400px` | Recorder child width in desktop browsers |
| `--uni-selfie-capture-video-recorder-sm-width` | `95%` | Recorder child width on mobile screens |
| `--uni-selfie-capture-title-font` | `24px normal` | Header title font styling |
| `--uni-selfie-capture-title-line-height` | `18px` | Header title line height |
| `--uni-selfie-capture-title-color` | `#8e8e8e` | Header title color |
| `--uni-selfie-capture-sub-title-font` | `16px normal` | Subtitle font styling |
| `--uni-selfie-capture-sub-title-line-height` | `18px` | Subtitle line height |
| `--uni-selfie-capture-sub-title-color` | `#8e8e8e` | Subtitle color |

### Reference Capture Wrapper Variables (`uni-reference-capture`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-reference-capture-video-recorder-width` | `400px` | Video recorder width on desktop views |
| `--uni-reference-capture-video-recorder-sm-width` | `95%` | Video recorder width on small screens |
| `--uni-reference-capture-title-font` | `24px normal` | Stage header title font |
| `--uni-reference-capture-title-line-height` | `18px` | Title line height |
| `--uni-reference-capture-title-color` | `#8e8e8e` | Title text color |
| `--uni-reference-capture-sub-title-font` | `16px normal` | Stage header subtitle font |
| `--uni-reference-capture-sub-title-line-height` | `18px` | Subtitle line height |
| `--uni-reference-capture-sub-title-color` | `#8e8e8e` | Subtitle color |

### Action Button Variables (`uni-button`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-btn-padding` | `8px 15px` | Component inner padding |
| `--uni-btn-border` | `solid 1px` | Border style attributes |
| `--uni-btn-border-radius` | `7px` | Corner rounding factor |
| `--uni-btn-font-size` | `14px` | Action label font size |
| `--uni-btn-focus-outline` | `3px solid #3b54f0` | Focus shadow ring indicator |
| `--uni-btn-text-transform` | `normal` | Case transformations |
| `--uni-btn-border-outlined` | `solid 1px` | Border styling inside outlined variant |
| `--uni-btn-label-margin` | `10px 0px` | Text margins relative to adjacent icons |
| `--uni-btn-disabled-bg-color` | `#eee` | Background color when interactive state is blocked |
| `--uni-btn-sm-width` | `250px` | Button width override for smaller views |

### Onboarding & Card Variables (`uni-direction-card`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-card-padding` | `8px 4%` | Card padding metrics |
| `--uni-card-margin` | `0px` | Margin layouts |
| `--uni-card-width` | `92%` | Core width allocation |
| `--uni-card-border-radius` | `20px` | Card corner rounding |
| `--uni-card-font-size` | `16px` | Card text sizing |
| `--uni-card-font-weight` | `normal` | Weight properties |
| `--uni-card-text-margin-left` | `25px` | Margins offsetting text from illustration |
| `--uni-card-icon-height` | `55px` | Illustration vector heights |
| `--uni-card-icon-width` | `auto` | Illustration vector widths |
| `--uni-card-bg-color` | `#f2f5f8` | Base background fill |

### File Upload Card Variables (`uni-file-upload`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-file-upload-padding` | `9.5%` | Droppable area padding bounds |
| `--uni-file-upload-width` | `80%` | Droppable container width |
| `--uni-file-upload-height` | `80%` | Droppable container height |
| `--uni-file-upload-border` | `dashed 2px #eee` | Droppable perimeter border configuration |
| `--uni-file-upload-focus-outline` | `2px solid #3b54f0` | Drop focus perimeter border |
| `--uni-file-upload-bg-color` | `#fafafa` | Background color for drop containers |
| `--uni-file-upload-txt-color` | `#ccc` | Informational label text color |
| `--uni-file-upload-txt-font-size` | `20px` | Drag and drop message sizing |
| `--uni-file-upload-err-txt-color` | `#333` | Upload error message text color |
| `--uni-file-upload-err-txt-font-size` | `16px` | Upload error message size |

### Retry Review Component Variables (`uni-retry-result`)
| CSS Variable | Default Value | Description |
|---|---|---|
| `--uni-retry-result-retries-color` | `grey` | Text color for counting attempts |
| `--uni-retry-result-font-size-md` | `22px` | Primary validation prompt font sizing |
| `--uni-retry-result-line-height-md` | `24px` | Primary validation prompt line height |
| `--uni-retry-result-font-size-sm` | `16px` | Secondary descriptive text font sizing |
| `--uni-retry-result-line-height-sm` | `18px` | Secondary descriptive text line height |
| `--uni-retry-result-icon-width` | `150px` | Illustration asset size |

---

## 6. Accessibility & WCAG Compliance

Unissey's Web SDK is designed to be **WCAG 2.1 and WCAG 2.2 Level AA compliant**. It supports accessible keyboard controls, high-contrast configurations, screen reader announcements, and automatic notification pacing.

### 6.1 Screen Reader Integration & ARIA Live Regions
The video recorder component uses two `aria-live="assertive"` regions to communicate important runtime updates without breaking focus:
1. **Error Region (`#sdk-error`)**: Instantly reports camera connection failures, device rotation blocks, or face detection dropouts.
2. **Hint Region (`#pos-hint`)**: Broadcasts real-time instructions to position the user's face (e.g. "Move closer", "Turn head to the left"). 
Both regions use `assertive` announcements because user-positioning feedback is time-critical during biometric recording sessions.

### 6.2 Smart Notification Throttling (`read-rate`)
Biometric systems generate face-position check events at high frequencies (up to 60 times a second). Flooding live regions with every frame change would override speech feedback, rendering instructions incomprehensible. 

To solve this, the library features an integrated `NotificationThrottler`:
- Only a single alert is read at a time. Intermediate status notifications are updated in a single-slot queue, ensuring screen readers only hear the most current correction.
- The silence interval between instructions is dynamically calculated using the message length:
  `Delay = readRate (ms) * message.length`
- **Read Rate Override**: You can adjust this timing by writing a `read-rate` attribute (default `100` ms per character).
  ```html
  <!-- Speed up announcements for experienced screen reader users -->
  <uni-video-recorder read-rate="60"></uni-video-recorder>
  ```
- **Announcement Listening**: Catch announcements programmatically in host pages:
  ```javascript
  recorder.addEventListener("onNotification", (e) => {
    const { message, type } = e.detail; // type: "info" | "error"
    console.log(`Announcement: ${message}`);
  });
  ```

### 6.3 Keyboard Operability & Focus Guidelines
- All controls (`<button>` tags and SVG icon indicators) support standard tab indexing and activation using `Enter` or `Space`.
- **Focus Rings**: To support keyboard users, you must maintain visual focus borders. The SDK maps visual outlines using `--uni-btn-focus-outline` (defaulting to a high-contrast `3px solid #3b54f0`). Never override this variable to `none`.
- **Timing & Timeouts**: Active challenges require completion within a set timeframe (`maxSecondsBetweenActions`, default 8 seconds). This is essential for preventing biometric bypass attacks and is exempt from WCAG timing adjustment constraints under the security clause.

---

## 7. API Types Reference

### Core Types & Configuration Interfaces

```typescript
export interface SessionConfig {
  overlayConfig?: Partial<OverlayConfig>;
  cameraConfig?: Partial<CameraConfig>;
  recordingConfig?: Partial<RecordingConfig>;
  iadConfig?: IadConfig;
  versions?: {
    [name: string]: string;
  };
}

export type IadConfig = {
  data?: string; // Payload from 'iad-prepare' endpoint. Required except for 'active' and 'passive-lt' modes.
  activeChallengeConfig?: ActiveChallengeConfig; // Configuration required for 'active' and 'active-fallback' modes.
};

export type ActiveChallengeConfig = {
  maxSecondsBetweenActions: number; // Max duration (seconds) between action requests.
  additionalRecord?: boolean;
  selfieBeforeAction?: number;
  customActions?: CustomAction[];
};

export type CustomAction = {
  durationSec: number;
  position: number;
  label: string;
  message: string;
};

export type VideoLength =
  | { type: "duration"; durationMs: number; }
  | { type: "frame-count"; frameCount: number; };

export type FaceCheckerConfig =
  | { check: "disabled"; }
  | {
      check: "beforeRecording" | "whileRecording";
      customFaceArea?: FaceRect;
      noFaceIssueDelayMs?: number;
    };

export interface RecordingConfig {
  audio: boolean;
  bitRateKbps: number;
  length: VideoLength;
  faceCheckerConfig: FaceCheckerConfig;
}

export type ColorRGBA = [number, number, number, number]; // [r, g, b, a]
export type OverlayColors = Record<"background" | "innerBorder" | "progressColor", ColorRGBA>;

export type OverlayConfig = {
  displayMode: OverlayDisplayMode;
  colors: OverlayColors;
  filter: string;
  disableCropping: boolean;
};

export interface CameraConfig {
  preferredFps: number;
  preferredResolution: VideoResolutionPreset;
  preferredOrientation: VideoOrientation;
  cameraSelection: FacingMode | string;
}

export interface FaceRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
```

### Enumerated Constants

```typescript
export enum AcquisitionPreset {
  SELFIE_MJPEG = "selfie-mjpeg",
  SELFIE_STD = "selfie-standard",
  SELFIE_COMPOSITE = "selfie-composite",
  NO_RECORD = "no-record",
  DOC_VIDEO = "doc-video",
  DOC_IMAGE = "doc-image",
}

export enum OverlayDisplayMode {
  OVAL = "oval",
  RECT_PORTRAIT = "rect-portrait",
  RECT_LANDSCAPE = "rect-landscape",
  DEBUG_FRAME = "debug-frame",
  ID_DOCUMENT = "id-document",
}

export enum VideoResolutionPreset {
  NO_SPECIFIC_RESOLUTION = "no-specific-resolution",
  STD_480P = "720x480",
  STD_720P = "1280x720",
  STD_1080P = "1920x1080",
  STD_VGA = "640x480",
  STD_SVGA = "800x600",
  STD_XVGA = "1024x768",
  SQUARE_600P = "600x600",
}

export enum VideoOrientation {
  LANDSCAPE = "landscape",
  PORTRAIT = "portrait",
}

export enum FacingMode {
  FRONT = "user",
  BACK = "environment",
}

export enum LogLevel {
  QUIET = 0,
  WARNING = 1,
  INFO = 2,
  VERBOSE = 3,
  PERFORMANCE = 4,
}

export type FaceChecker = "enabled" | "disabled" | "disabled-on-retry";
```

---

## 8. Video Recorder Component

### Description
The core headless-powered camera recorder for biometric and document recording. Renders the camera feed, guides the user with overlay boundaries, validates the face presence/position, and processes active head challenges.

### API Contract

#### Tag Name
`uni-video-recorder`

#### Attributes / Properties
| Attribute / Property Name | Types | Default Value | Description |
|---|---|---|---|
| `preset` | `AcquisitionPreset` | `"selfie-mjpeg"` | Target preset configuration. |
| `config` | `SessionConfig` \| `string` | `{}` | The primary acquisition configurations. Stringified in HTML templates. |
| `face-checker` / `faceChecker` | `FaceChecker` | `"disabled-on-retry"` | How to handle face presence checks. |
| `display-flip-camera-btn` / `displayFlipCameraBtn` | `boolean` | `false` | Shows a toggle button to switch front/back cameras. |
| `hide-capture-btn` / `hideCaptureBtn` | `boolean` | `false` | Hides the capture/recording action button. |
| `disable-debug-mode` / `disableDebugMode` | `boolean` | `false` | Set to `true` to disable logging and internal SDK debugger. |
| `log-level` / `logLevel` | `LogLevel` | `LogLevel.QUIET` | Logger configuration verbosity. |
| `strings` | `Partial<I18n["videoRecorder"]>` \| `string` | English Default | Translation override values. |
| `read-rate` / `readRate` | `number` | `100` | Estimated character read duration (ms) for voice synthesis spacing. |

#### Custom Events
| Event Name | Event Detail Type | Description |
|---|---|---|
| `record` | `{ media: Blob; metadata: unknown; error?: string }` | Dispatched upon recording finish (Legacy). |
| `recordCompleted` | `{ media: Blob; metadata: unknown; error?: string }` | Recommended event carrying final video stream and capture metadata. |
| `recorderReady` | `{ mediaType: string; acquisitionTime: number; activeChallengeNumActions?: number }` | Fired when camera access is granted and configuration is active. |
| `recordStarting` | `void` | Camera capture prepares. |
| `recordCapturing` | `void` | Media recording begins actively. |
| `recordInterrupted` | `void` | Fired when acquisition is aborted. |
| `activeChallenge` | `{ action?: string; status?: string }` | Triggers when the active head challenge prompt updates (e.g. telling the user to look left/right). |
| `issue` | `string` | Triggered when a face constraint violation occurs (e.g., face moves out of oval). |
| `onNotification` | `{ type: "info" \| "error"; message: string }` | Relays throttled accessibility announcements or errors. |

#### Component Slots
- `left`: Layout slot adjacent to the capture button (typically used for a "Back" button).
- `ac-top-hints`: Renders active challenge instructions above the video frame.
- `ac-face-hints`: Renders active challenge prompts overlaying the target face oval.
- `ac-bottom-hints`: Overrides active challenge instructions displayed below the video frame.

---

### Implementation Code Examples

#### Web Component Integration
```html
<script type="module">
  import "@unissey-web/web-components/dist/video-recorder.js";
</script>

<style>
  /* Custom Theming Example */
  uni-video-recorder {
    --uni-primary-color: #ff5722;
    --uni-recorder-border-radius: 20px;
    --uni-recorder-video-width: 320px;
  }
</style>

<uni-video-recorder
  id="recorder"
  preset="selfie-standard"
  face-checker="enabled"
  display-flip-camera-btn
></uni-video-recorder>

<script>
  const recorder = document.getElementById("recorder");
  
  // Custom Configuration
  recorder.config = {
    cameraConfig: { preferredResolution: "1280x720" }
  };
  
  recorder.addEventListener("recordCompleted", (e) => {
    const { media, metadata, error } = e.detail;
    if (error) console.error("Capture Failed:", error);
    else console.log("Recorded Video Blob:", media);
  });
</script>
```

#### React Integration
```tsx
import React, { useRef } from "react";
import { VideoRecorder } from "@unissey-web/sdk-react";
import { AcquisitionPreset, FacingMode } from "@unissey-web/web-components";

export const VideoRecorderView = () => {
  const ref = useRef(null);

  const handleCompleted = (e: any) => {
    const { media, metadata } = e.detail;
    console.log("React Capture Completed: ", media);
  };

  return (
    <div style={{ "--uni-primary-color": "#4caf50" } as React.CSSProperties}>
      <VideoRecorder
        ref={ref}
        preset={AcquisitionPreset.SELFIE_STD}
        displayFlipCameraBtn={true}
        config={{
          cameraConfig: { cameraSelection: FacingMode.FRONT }
        }}
        onRecordCompleted={handleCompleted}
      />
    </div>
  );
};
```

#### Angular Integration
Import module in `app.module.ts`:
```typescript
import { UnisseySdkModule } from "@unissey-web/sdk-angular";

@NgModule({
  imports: [BrowserModule, UnisseySdkModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```
Use in your component template with dynamic theming:
```html
<div [style.--uni-primary-color]="'#2196f3'">
  <unissey-video-recorder
    [preset]="preset"
    [config]="config"
    [displayFlipCameraBtn]="true"
    (recordCompleted)="onCompleted($event)"
    (recorderReady)="onReady($event)"
  ></unissey-video-recorder>
</div>
```

---

## 9. Selfie Capture Component

### Description
Wrapper component implementing a step-by-step onboarding flow. First displays liveness instructions, then launches the video recorder when the user clicks the action button.

### API Contract

#### Tag Name
`uni-selfie-capture`

#### Attributes / Properties
| Attribute / Property Name | Types | Default Value | Description |
|---|---|---|---|
| `recorder-options` / `recorderOptions` | `RecorderOptions` \| `string` | `{}` | Configs mapped directly to the child `uni-video-recorder`. |
| `strings` | `Partial<I18n["selfieCapture"]>` \| `string` | Default translations | Custom copy for instructions page. |
| `hide-capture-prev-btn` / `hideCapturePrevBtn` | `boolean` | `false` | Hides the back button inside the recorder view. |
| `hide-capture-btn` / `hideCaptureBtn` | `boolean` | `false` | Hides the recording action button. |
| `disable-debug-mode` / `disableDebugMode` | `boolean` | `false` | Bypasses debugger scripts. |

`RecorderOptions` Interface:
```typescript
export interface RecorderOptions {
  preset?: AcquisitionPreset;
  logLevel?: LogLevel;
  config?: Partial<SessionConfig>;
  faceChecker?: FaceChecker;
}
```

#### Custom Events
| Event Name | Event Detail Type | Description |
|---|---|---|
| `selfie` | `{ media: Blob; metadata: unknown }` | Stream wrapper carrying captured liveness video. |
| `recordCompleted` | `{ media: Blob; metadata: unknown; error?: string }` | Relayed raw video event from the recorder. |
| `recorderReady` | `{ recorderElmt: HTMLElement; mediaType: string; contentKind: "selfie"; acquisitionTime: number; activeChallengeNumActions?: number }` | Component initialization completed. |
| `recordStarting` | `void` | Capture lifecycle begins. |
| `recordCapturing` | `void` | Camera recording actively writing. |
| `recordInterrupted` | `void` | Interruption event. |
| `activeChallenge` | `{ action?: string; status?: string }` | Relay of active head movements (Active Challenge) instruction updates. |

#### Component Slots
- `directions`: Replaces the instructions component overlay entirely.
- `action-button`: Appends a sibling button next to the "Record" onboarding button.
- `ac-top-hints`: Relayed.
- `ac-face-hints`: Relayed.
- `ac-bottom-hints`: Relayed.

---

### Implementation Code Examples

#### Web Component Integration
```html
<script type="module">
  import "@unissey-web/web-components/dist/selfie-capture.js";
</script>

<uni-selfie-capture id="selfie-flow" style="--uni-selfie-capture-video-recorder-width: 450px;"></uni-selfie-capture>

<script>
  const flow = document.getElementById("selfie-flow");
  flow.recorderOptions = {
    preset: "selfie-standard",
    faceChecker: "disabled-on-retry"
  };
  flow.addEventListener("selfie", (e) => {
    console.log("Selfie capture completed:", e.detail.media);
  });
</script>
```

#### React Integration
```tsx
import React from "react";
import { SelfieCapture } from "@unissey-web/sdk-react";

export const SelfieFlow = () => {
  return (
    <SelfieCapture
      recorderOptions={{
        preset: "selfie-standard"
      }}
      onSelfie={(e: any) => {
        console.log("Selfie media payload:", e.detail.media);
      }}
    />
  );
};
```

#### Angular Integration
```html
<unissey-selfie-capture
  [recorderOptions]="options"
  (selfie)="onSelfieCaptured($event)"
  (recorderReady)="onReady($event)"
></unissey-selfie-capture>
```

---

## 10. Reference Capture Component

### Description
Facilitates reference capture (identity photo checking). Supports picking files locally (drag & drop/upload file selectors), snapshot capture via a photo camera, or video streams. Includes an integrated review step (picture editor / video playback).

### API Contract

#### Tag Name
`uni-reference-capture`

#### Attributes / Properties
| Attribute / Property Name | Types | Default Value | Description |
|---|---|---|---|
| `recorder-options` / `recorderOptions` | `{ logLevel?: LogLevel }` \| `string` | `{}` | Options passed to the child recorders. |
| `strings` | `Partial<I18n["referenceCapture"]>` \| `string` | Default translations | Override keys. |
| `hide-capture-btn` / `hideCaptureBtn` | `boolean` | `false` | Restricts capture buttons. |
| `disable-debug-mode` / `disableDebugMode` | `boolean` | `false` | Disables internal logging. |

#### Custom Events
| Event Name | Event Detail Type | Description |
|---|---|---|
| `reference` | `{ media: Blob }` | Fired when document/face image or video is approved in the review step. |
| `recordCompleted` | `{ media: Blob; metadata: unknown; error?: string }` | Raw capture step finished. |
| `recorderReady` | `{ recorderElmt: HTMLElement; mediaType: string; contentKind: "reference"; acquisitionTime: number; activeChallengeNumActions?: number }` | Child camera component initialization complete. |
| `recordStarting` | `void` | Camera starting. |
| `recordCapturing` | `void` | Capturing. |
| `recordInterrupted` | `void` | Aborted. |
| `activeChallenge` | `{ action?: string; status?: string }` | Active head challenge instructions relay event. |

#### Component Slots
- `directions`: Custom instruction view overrides.
- `action-button`: Appends inline custom control elements.
- `ac-top-hints`: Relayed.
- `ac-face-hints`: Relayed.
- `ac-bottom-hints`: Relayed.

---

### Implementation Code Examples

#### Web Component Integration
```html
<script type="module">
  import "@unissey-web/web-components/dist/reference-capture.js";
</script>

<uni-reference-capture id="ref-flow" style="--uni-file-upload-bg-color: #eeeeee;"></uni-reference-capture>

<script>
  const flow = document.getElementById("ref-flow");
  flow.addEventListener("reference", (e) => {
    console.log("Approved Reference Photo/Video:", e.detail.media);
  });
</script>
```

#### React Integration
```tsx
import React from "react";
import { ReferenceCapture } from "@unissey-web/sdk-react";

export const ReferenceFlow = () => {
  return (
    <ReferenceCapture
      onReference={(e: any) => {
        console.log("Reference image blob:", e.detail.media);
      }}
    />
  );
};
```

#### Angular Integration
```html
<unissey-reference-capture
  (reference)="onRefCaptured($event)"
  (recorderReady)="onReady($event)"
></unissey-reference-capture>
```

---

## 11. Full Capture Component

### Description
Orchestrates the entire capture workflow:
1. First displays the **Reference Capture** step (`uni-reference-capture`).
2. Upon reference validation, it automatically transitions to the **Selfie Capture** onboarding and liveness video capture step (`uni-selfie-capture`).
3. Yields the joint results containing both assets and metadata.

### API Contract

#### Tag Name
`uni-full-capture`

#### Attributes / Properties
| Attribute / Property Name | Types | Default Value | Description |
|---|---|---|---|
| `recorder-options` / `recorderOptions` | `RecorderOptions` \| `string` | `{}` | Config mapping for both internal capture steps. |
| `strings` | `Partial<I18n>` \| `string` | Default translations | Nested structure overrides for both `selfie` and `reference`. |
| `hide-reference-capture-btn` / `hideReferenceCaptureBtn` | `boolean` | `false` | Control flag for reference step button displays. |
| `hide-selfie-capture-btn` / `hideSelfieCaptureBtn` | `boolean` | `false` | Control flag for selfie step button displays. |
| `disable-debug-mode` / `disableDebugMode` | `boolean` | `false` | Bypasses debugger libraries. |

#### Custom Events
| Event Name | Event Detail Type | Description |
|---|---|---|
| `data` | `{ selfie: Blob; reference: Blob; metadata: unknown; error?: string }` | Fired when the whole flow completes. |
| `recorderReady` | `{ recorderElmt: HTMLElement; mediaType: string; contentKind: string; acquisitionTime?: number; activeChallengeNumActions?: number }` | Ready check event relay. |
| `referenceActiveChallenge` | `{ action?: string; status?: string }` | Triggers active challenges during the reference capture step. |
| `selfieActiveChallenge` | `{ action?: string; status?: string }` | Triggers active challenges during the selfie capture step. |

#### Component Slots
- `reference-directions`: Custom directions for reference capture step.
- `reference-action-button`: Custom button inserted in the reference onboarding view.
- `selfie-directions`: Custom directions for selfie capture step.
- `ac-top-hints`: Relayed.
- `ac-face-hints`: Relayed.
- `ac-bottom-hints`: Relayed.

---

### Implementation Code Examples

#### Web Component Integration
```html
<script type="module">
  import "@unissey-web/web-components/dist/full-capture.js";
</script>

<uni-full-capture id="full-flow"></uni-full-capture>

<script>
  const flow = document.getElementById("full-flow");
  flow.addEventListener("data", (e) => {
    const { selfie, reference, metadata, error } = e.detail;
    if (error) console.error("Acquisition error:", error);
    else {
      console.log("Selfie Blob:", selfie);
      console.log("Reference Blob:", reference);
      console.log("Acquisition Metadata:", metadata);
    }
  });
</script>
```

#### React Integration
```tsx
import React from "react";
import { FullCapture } from "@unissey-web/sdk-react";

export const FullCaptureFlow = () => {
  const handleData = (e: any) => {
    const { selfie, reference, metadata } = e.detail;
    console.log("Completed Full Workflow. Data:", selfie, reference);
  };

  return (
    <FullCapture
      recorderOptions={{
        preset: "selfie-standard"
      }}
      onData={handleData}
    />
  );
};
```

#### Angular Integration
```html
<unissey-full-capture
  [recorderOptions]="options"
  (data)="onWorkflowCompleted($event)"
  (recorderReady)="onReady($event)"
></unissey-full-capture>
```

---

## 12. Internationalization (I18n) Configuration

To customize screen text or translate interfaces, pass an object mimicking the structure of default translations into the `strings` properties.

### English Translation Schema Reference (I18n Structure)
```typescript
const imageCaptureDirections = {
  document: "Take a picture of your ID document",
  face: "Position your document so that your face is clearly visible",
  light: "Make sure that there is no light reflection on the document",
};

const videoRecordDirections = {
  position: "Look straight at the camera, and keep your face clearly visible",
  face: "Have a plain expression",
  light: "Stand in a well-lit environment",
  camera: "Make sure your camera is not open on another tab or application",
};

const pictureEditor = { validate: "Yes, continue" };

const fileUpload = {
  badType: "The type of the selected file must be one of",
  maxSize: "The size of the selected file exceeds the maximum size authorized",
  text: "Drag 'n' drop your reference picture here or click here to select a file (.png, .jpg)",
};

const videoRecorder = {
  capture: "Record a video",
  retry: "Retry",
  errors: {
    noFace: "We couldn't detect a face, please try again.",
    activeChallenge: "You didn't perform the requested action correctly.",
    sdkError: "There has been an error while processing",
    unsupportedFaceDetector: "The face detector is not supported on the current device, please try again.",
  },
  hints: {
    up: "Move your face up",
    down: "Move your face down",
    perfect: "Perfect, don't move",
    right: "Move your face to the right",
    left: "Move your face to the left",
    closer: "Get closer",
    record: "",
    nil: "",
  },
  forbiddenActionMessages: {
    visibility: "Please stay on this tab during the acquisition process.",
    focus: "Please stay on this tab during the acquisition process.",
    keyboard: "Please do not press any key during the acquisition process.",
    default: "There was an error with the video capture, please try again.",
  },
  cameraErrorMessages: {
    permissionDenied: "Cannot open camera. Please grant permission for this application.",
    openFailed: "Cannot open camera. Please close any application that currently uses the camera.",
    default: "Cannot open camera.",
  },
  rotationWhileCapturingErrorMessage: "Please don't rotate the device during acquisition.",
  activeChallengeMessages: {
    rotateLeft: 'Turn head to the <strong style="font-size: 18px">left</strong>',
    rotateRight: 'Turn head to the <strong style="font-size: 18px">right</strong>',
    rotateUp: 'Turn head <strong style="font-size: 18px">up</strong>',
    rotateDown: 'Turn head <strong style="font-size: 18px">down</strong>',
  },
  accessibility: {
    flipCamera: "Switch camera",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    turnUp: "Turn up",
    turnDown: "Turn down",
    videoFeed: "Camera feed for identity verification",
  },
};

const pictureRecorder = { capture: "Take a picture" };

export const EN = {
  videoRecorder,
  pictureRecorder,
  imageCaptureDirections,
  videoRecordDirections,
  pictureEditor,
  fileUpload,
  retryResult: {
    default: "Your selfie video was not clear enough to confirm liveness",
    retryMessage: "Please, try again!",
    retriesLeft: { _1: "You have", _2: "retries left", _3: "retry left" },
    retryBtn: "Retry",
    finishBtn: "Finish",
    covideMask: "Covid mask detected",
    brightness: "Difficult lighting conditions detected",
  },
  selfieCapture: {
    back: "Back",
    directionSubtitle: "Let's make sure no one's impersonating you",
    recordBtnLabel: "Record a video",
    title: "Record a short video selfie",
    recordSubtitle: "",
    acquisitionDuration: { base: "The acquisition will last ", singular: " second.", plural: " seconds." },
    directions: videoRecordDirections,
    recorder: videoRecorder,
  },
  referenceCapture: {
    back: "Back",
    title: "Take a reference picture for face comparison",
    captureTitle: "Position your ID document in the rectangle",
    editorTitle: "Is your face straight and clearly visible?",
    directionSubtitle: "Let's start the facial authentication process",
    pictureRecordSubtitle: "Take a photo of your ID card, passport, residence permit...",
    videoRecordSubtitle: "Take a video of your ID card, passport, residence permit...",
    uploadBtn: "Upload a picture",
    pictureBtn: "Take a picture",
    recordVidBtn: "Record a video",
    retryPictureCaptureBtn: "No, retake the picture",
    retryVideoCaptureBtn: "No, record another video",
    replayValidation: "Yes, Continue",
    editor: pictureEditor,
    directions: imageCaptureDirections,
    videoRecorder,
    pictureRecorder,
    fileUpload,
  },
};
```
