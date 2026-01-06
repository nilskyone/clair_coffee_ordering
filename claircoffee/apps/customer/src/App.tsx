import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TrackPage } from "./pages/TrackPage";

const App: React.FC = () => (
  <Routes>
    <Route path="/track/:token" element={<TrackPage />} />
    <Route path="*" element={<Navigate to="/track/demo-token" replace />} />
  </Routes>
);

export default App;
