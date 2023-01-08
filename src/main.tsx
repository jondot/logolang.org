/* eslint-disable no-console */
// import './wdyr'
import React from 'react'
import ReactDOM from 'react-dom/client'
import init from 'dom-logo'
import App from './app'

init()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
  .catch(console.log)
