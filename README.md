# Unissey Web SDK examples

Sample applications showing how to integrate Unissey Web SDK 6.0.0 capture components.

## Projects

| Project | SDK package | Description |
| --- | --- | --- |
| `sdk-angular-demo` | `@unissey-web/sdk-angular@6.0.0` | Angular wrappers demo with one page per capture component. |
| `sdk-react-demo` | `@unissey-web/sdk-react@6.0.0` | React wrappers demo with one page per capture component. |
| `sdk-web-js` | `@unissey/sdk-web-js` | Lower-level JavaScript SDK example. |

See [`sdk-web.md`](./sdk-web.md) for the SDK 6.0.0 integration reference.

## Angular demo

```bash
cd sdk-angular-demo
npm install
npm start
```

Open <http://localhost:4200>.

## React demo

```bash
cd sdk-react-demo
npm install
npm start
```

Open <http://localhost:3000>.

## Capture demo pages

The Angular and React demos include pages for:

- Video recorder
- Selfie capture
- Reference capture
- Full capture
- IAD video recorder

The non-IAD pages do not make HTTP calls. They log SDK event payloads to the browser console after a capture is completed.

The IAD video recorder page asks for:

- IAD prepare URL
- API key / Authorization header value

It performs only the IAD prepare request, then passes the returned text as `iadConfig.data` to the recorder. Captured media is not uploaded by these demos.

## Browser/camera notes

Camera capture requires a secure context. `localhost` is accepted by browsers for local development; deployed demos should be served over HTTPS.
