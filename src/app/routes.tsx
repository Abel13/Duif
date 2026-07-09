import { Navigate, Route, Routes } from "react-router-dom";

import { FriendProfilePage } from "../pages/FriendProfilePage/FriendProfilePage";
import { FriendsPage } from "../pages/FriendsPage/FriendsPage";
import { MascotDetailPage } from "../pages/MascotDetailPage/MascotDetailPage";
import { RewardCollectionPage } from "../pages/RewardCollectionPage/RewardCollectionPage";
import { SendFlowPage } from "../pages/SendFlowPage/SendFlowPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
      <Route path="/mascots/:mascotId" element={<MascotDetailPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/friends/:friendId" element={<FriendProfilePage />} />
      <Route path="/rewards/:deliveryId" element={<RewardCollectionPage />} />
      <Route path="/send" element={<SendFlowPage />} />
      <Route path="*" element={<Navigate to="/mascots/mascot-nuvem" replace />} />
    </Routes>
  );
}
