import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Viewer from './Viewer.jsx'

const path = window.location.pathname;
const Component = path.startsWith('/view') ? Viewer : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>
)
