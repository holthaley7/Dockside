import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SpeciesDetail from "./pages/SpeciesDetail";
import Rules from "./pages/Rules";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/species/:slug" element={<SpeciesDetail />} />
          <Route path="/rules" element={<Rules />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
