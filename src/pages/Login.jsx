import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login({ close }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || "Unable to send magic link. Please try again.");
      return;
    }

    setEmail(normalizedEmail);
    setSent(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[20px]">
      <div className="glass relative w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/15 bg-[#0a0a0a]/70 p-6 text-white shadow-2xl shadow-black/70 sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />

        <div className="relative z-10">
          <h2 className="mb-2 text-2xl font-black tracking-tighter sm:text-3xl">Welcome Back</h2>
          <p className="mb-6 text-sm text-white/60 sm:mb-8">
            Sign in with a secure magic link sent to your email.
          </p>

          {!sent ? (
            <>
              <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/60">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-black/35 p-4 text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/50"
              />

              {errorMessage && (
                <p className="mt-3 text-sm text-red-300" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="mt-6 w-full rounded-full border border-white/20 bg-white/10 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-black/40 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Login Link"}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-[#0a0a0a] px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">OR</span>
              </div>

              <button
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4 opacity-70" />
                Continue with Google
              </button>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-4 text-4xl">📬</div>
              <h3 className="mb-2 text-lg font-bold">Check your inbox</h3>
              <p className="text-sm text-white/60 break-all">We sent a magic link to {email}</p>
              <button onClick={() => setSent(false)} className="mt-6 text-xs text-white/60 underline transition-colors hover:text-white">
                Use a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={close} className="text-xs uppercase tracking-widest text-white/60 transition-colors hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
