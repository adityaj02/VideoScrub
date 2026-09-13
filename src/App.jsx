import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function AppRoutes() {
  const { isAuthenticated, profileComplete, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!profileComplete) {
    return <Profile onComplete={() => window.location.reload()} />;
  }

  return <Landing />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
