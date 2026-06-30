import 'core-js';
import 'regenerator-runtime/runtime';
import '@webcomponents/webcomponentsjs';
import 'lit/polyfill-support.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
