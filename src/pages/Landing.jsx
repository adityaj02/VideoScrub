import { useState, useEffect } from "react";
import "../styles/global.css";
import VideoBackground from "../components/background/VideoBackground";
import Login from "./Login";

export default function Landing({ initialLoginOpen = false }) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=title, 2=subtitle, 3=content
  const [openLogin, setOpenLogin] = useState(initialLoginOpen);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Staggered entrance animation
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 60;
      const moveY = (clientY - window.innerHeight / 2) / 60;
      setMousePos({ x: moveX, y: moveY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setOpenLogin(initialLoginOpen);
  }, [initialLoginOpen]);

  return (
    <div className="hero parallax-container" style={{ overflow: "hidden", position: "relative" }}>
      {/* ── Background with Parallax ── */}
      <div 
        className="parallax-bg" 
        style={{ 
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(1.1)`,
          position: "absolute",
          inset: 0,
          zIndex: -1
        }}
      >
        <VideoBackground theme="dark" blur={openLogin ? 20 : 4} brightness={0.55} />
      </div>

      {/* ── Premium Overlays ── */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 0 }} />
      <div className="hero-overlay-vignette" style={{ zIndex: 1 }} />

      {/* ── Hero Content ── */}
      <div className="hero-content" style={{ gap: "10px", zIndex: 10, textAlign: "center", alignItems: "center" }}>
        {/* Trust Badge */}
        <div 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 ${phase >= 1 ? "hero-item-in" : "hero-item-out-up"}`}
            style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Est. 2021 · Delhi NCR · 4,000+ bookings 👨‍👩‍👧‍👦
        </div>

        {/* Main Title */}
        <h1 
          className={`premium-hero-title ${phase >= 1 ? "hero-item-in" : "hero-item-out-up"}`}
          style={{ 
            fontSize: "clamp(60px, 14vw, 180px)", 
            letterSpacing: "-0.06em",
            marginBottom: "10px",
            textTransform: "uppercase"
          }}
        >
          HOUSERVE
        </h1>

        <p 
            className={`hero-subtitle ${phase >= 2 ? "hero-item-in" : "hero-item-out-up"}`} 
            style={{ marginBottom: "50px", opacity: 0.6, fontSize: "14px", fontWeight: 700, letterSpacing: "0.3em" }}
        >
          Premium Home Services • Verified Experts
        </p>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row items-center gap-6 ${phase >= 3 ? "hero-item-in" : "hero-item-out-up"}`}>
            <button 
              onClick={() => setOpenLogin(true)} 
              className="glass-btn-premium px-12 py-5 text-[14px] font-black tracking-[0.2em] uppercase text-white min-w-[240px]"
            >
                Get started →
            </button>
            <button 
                className="wa-outline-btn px-10 py-5 text-[13px] font-bold tracking-widest uppercase min-w-[200px]"
                onClick={() => window.open("https://wa.me/919811797407", "_blank", "noopener,noreferrer")}
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5" />
                Whatsapp us
            </button>
        </div>

      </div>

      {openLogin && <Login close={() => setOpenLogin(false)} />}
    </div>
  );
}
