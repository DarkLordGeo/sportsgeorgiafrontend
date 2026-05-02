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
        <div className="w-full justify-center border border-[#C4D2D4] bg-[#F5F8F6] shadow-sm px-4 py-1 flex items-center gap-3 ">
          <span className="text-base leading-none mt-0.5">
            🔧
          </span>

          <p className="text-[12px] md:text-sm font-bold text-[#2C475D] text-center ">
            საიტი განახლების პროცესშია — ცვლილებები მალე დაემატება.
          </p>
        </div>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
