import { useState, useEffect } from "react";
import "../styles/global.css";
import VideoBackground from "../components/background/VideoBackground";
import Login from "./Login";

export default function Landing() {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=title, 2=subtitle, 3=button
  const [openLogin, setOpenLogin] = useState(false);

  useEffect(() => {
        // Staggered entrance animation
        const t1 = setTimeout(() => setPhase(1), 300);
        const t2 = setTimeout(() => setPhase(2), 900);
        const t3 = setTimeout(() => setPhase(3), 1400);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);



    return (
        <div className="hero">

            {/* ── Background Video is rendered here for unauthenticated state ── */}
            <VideoBackground theme="dark" currentView={openLogin ? "login" : "landing"} />

            {/* ── Layered dark overlays for depth ── */}
            <div className="hero-overlay-base" />
            <div className="hero-overlay-vignette" />

            {/* ── Hero Content ── */}
            <div className="hero-content">

                {/* Badge */}
                <div className={`hero-badge ${phase >= 1 ? "hero-item-in" : "hero-item-out-up"}`}>
                    <span className="hero-badge-dot" />
                    Est. 2024 · Delhi NCR
                </div>

                {/* Main Title */}
                <h1 className={`hero-title ${phase >= 1 ? "hero-item-in" : "hero-item-out-up"}`}>
                    Boys@Work
                </h1>

                {/* Subtitle */}
                <p className={`hero-subtitle ${phase >= 2 ? "hero-item-in" : "hero-item-out-up"}`}>
                    Premium Home Services · Verified Experts
                </p>

                {/* Divider line */}
                <div className={`hero-line ${phase >= 2 ? "hero-item-in" : "hero-item-out-up"}`} />

        {/* CTA Button */}
        <button
          onClick={() => setOpenLogin(true)}
          className={`hero-btn hero-get-started-btn ${phase >= 3 ? "hero-item-in" : "hero-item-out-up"}`}
        >
          <video className="hero-get-started-video" src="/Assets/Loginvideo.mp4" autoPlay muted loop playsInline />
          <span>Get Started</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>


                {/* Scroll hint */}
                <div className={`hero-scroll-hint ${phase >= 3 ? "hero-item-in" : "hero-item-out-up"}`}>
                    <div className="hero-scroll-line" />
                    <span>Scroll to explore</span>
                </div>

            </div>
            {openLogin && <Login close={() => setOpenLogin(false)} />}
        </div>
    );
}

