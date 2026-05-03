import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="sg-status-banner" role="status">
          <span className="sg-status-banner-label">Status</span>
          <p>Schedule data and filters are live. More federation coverage will appear here as it is connected.</p>
        </div>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
