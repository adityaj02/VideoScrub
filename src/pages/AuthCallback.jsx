import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.warn("Unable to save user email in profiles table.", error);
      }

      navigate("/profile");
    };

    handleAuth();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 50, padding: "20px" }}>
      <VideoBackground theme="dark" />
      <ThreeScene theme="dark" />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: -10,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "48px 40px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Authenticating</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Securely signing you in...</p>
      </div>
    </div>
  );
}
