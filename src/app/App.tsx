import { AppRoutes } from "./routes";
import { PwaInstallGate } from "../components/layout";
import { AuthProvider } from "../integrations/supabase/AuthProvider";
import { OfficialAssetProvider } from "../integrations/supabase/OfficialAssetProvider";

export function App() {
  return (
    <PwaInstallGate>
      <AuthProvider>
        <OfficialAssetProvider>
          <AppRoutes />
        </OfficialAssetProvider>
      </AuthProvider>
    </PwaInstallGate>
  );
}
