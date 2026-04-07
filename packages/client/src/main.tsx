import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import SpeciesDetail from "./pages/SpeciesDetail";
import Rules from "./pages/Rules";
import { ViewModeProvider } from "./context/ViewModeContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ViewModeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/species" element={<Home />} />
            <Route path="/species/:slug" element={<SpeciesDetail />} />
            <Route path="/rules" element={<Rules />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ViewModeProvider>
  </React.StrictMode>
);
