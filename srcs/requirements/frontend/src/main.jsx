import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import GlobalStyle from './GlobalStyle.jsx';

createRoot(document.getElementById('root')).render(
    <>
        <GlobalStyle />
        <App />
    </>
);