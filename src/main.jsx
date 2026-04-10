import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
              window.location.reload()
            }
          }
        })
      })
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
