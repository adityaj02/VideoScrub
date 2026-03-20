import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import App from "./App";
import Login from "./pages/Login"; // classic (with video bg) — kept as fallback
import BlogPage from "./components/blog/BlogPage";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Main app — loads on root ── */}
                <Route path="/"          element={<App />} />
                <Route path="/dashboard" element={<App />} />
                <Route path="/home"      element={<App />} />
                <Route path="/blog"      element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPage />} />

                {/* ── Auth flow ── */}
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/profile"       element={<Profile />} />

                {/* ── Optional pages ── */}
                <Route path="/login-classic" element={<Login />} />

                {/* ── Fallback ── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
