import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import DisplayGraph from './DisplayGraph.jsx'
import KrakenTest from './KrakenTest.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "display-graph",
    element: <DisplayGraph />,
  },
  {
    path: "kraken-test",
    element: <KrakenTest />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
