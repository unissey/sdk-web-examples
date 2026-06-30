# Unissey React SDK demo

React sample application for `@unissey-web/sdk-react@6.0.0`.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open <http://localhost:3000>.

## Pages

The demo navigation includes one view per capture flow:

- Video recorder — `VideoRecorder`
- Selfie capture — `SelfieCapture`
- Reference capture — `ReferenceCapture`
- Full capture — `FullCapture`
- IAD video recorder — IAD-enabled `VideoRecorder`

## Logging behavior

The demo does not upload captured media. Complete a capture, then check the browser console for logged SDK event payloads such as `recordCompleted`, `selfie`, `reference`, `data`, and `recorderReady`.

## IAD prepare view

The IAD view includes form fields for:

- IAD prepare URL
- API key / Authorization header value

Click **Prepare IAD session** to call the provided URL with `POST`. The response body is read as text and passed to the recorder as `iadConfig.data`.

This is the only HTTP call performed by the demo. Replace or adapt `performIadPrepare()` in `src/App.tsx` if your project needs a different backend wrapper, headers, or authentication method.

## Build and test

```bash
npm run build
npm test -- --watchAll=false
```

`react-scripts` may print source-map warnings for web component polyfills. These warnings do not prevent the demo from building.

## Camera note

Camera access requires a secure context. Browser development on `localhost` is supported; deployed demos should use HTTPS.
