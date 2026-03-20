import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─── Global Styles ─────────────────────────────────────────────────── */
const globalCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* FIX 4 — prevent layout recalculation on mobile */
  html, body, #root {
    height: 100%;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 0px; }

  /* FIX 3 — no backdrop-filter on mobile (kills FPS) */
  .glass {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  }
  @media (min-width: 768px) {
    .glass {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
  }

  .premium-text {
    background: linear-gradient(180deg, #ffffff 0%, #888888 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.05em;
  }

  .fade-in-up {
    transform: translateY(0);
    opacity: 1;
    transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease;
  }

  .fade-hidden-up {
    transform: translateY(40px);
    opacity: 0;
    transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease;
  }

  .fade-hidden-down {
    transform: translateY(-40px);
    opacity: 0;
    transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease;
  }

  .enter-btn {
    cursor: pointer;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }
  .enter-btn:hover {
    background: rgba(255,255,255,0.10) !important;
    transform: scale(1.05);
  }
  .enter-btn:active {
    transform: scale(0.95);
  }
  .enter-btn .shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: translateX(-100%);
    transition: transform 1s ease;
  }
  .enter-btn:hover .shine {
    transform: translateX(100%);
  }
`;

/* ─── VideoBg — FIX 1: GPU-composited autoplay background ───────────── */
const VideoBg = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.playsInline = true;

    // Attempt to play immediately (and retry on first touch for mobile)
    const playVideo = () => { v.play().catch(() => { }); };
    playVideo();
    document.addEventListener("touchstart", playVideo, { once: true });
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      disablePictureInPicture
      style={{
        position: "fixed",
        inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        zIndex: 0,
        pointerEvents: "none",
        /* FIX 1 — force GPU compositing layer, prevents repaint thrashing */
        transform: "translate3d(0,0,0)",
        WebkitTransform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform",
        filter: "brightness(0.4) contrast(1.2)",
      }}
    >
      <source src="/Assets/loginvideo.mp4" type="video/mp4" />
    </video>
  );
};

/* ─── ThreeScene ─────────────────────────────────────────────────────── */
const ThreeScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    /* FIX 2 — cap Three.js to ~30fps to halve GPU load */
    let rafId;
    let last = 0;
    const animate = (time) => {
      rafId = requestAnimationFrame(animate);
      if (time - last < 33) return; // skip frames above ~30fps
      last = time;
      const t = time * 0.0008;
      pointLight.position.x = Math.sin(t) * 4;
      pointLight.position.y = Math.cos(t * 0.5) * 4;
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 10, pointerEvents: "none",
      }}
    />
  );
};

/* ─── App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{globalCSS}</style>

      {/* Single-viewport container — no scroll needed */}
      <div style={{ position: "relative", height: "100vh", background: "#0b0b0c", overflow: "hidden" }}>

        {/* Smooth autoplay video background */}
        <VideoBg />

        {/* Three.js ambient light layer */}
        <ThreeScene />

        {/* UI layer */}
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "space-between",
          padding: "6rem 0",
          zIndex: 20, pointerEvents: "none",
        }}>

          {/* Top Branding */}
          <div
            className={`text-center ${isVisible ? "fade-in-up" : "fade-hidden-down"}`}
            style={{ textAlign: "center" }}
          >
            <h1
              className="premium-text"
              style={{ fontSize: "clamp(2.2rem, 12vw, 7rem)", fontWeight: 700, textTransform: "uppercase" }} /* FIX 5 — mobile-safe clamp */
            >
              Boys@Work
            </h1>
            <p style={{
              fontSize: "10px", textTransform: "uppercase",
              letterSpacing: "0.8em", color: "rgba(255,255,255,0.3)",
              marginTop: "1.5rem", fontWeight: 500,
            }}>
              Premium Services • EST 2024
            </p>
          </div>

          {/* Subtle vertical line divider */}
          <div
            className={isVisible ? "fade-in-up" : "fade-hidden-up"}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "1rem",
              opacity: isVisible ? 0.3 : 0,
              transition: "opacity 1s ease 0.7s",
            }}
          >
            <div style={{
              width: "1px", height: "4rem",
              background: "linear-gradient(to bottom, white, rgba(255,255,255,0.2), transparent)",
            }} />
          </div>

          {/* Login Button */}
          <div style={{ pointerEvents: "auto" }}>
            <button
              className={`glass enter-btn ${isVisible ? "fade-in-up" : "fade-hidden-up"}`}
              style={{
                padding: "1.25rem 3.5rem",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "white",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.7s ease",
                transitionDelay: "300ms",
              }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>Login</span>
              <div className="shine" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}