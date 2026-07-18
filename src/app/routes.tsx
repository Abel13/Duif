import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthPage } from "../pages/AuthPage/AuthPage";
import { FriendProfilePage } from "../pages/FriendProfilePage/FriendProfilePage";
import { FriendsPage } from "../pages/FriendsPage/FriendsPage";
import { InventoryAlbumPage } from "../pages/InventoryAlbumPage/InventoryAlbumPage";
import { MascotDetailPage } from "../pages/MascotDetailPage/MascotDetailPage";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { RewardCollectionPage } from "../pages/RewardCollectionPage/RewardCollectionPage";
import { SendFlowPage } from "../pages/SendFlowPage/SendFlowPage";
import { ShopPage } from "../pages/ShopPage/ShopPage";

const TravelMapPage = lazy(() =>
  import("../pages/TravelMapPage/TravelMapPage").then((module) => ({
    default: module.TravelMapPage,
  })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/mascots/:mascotId" element={<MascotDetailPage />} />
      <Route path="/inventory" element={<InventoryAlbumPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/friends/:friendId" element={<FriendProfilePage />} />
      <Route
        path="/map"
        element={
          <Suspense fallback={null}>
            <TravelMapPage />
          </Suspense>
        }
      />
      <Route path="/rewards/:deliveryId" element={<RewardCollectionPage />} />
      <Route path="/send" element={<SendFlowPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
