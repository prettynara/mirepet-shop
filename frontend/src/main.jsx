import React from 'react'
import ReactDom from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext.jsx'
import ShopContextProvider from './context/ShopContext.jsx'

ReactDom.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <RoleProvider>
      <ShopContextProvider>
      <App />
      </ShopContextProvider>
    </RoleProvider>
  </BrowserRouter>,
)
