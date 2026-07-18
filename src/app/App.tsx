import { AppRoutes } from "./routes";
import { PwaInstallPrompt } from "../components/layout";
import { AuthProvider } from "../integrations/supabase/AuthProvider";

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <PwaInstallPrompt />
    </AuthProvider>
  );
}
