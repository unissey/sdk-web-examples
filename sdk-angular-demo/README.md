# Unissey Angular SDK demo

Angular sample application for `@unissey-web/sdk-angular@6.0.0`.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open <http://localhost:4200>.

## Pages

The demo has one page per capture flow:

- `/video-recorder` — `unissey-video-recorder`
- `/selfie` — `unissey-selfie-capture`
- `/reference` — `unissey-reference-capture`
- `/full-capture` — `unissey-full-capture`
- `/iad-video-recorder` — IAD-enabled `unissey-video-recorder`

## Logging behavior

The demo does not upload captured media. Complete a capture, then check the browser console for logged SDK event payloads such as `recordCompleted`, `selfie`, `reference`, `data`, and `recorderReady`.

## IAD prepare page

The IAD page includes form fields for:

- IAD prepare URL
- API key / Authorization header value

Click **Prepare IAD session** to call the provided URL with `POST`. The response body is read as text and passed to the recorder as `iadConfig.data`.

This is the only HTTP call performed by the demo. Replace or adapt `AnalyzeService.performIadPrepare()` if your project needs a different backend wrapper, headers, or authentication method.

## Build and test

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Camera note

Camera access requires a secure context. Browser development on `localhost` is supported; deployed demos should use HTTPS.
