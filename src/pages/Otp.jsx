import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputs = useRef([]);

  const email = localStorage.getItem("email_for_otp");

  const verifyOtp = async (code) => {
    if (!email) {
      setErrorMessage("Missing email session. Please request a new OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Invalid or expired OTP. Please try again.");
      return;
    }

    navigate("/authenticated");
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
    <div className="black-auth-bg px-4">
      <div className="glass-dark w-full max-w-[420px] p-8 text-center sm:p-10" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 className="apple-title">Verify Your Email</h2>
        <p className="subtle-text mt-2">Enter the 6-digit code sent to your inbox.</p>

        <div className="mt-8 grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="One-time password">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              className="otp-box"
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

        {loading && <p className="subtle-text mt-5">Verifying...</p>}
        {errorMessage && (
          <p className="mt-5 text-sm text-red-300" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
