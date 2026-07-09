import { Navigate, Route, Routes } from "react-router-dom";

import { MascotDetailPage } from "../pages/MascotDetailPage/MascotDetailPage";
import { SendFlowPage } from "../pages/SendFlowPage/SendFlowPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
      <Route path="/mascots/:mascotId" element={<MascotDetailPage />} />
      <Route path="/send" element={<SendFlowPage />} />
      <Route path="*" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
    </Routes>
  );
}
