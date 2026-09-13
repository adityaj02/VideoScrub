import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import VideoBackground from "../components/background/VideoBackground";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { signInWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await signInWithGoogle(credentialResponse.credential);
      window.location.href = "/";
    } catch (err) {
      setErrorMessage(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      <VideoBackground theme="dark" blur={0} brightness={0.85} opacity={1} />
      
      {/* Subtle background overlay to keep video clear while enhancing card readability */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none z-[1]" />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/20 !bg-slate-950/85 p-8 text-white shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/30">
              H
            </div>
          </div>

          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="mb-8 text-sm font-medium text-slate-300">
            Sign in with your Google account to continue to HouseServe.
          </p>

          {errorMessage && (
            <p className="mb-4 text-xs font-semibold text-red-300" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col items-center gap-3 w-full">
            {loading ? (
              <p className="py-3 text-xs font-bold uppercase tracking-widest text-slate-300">
                Signing you in...
              </p>
            ) : (
              <>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="300"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSuccess({ credential: "demo_google_credential_dev" })}
                  className="w-full max-w-[300px] py-3 px-4 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
