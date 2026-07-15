import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener('error', (e) => alert('Uncaught Error: ' + (e.error?.message || e.message)));
window.addEventListener('unhandledrejection', (e) => alert('Unhandled Rejection: ' + (e.reason?.message || e.reason)));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
