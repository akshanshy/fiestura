import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

import './styles/style.css'
import './styles/contact.css'
import './styles/login.css'
import './styles/signup.css'
import './styles/registration.css'
import './styles/ongoing.css'
import './styles/upcoming.css'
import './styles/past.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

