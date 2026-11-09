import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "./app/providers/app-provider";
import App from "./App";

import "./index.css";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
