import React from 'react'
import ReactDOM from 'react-dom/client'
import WebRTC from './tasks/WebRTC'
import './index.css'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { Mediator } from "./tasks/patterns/mediator";

const router = createBrowserRouter([
    {
        path: "/",
        Component: WebRTC,
    },
    {
        path: "/mediator",
        Component: Mediator,
    }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>,
)
