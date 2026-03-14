import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LoginFlow() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const sendMagicLink = async () => {

        if (!email.includes("@")) {
            setMessage("Enter valid email");
            return;
        }

        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin + "/auth/callback"
            }
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Magic link sent. Check your email.");
        }
    };

    return (
        <div className="glass login-card">

            <h2 className="login-title">
                Your Home,<br />
                <span className="accent">Our Expertise</span>
            </h2>

            <p className="company-brief">
                Verified electricians, plumbers and home experts.
                Secure login via email.
            </p>

            <input
                className="input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button className="primaryBtn" onClick={sendMagicLink}>
                {loading ? "Sending..." : "Send Magic Link"}
            </button>

            {message && (
                <p style={{ marginTop: "12px", color: "#ffb4a2" }}>
                    {message}
                </p>
            )}

        </div>
    );
}
