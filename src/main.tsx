import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { HelmetProvider } from 'react-helmet-async'
import ShareBill from './features/ShareBill'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ShareBill />
    </HelmetProvider>
  </StrictMode>
)
