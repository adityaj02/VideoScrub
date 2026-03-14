import { useState } from "react";
import { supabase } from "../lib/supabase";
import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

export default function Profile({ onComplete }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const saveProfile = async () => {
        const { data } = await supabase.auth.getUser();

        if (!data?.user) {
            alert("Not logged in. Please sign in again.");
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            if (apiUrl) {
                await fetch(apiUrl + "/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        supabaseId: data.user.id,
                        email: data.user.email,
                        name,
                        phone,
                    }),
                });
            }
        } catch (err) {
            console.warn("Profile API unavailable:", err.message);
        }

        localStorage.setItem(`profile_complete:${data.user.id}`, "true");
        localStorage.setItem(`profile_name:${data.user.id}`, name);
        onComplete?.();
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 50, padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            <VideoBackground theme="dark" currentView="profile" />
            <ThreeScene theme="dark" />
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: -10,
                pointerEvents: "none"
            }} />

            {/* Subtle background glow */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
            }} />

            <div style={{
                width: "100%", maxWidth: "420px", padding: "48px 40px", borderRadius: "28px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                display: "flex", flexDirection: "column", gap: "12px"
            }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Complete Profile</h2>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Almost there! Tell us who you are.</p>
                </div>

                <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: "100%", padding: "14px 16px", borderRadius: "14px",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                        color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
                        transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
                />

                <input
                    placeholder="Contact Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                        width: "100%", padding: "14px 16px", borderRadius: "14px",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                        color: "#fff", fontSize: "14px", outline: "none", fontFamily: "inherit",
                        transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
                />

                <button
                    onClick={saveProfile}
                    style={{
                        width: "100%", marginTop: "12px", padding: "14px", borderRadius: "14px",
                        background: "rgba(59,130,246,0.85)", border: "1px solid rgba(59,130,246,0.4)",
                        color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em",
                        cursor: "pointer", fontFamily: "inherit", transition: "background 0.25s, transform 0.15s",
                        backdropFilter: "blur(8px)",
                    }}
                    onMouseEnter={e => e.target.style.background = "rgba(59,130,246,1)"}
                    onMouseLeave={e => e.target.style.background = "rgba(59,130,246,0.85)"}
                    onMouseDown={e => e.target.style.transform = "scale(0.97)"}
                    onMouseUp={e => e.target.style.transform = "scale(1)"}
                >
                    Continue to Dashboard →
                </button>
            </div>
        </div>
    );
}
