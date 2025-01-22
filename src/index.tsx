import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScopedCssBaseline } from "@mui/material";
import Coverage from "./pages/Coverage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard";
import { MyPullRequests } from "./pages/MyPullRequests";
import { RepositoriesPage } from "./pages/RepositoriesPage";
import IssuesPage from "./pages/IssuesPage";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/login",
        element: <LandingPage />,
      },
      {
        path: "/coverage",
        element: <Coverage />,
      },
      {
        path: "/my-pull-requests",
        element: <MyPullRequests />,
      },
      {
        path: "/repositories",
        element: <RepositoriesPage />,
      },
      {
        path: "/issues",
        element: <IssuesPage />,
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
