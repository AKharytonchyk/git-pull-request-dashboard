import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScopedCssBaseline } from "@mui/material";
import LandingPage from "./pages/LandingPage.lazy";
import Dashboard from "./pages/Dashboard.lazy";
import Coverage from "./pages/Coverage.lazy";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "/coverage",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Coverage />
          </Suspense>
        ),
      },
    ],
  },
]);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ScopedCssBaseline>
        <RouterProvider router={router} />
      </ScopedCssBaseline>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
