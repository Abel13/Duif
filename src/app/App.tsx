import { AppRoutes } from "./routes";
import { AuthProvider } from "../integrations/supabase/AuthProvider";

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
