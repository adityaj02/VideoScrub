import { useEffect, useRef } from "react";

export default function VideoBackground({ theme, blur = 0, brightness, opacity = 1 }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = "/Assets/Loginvideo.mp4";

    video.load();
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      loop
      playsInline
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
        pointerEvents: "none",
        filter: `blur(${blur}px) brightness(${brightness ?? (theme === "dark" ? 0.7 : 0.9)})`,
        transform: "scale(1.05)",
        opacity,
        transition: "filter 0.5s ease"
      }}
    />
  );
}
