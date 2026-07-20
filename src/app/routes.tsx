import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";

import { FoundationStatusPage } from "../pages/FoundationStatusPage/FoundationStatusPage";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { AuthCallbackPage } from "../pages/AuthCallbackPage/AuthCallbackPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage/ResetPasswordPage";
import { OnboardingPage } from "../pages/OnboardingPage/OnboardingPage";
import { sanitizeIntendedRoute } from "../integrations/supabase/authContracts";
import { useAuth } from "../integrations/supabase/AuthProvider";
import { isAssetAdministrator } from "../integrations/supabase/assetStudio";

const TutorialDeliveryPage=lazy(()=>import("../pages/TutorialDeliveryPage/TutorialDeliveryPage").then(module=>({default:module.TutorialDeliveryPage})));
const NestSetupPage=lazy(()=>import("../pages/NestSetupPage/NestSetupPage").then(module=>({default:module.NestSetupPage})));
const TravelMapPage=lazy(()=>import("../pages/TravelMapPage/TravelMapPage").then(module=>({default:module.TravelMapPage})));
const MascotDetailPage=lazy(()=>import("../pages/MascotDetailPage/MascotDetailPage").then(module=>({default:module.MascotDetailPage})));
const InventoryAlbumPage=lazy(()=>import("../pages/InventoryAlbumPage/InventoryAlbumPage").then(module=>({default:module.InventoryAlbumPage})));
const FriendsPage=lazy(()=>import("../pages/FriendsPage/FriendsPage").then(module=>({default:module.FriendsPage})));
const ShopPage=lazy(()=>import("../pages/ShopPage/ShopPage").then(module=>({default:module.ShopPage})));
const SendFlowPage=lazy(()=>import("../pages/SendFlowPage/SendFlowPage").then(module=>({default:module.SendFlowPage})));
const AssetStudioPage=lazy(()=>import("../pages/AssetStudioPage/AssetStudioPage").then(module=>({default:module.AssetStudioPage})));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicAuthRoute />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<ProtectedOnboardingRoute />} />
      <Route path="/onboarding/tutorial" element={<ProtectedTutorialRoute />} />
      <Route path="/onboarding/nest" element={<ProtectedNestRoute />} />
      <Route path="/map" element={<ProtectedGameRoute><TravelMapPage/></ProtectedGameRoute>} />
      <Route path="/mascots/:mascotId" element={<ProtectedGameRoute><MascotDetailPage/></ProtectedGameRoute>} />
      <Route path="/inventory" element={<ProtectedGameRoute><InventoryAlbumPage/></ProtectedGameRoute>} />
      <Route path="/friends" element={<ProtectedGameRoute><FriendsPage/></ProtectedGameRoute>} />
      <Route path="/shop" element={<ProtectedGameRoute><ShopPage/></ProtectedGameRoute>} />
      <Route path="/send" element={<ProtectedGameRoute><SendFlowPage/></ProtectedGameRoute>} />
      <Route path="/admin/assets" element={<ProtectedAdminRoute />} />
      <Route path="*" element={<ProtectedFoundationRoute />} />
    </Routes>
  );
}

function ProtectedNestRoute(){const {journeyState}=useAuth();if(journeyState==="loading")return <FoundationStatusPage state="loading"/>;if(journeyState==="nestSetupRequired")return <Suspense fallback={<FoundationStatusPage state="loading"/>}><NestSetupPage/></Suspense>;return <Navigate replace to={journeyState==="ready"?"/map":"/onboarding"}/>;}
function ProtectedAdminRoute(){const {isLoading,session}=useAuth();if(isLoading)return <FoundationStatusPage state="loading"/>;if(!session)return <Navigate replace to="/auth?next=%2Fadmin%2Fassets"/>;if(!isAssetAdministrator(session.user.app_metadata))return <Navigate replace to="/map"/>;return <Suspense fallback={<FoundationStatusPage state="loading"/>}><AssetStudioPage/></Suspense>;}
function ProtectedGameRoute({children}:{children:ReactNode}){const {journeyState}=useAuth();if(journeyState==="loading")return <FoundationStatusPage state="loading"/>;if(journeyState!=="ready")return <Navigate replace to={journeyState==="nestSetupRequired"?"/onboarding/nest":"/onboarding"}/>;return <Suspense fallback={<FoundationStatusPage state="loading"/>}>{children}</Suspense>;}

function ProtectedTutorialRoute() {
  const {journeyState,onboarding}=useAuth();
  if(journeyState==="loading") return <FoundationStatusPage state="loading"/>;
  if(journeyState==="serviceUnavailable") return <FoundationStatusPage state="unavailable"/>;
  if(journeyState==="anonymous"||journeyState==="verificationPending") return <Navigate replace to="/auth?next=%2Fonboarding%2Ftutorial"/>;
  if((journeyState!=="tutorialActive"&&journeyState!=="nestSetupRequired")||!onboarding) return <Navigate replace to="/onboarding"/>;
  return <Suspense fallback={<FoundationStatusPage state="loading"/>}><TutorialDeliveryPage/></Suspense>;
}

function PublicAuthRoute() {
  const { isLoading, session } = useAuth();
  const [searchParams] = useSearchParams();
  if (!isLoading && session) {
    return <Navigate replace to={sanitizeIntendedRoute(searchParams.get("next"))} />;
  }
  return <AuthPage />;
}

function ProtectedFoundationRoute() {
  const { journeyState } = useAuth();
  const location = useLocation();

  if (journeyState === "loading") {
    return <FoundationStatusPage state="loading" />;
  }

  if (journeyState === "serviceUnavailable") {
    return <FoundationStatusPage state="unavailable" />;
  }

  if (journeyState === "anonymous" || journeyState === "verificationPending") {
    const intendedRoute = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate replace to={`/auth?next=${encodeURIComponent(intendedRoute)}`} />;
  }

  if (journeyState === "onboardingRequired") {
    return <Navigate replace to="/onboarding" />;
  }
  if(journeyState==="tutorialActive") return <Navigate replace to="/onboarding/tutorial"/>;
  if(journeyState==="nestSetupRequired") return <Navigate replace to="/onboarding/nest"/>;
  if(journeyState==="ready") return <Navigate replace to="/map"/>;

  return <FoundationStatusPage state="onboardingPending" />;
}

function ProtectedOnboardingRoute() {
  const { journeyState, onboarding } = useAuth();

  if (journeyState === "loading") return <FoundationStatusPage state="loading" />;
  if (journeyState === "serviceUnavailable") return <FoundationStatusPage state="unavailable" />;
  if (journeyState === "anonymous" || journeyState === "verificationPending") {
    return <Navigate replace to="/auth?next=%2Fonboarding" />;
  }
  if ((journeyState !== "onboardingRequired" && journeyState !== "tutorialActive") || !onboarding) {
    return <FoundationStatusPage state="onboardingPending" />;
  }
  return <OnboardingPage />;
}
