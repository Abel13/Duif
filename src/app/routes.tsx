import { Navigate, Route, Routes } from "react-router-dom";

import { FoundationStatusPage } from "../pages/FoundationStatusPage/FoundationStatusPage";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { useAuth } from "../integrations/supabase/AuthProvider";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<ProtectedFoundationRoute />} />
    </Routes>
  );
}

function ProtectedFoundationRoute() {
  const { isConfigured, isLoading, isServiceAvailable, profile, session } = useAuth();

  if (isLoading) {
    return <FoundationStatusPage state="loading" />;
  }

  if (!isConfigured || !isServiceAvailable) {
    return <FoundationStatusPage state="unavailable" />;
  }

  if (!session) {
    return <Navigate replace to="/auth" />;
  }

  return <FoundationStatusPage state={profile ? "onboardingPending" : "accountPending"} />;
}
