import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import App from "./App";

const container = document.getElementById("root");

const root = createRoot(container!);
if (true) {
  console.log("Development mode");
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
