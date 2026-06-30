import { useState } from 'react';
import './App.css';

import {
  AcquisitionPreset,
  FullCapture,
  ReferenceCapture,
  SelfieCapture,
  SessionConfig,
  VideoRecorder,
} from "@unissey-web/sdk-react";

type Page = 'video' | 'selfie' | 'reference' | 'full' | 'iad';

const pages: Array<{ id: Page; label: string }> = [
  { id: 'video', label: 'Video recorder' },
  { id: 'selfie', label: 'Selfie capture' },
  { id: 'reference', label: 'Reference capture' },
  { id: 'full', label: 'Full capture' },
  { id: 'iad', label: 'IAD video recorder' },
];

function logEvent(name: string) {
  return (event: Event) => {
    console.log(name, (event as CustomEvent).detail);
  };
}

async function performIadPrepare(url: string, apiKey: string): Promise<string> {
  /**
   * IAD requires prepare data created by your backend before the recorder starts.
   * This sample makes the IAD prepare call explicit: provide your prepare URL and
   * API key in the demo page. It does not upload captured media.
   */
  const response = await fetch(url, {
    method: 'POST',
    headers: apiKey ? { Authorization: apiKey } : undefined,
  });

  if (!response.ok) {
    throw new Error(`IAD prepare failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function App() {
  const [page, setPage] = useState<Page>('video');
  const [iadPrepareUrl, setIadPrepareUrl] = useState('');
  const [iadApiKey, setIadApiKey] = useState('');
  const [iadConfig, setIadConfig] = useState<SessionConfig>();
  const [iadError, setIadError] = useState<string>();
  const [loadingIad, setLoadingIad] = useState(false);

  const prepareIad = async () => {
    setLoadingIad(true);
    setIadError(undefined);
    setIadConfig(undefined);

    try {
      if (!iadPrepareUrl) {
        throw new Error('Provide the IAD prepare URL.');
      }

      const data = await performIadPrepare(iadPrepareUrl, iadApiKey);
      setIadConfig({ iadConfig: { data } });
    } catch (error) {
      setIadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingIad(false);
    }
  };

  return (
    <div className="App">
      <nav className="Nav">
        {pages.map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? 'active' : ''}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="SdkZone">
        <h1>{pages.find((item) => item.id === page)?.label}</h1>
        <p className="Help">This demo logs SDK event payloads to the browser console after you complete a capture. Start and finish a capture before checking the logs.</p>

        {page === 'video' && (
          <VideoRecorder
            preset={AcquisitionPreset.SELFIE_MJPEG}
            config={{}}
            onRecordCompleted={logEvent('recordCompleted')}
            onRecorderReady={logEvent('recorderReady')}
          />
        )}

        {page === 'selfie' && (
          <SelfieCapture
            onSelfie={logEvent('selfie')}
            onRecordCompleted={logEvent('recordCompleted')}
            onRecorderReady={logEvent('recorderReady')}
          />
        )}

        {page === 'reference' && (
          <ReferenceCapture
            onReference={logEvent('reference')}
            onRecordCompleted={logEvent('recordCompleted')}
            onRecorderReady={logEvent('recorderReady')}
          />
        )}

        {page === 'full' && (
          <FullCapture
            onData={logEvent('data')}
            onRecorderReady={logEvent('recorderReady')}
          />
        )}

        {page === 'iad' && (
          <div className="IadPage">
            <p className="Help">
              IAD requires prepared session data from your backend. Provide your IAD prepare endpoint and API key below.
              This page only calls the prepare endpoint; captured media is only logged after you complete the capture.
            </p>
            <label>
              IAD prepare URL
              <input
                type="url"
                value={iadPrepareUrl}
                onChange={(event) => setIadPrepareUrl(event.target.value)}
                placeholder="https://your-backend.example.com/iad/prepare"
              />
            </label>
            <label>
              API key / Authorization header value
              <input
                type="password"
                value={iadApiKey}
                onChange={(event) => setIadApiKey(event.target.value)}
                placeholder="Bearer ... or your API key"
              />
            </label>
            <button type="button" onClick={prepareIad} disabled={loadingIad}>
              {loadingIad ? 'Preparing IAD session...' : 'Prepare IAD session'}
            </button>
            {iadError && <p className="Error">{iadError}</p>}
            {iadConfig && (
              <VideoRecorder
                preset={AcquisitionPreset.SELFIE_MJPEG}
                config={iadConfig}
                onRecordCompleted={logEvent('recordCompleted')}
                onRecorderReady={logEvent('recorderReady')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
