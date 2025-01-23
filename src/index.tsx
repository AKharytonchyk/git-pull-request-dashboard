import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Coverage from "./pages/Coverage";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import { MyPullRequests } from "./pages/MyPullRequests";
import { RepositoriesPage } from "./pages/RepositoriesPage";
import IssuesPage from "./pages/IssuesPage";
import { RepositoryItem } from "./pages/RepositoryItem";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/coverage" element={<Coverage />} />
            <Route path="/my-pull-requests" element={<MyPullRequests />} />
            <Route path="/repositories">
              <Route index element={<RepositoriesPage />} />
              <Route path=":owner/:repo" element={<RepositoryItem />} />
            </Route>
            <Route path="/issues" element={<IssuesPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
