import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Frametta from "./App.jsx";
import { initNativeShell } from "./native/initNative.js";

initNativeShell();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Frametta />
  </React.StrictMode>
);
