import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login({ close }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-3xl bg-black/40">
      <div className="glass p-12 rounded-[40px] w-[420px] text-white shadow-2xl relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Welcome Back</h2>
          <p className="text-sm text-white/50 mb-8">Sign in with a magic link to your email.</p>

          {!sent ? (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 transition-colors"
              />

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="mt-6 w-full py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Login Link"}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-lg font-bold mb-2">Check your inbox</h3>
              <p className="text-sm text-white/50">We sent a magic link to {email}</p>
              <button onClick={() => setSent(false)} className="mt-6 text-xs text-white/40 underline">
                Use a different email
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={close}
              className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
