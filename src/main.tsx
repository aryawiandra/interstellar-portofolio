import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/global.css'
import './ui/ui.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
