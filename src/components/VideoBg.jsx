import { useEffect, useRef } from "react";

export default function VideoBg({ blur = false }) {
    const ref = useRef(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        const tryPlay = () => video.play().catch(() => {});
        tryPlay();
        document.addEventListener("touchstart", tryPlay, { once: true });
    }, []);

    return (
        <video
            ref={ref}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                /* contain on landing so full video is visible; cover+zoom on login */
                objectFit: blur ? "cover" : "contain",
                objectPosition: "center",
                zIndex: 0,
                transform: blur ? "translate3d(0,0,0) scale(1.1)" : "translate3d(0,0,0)",
                willChange: "transform",
                backfaceVisibility: "hidden",
                filter: blur
                    ? "brightness(0.5) contrast(1.1) blur(12px)"
                    : "brightness(0.85) contrast(1.05)",
            }}
        >
            <source src="/Assets/Loginvideo.mp4" type="video/mp4" />
        </video>
    );
}



