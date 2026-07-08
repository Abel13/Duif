import { Navigate, Route, Routes } from "react-router-dom";

import { MascotDetailPage } from "../pages/MascotDetailPage/MascotDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
      <Route path="/mascots/:mascotId" element={<MascotDetailPage />} />
      <Route path="*" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
    </Routes>
  );
}
