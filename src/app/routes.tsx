import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";

import { FoundationStatusPage } from "../pages/FoundationStatusPage/FoundationStatusPage";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { AuthCallbackPage } from "../pages/AuthCallbackPage/AuthCallbackPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage/ResetPasswordPage";
import { OnboardingPage } from "../pages/OnboardingPage/OnboardingPage";
import { sanitizeIntendedRoute } from "../integrations/supabase/authContracts";
import { useAuth } from "../integrations/supabase/AuthProvider";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicAuthRoute />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<ProtectedOnboardingRoute />} />
      <Route path="*" element={<ProtectedFoundationRoute />} />
    </Routes>
  );
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

  return <FoundationStatusPage state="onboardingPending" />;
}

function ProtectedOnboardingRoute() {
  const { journeyState, onboarding } = useAuth();

  if (journeyState === "loading") return <FoundationStatusPage state="loading" />;
  if (journeyState === "serviceUnavailable") return <FoundationStatusPage state="unavailable" />;
  if (journeyState === "anonymous" || journeyState === "verificationPending") {
    return <Navigate replace to="/auth?next=%2Fonboarding" />;
  }
  if (journeyState !== "onboardingRequired" || !onboarding) {
    return <FoundationStatusPage state="onboardingPending" />;
  }
  return <OnboardingPage />;
}
