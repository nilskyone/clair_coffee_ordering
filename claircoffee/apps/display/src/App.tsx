import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DisplayPage } from "./pages/DisplayPage";
import { useDisplaySocket } from "./hooks/useDisplaySocket";

const App: React.FC = () => {
  useDisplaySocket();

  return (
    <Routes>
      <Route path="/display" element={<DisplayPage />} />
      <Route path="*" element={<Navigate to="/display" replace />} />
    </Routes>
  );
};

export default App;
