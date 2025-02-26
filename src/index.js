// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Simple debug statement to confirm this file is being executed
console.log('index.js: Starting up React application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('index.js: ERROR - No element with id="root" found in index.html!');
} else {
  console.log('index.js: rootElement found:', rootElement);
}

const root = ReactDOM.createRoot(rootElement);

// Another debug statement before rendering
console.log('index.js: Rendering <App /> into #root');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Once rendered, we can log that React is running
console.log('index.js: React app has been rendered.');

// If you want to measure performance, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals((metric) => {
  console.log('reportWebVitals:', metric);
});
