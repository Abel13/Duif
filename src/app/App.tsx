import { AppRoutes } from "./routes";
import { PwaInstallPrompt } from "../components/layout";
import { AuthProvider } from "../integrations/supabase/AuthProvider";
import { OfficialAssetProvider } from "../integrations/supabase/OfficialAssetProvider";

export function App() {
  return (
    <AuthProvider>
      <OfficialAssetProvider>
        <AppRoutes />
        <PwaInstallPrompt />
      </OfficialAssetProvider>
    </AuthProvider>
  );
}
