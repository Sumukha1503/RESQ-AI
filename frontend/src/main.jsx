import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="system" storageKey="resq-ai-theme">
    <App />
  </ThemeProvider>
);