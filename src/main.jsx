import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
// import router from './router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <RouterProvider router={router}>
//     <App />
//   </RouterProvider>
// );
