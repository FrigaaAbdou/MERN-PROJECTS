import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'        // ← make sure this points to your Tailwind CSS
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)