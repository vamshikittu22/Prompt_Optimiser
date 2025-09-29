import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppMVP from './AppMVP';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMVP />
  </StrictMode>
);
