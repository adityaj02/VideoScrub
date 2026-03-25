import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/background/VideoBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const sendMagicLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(true); // Keep loading state until redirected or message shown

    if (error) {
      setLoading(false);
      setErrorMessage(error.message || "Unable to send magic link. Please try again.");
      return;
    }

    localStorage.setItem("email_for_otp", normalizedEmail);
    setSent(true);
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setErrorMessage(error.message || "Unable to sign in with Google.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <VideoBackground theme="dark" blur={20} brightness={0.5} />
      
      <div className="hero-overlay-base" />
      <div className="hero-overlay-vignette" />

      <div className="glass relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/15 bg-[#0a0a0a]/60 p-6 text-white shadow-2xl backdrop-blur-3xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/40">H</div>
          </div>

          <h2 className="mb-2 text-3xl font-black tracking-tighter text-center">Welcome Back</h2>
          <p className="mb-8 text-sm text-white/50 text-center">
            Sign in with a secure magic link sent to your email.
          </p>

          {!sent ? (
            <>
              <label htmlFor="login-email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10"
              />

              {errorMessage && (
                <p className="mt-4 text-xs font-semibold text-red-400 text-center" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="mt-8 w-full rounded-full bg-blue-600 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Login Link"}
              </button>

              <div className="relative my-8 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-[#0a0a0a]/60 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">OR</span>
              </div>

              <button
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-4 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 opacity-70" />
                Continue with Google
              </button>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mb-6 inline-flex w-20 h-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-4xl">📬</div>
              <h3 className="mb-2 text-xl font-bold">Check your inbox</h3>
              <p className="text-sm text-white/50 break-all leading-relaxed">We sent a magic link to<br/><span className="text-white font-semibold">{email}</span></p>
              <button onClick={() => setSent(false)} className="mt-8 text-[11px] font-bold uppercase tracking-widest text-white/40 underline underline-offset-4 transition-colors hover:text-white">
                Use a different email
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <button onClick={() => navigate("/")} className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-white">
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
