import './App.css';

import {FullCapture } from "@unissey/sdk-react";


type Data = {
  selfie: Blob;
  reference: Blob;
  metadata: unknown
}

function App() {
  const handleData = (e: Event) => {
    // Do something with data recorded by sdk
    const data = (e as CustomEvent<Data>).detail;

    console.log(data)
  }

  return (
    <div className="App">
        <div className="SdkZone">
          <FullCapture onData={handleData} />
        </div>
    </div>
  );
}

export default App;
