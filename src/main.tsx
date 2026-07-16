import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BaguiSportApp } from './BaguiSportApp'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BaguiSportApp />
  </StrictMode>,
)
