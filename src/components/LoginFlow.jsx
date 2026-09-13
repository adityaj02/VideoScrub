import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function LoginFlow({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage("");

    try {
      await signInWithGoogle(credentialResponse.credential);
      onClose?.();
    } catch (err) {
      setMessage(err.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="glass login-card">
      <h2 className="login-title">
        Your Home,<br />
        <span className="accent">Our Expertise</span>
      </h2>

      <p className="company-brief">
        Verified electricians, plumbers and home experts.
        Sign in with Google to continue.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Signing you in...</p>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="pill"
            size="large"
            text="continue_with"
            width="320"
          />
        )}
      </div>

      {message && (
        <p style={{ marginTop: "12px", color: "#fca5a5", fontSize: "13px", textAlign: "center" }}>
          {message}
        </p>
      )}
    </div>
  );
}
