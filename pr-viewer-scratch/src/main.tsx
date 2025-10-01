import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import GitHubCallback from "./pages/GitHubCallback";
import { AuthProvider } from "./state/useAuth";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/github-callback" element={<GitHubCallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);