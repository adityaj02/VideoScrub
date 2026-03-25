import { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/background/VideoBackground";

export default function Otp() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputs = useRef([]);

  const email = localStorage.getItem("email_for_otp");

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const verifyOtp = async (code) => {
    if (!email) {
      setErrorMessage("Missing email session. Please request a new OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;
      navigate("/authenticated");
    } catch (error) {
      setErrorMessage(error.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    const code = newDigits.join("");
    if (code.length === 6 && !newDigits.includes("")) {
      verifyOtp(code);
    }
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <VideoBackground theme="dark" blur={20} brightness={0.5} />
      
      <div className="hero-overlay-base" />
      <div className="hero-overlay-vignette" />

      <div className="glass relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0a]/60 p-8 text-center backdrop-blur-3xl sm:p-10">
        <div className="mb-8 flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/40">H</div>
        </div>

        <h2 className="text-2xl font-black tracking-tighter text-white sm:text-3xl">Verify Your Email</h2>
        <p className="mt-3 text-sm text-white/50 leading-relaxed">
          We've sent a 6-digit code to<br/>
          <span className="text-white font-semibold">{email}</span>
        </p>

        <div className="mt-10 grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="One-time password">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              className="w-full aspect-square text-2xl font-black text-center border border-white/10 bg-white/5 rounded-xl text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              maxLength="1"
              value={digit}
              inputMode="numeric"
              autoComplete="one-time-code"
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleBackspace(index, e)}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="mt-6 text-xs font-semibold text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        {loading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
            Verifying...
          </div>
        )}

        <div className="mt-10 flex flex-col gap-6">
            <button
                onClick={() => navigate("/login")}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors underline underline-offset-4"
            >
                Use a different email
            </button>
            
            <button 
                onClick={() => navigate("/")} 
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 transition-colors hover:text-white"
            >
                ← Back to home
            </button>
        </div>
      </div>
    </div>
  );
}
