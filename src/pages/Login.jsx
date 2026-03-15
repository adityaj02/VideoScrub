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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[20px]">
      <div className="glass relative w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/20 bg-white/[0.1] p-6 text-white shadow-2xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-blue-500/10" />

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
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-colors placeholder:text-white/35 focus:border-blue-500/50"
              />

              {errorMessage && (
                <p className="mt-3 text-sm text-red-300" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-blue-600 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Login Link"}
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
