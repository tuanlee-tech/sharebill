import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ShareBill from './ShareBill.tsx'
import { HelmetProvider } from 'react-helmet-async';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ShareBill />
    </HelmetProvider>
  </StrictMode>
)
