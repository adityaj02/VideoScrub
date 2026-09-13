import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import Profile from "./pages/Profile";
import App from "./App";
import BlogPage from "./components/blog/BlogPage";
import MarketplaceDashboard from "./pages/MarketplaceDashboard";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Router() {
    const content = (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ── Main app — loads on root ── */}
                    <Route path="/"             element={<App />} />
                    <Route path="/dashboard"    element={<App />} />
                    <Route path="/home"         element={<App />} />
                    <Route path="/blog"         element={<BlogPage />} />
                    <Route path="/marketplace" element={<MarketplaceDashboard />} />
                    <Route path="/blog/:slug" element={<BlogPage />} />

                    {/* ── Auth flow ── */}
                    <Route path="/login"         element={<LoginPage />} />
                    <Route path="/profile"       element={<Profile />} />

                    {/* ── Fallback ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );

    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.trim() !== "") {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {content}
            </GoogleOAuthProvider>
        );
    }

    return content;
}
