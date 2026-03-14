import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Otp() {

    const navigate = useNavigate();
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

    const email = localStorage.getItem("email_for_otp");

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }

        if (newDigits.join("").length === 6) {
            verifyOtp(newDigits.join(""));
        }
    };

    const handleBackspace = (index, e) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const verifyOtp = async (code) => {
        setLoading(true);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "email"
        });

        setLoading(false);

        if (error) {
            alert("Invalid OTP");
        } else {
            navigate("/authenticated");
        }
    };

    return (
        <div className="black-auth-bg">

            <div className="glass-dark" style={{ padding: "50px", width: "420px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                <h2 className="apple-title">
                    Verify Your Email
                </h2>

                <p className="subtle-text" style={{ marginTop: "10px" }}>
                    Enter the 6-digit code sent to your inbox.
                </p>

                <div style={{ display: "flex", gap: "12px", marginTop: "30px", justifyContent: "center" }}>
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputs.current[index] = el}
                            className="otp-box"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleBackspace(index, e)}
                        />
                    ))}
                </div>

                {loading && (
                    <p className="subtle-text" style={{ marginTop: "20px" }}>
                        Verifying...
                    </p>
                )}

            </div>

        </div>
    );
}
