import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 🌌 Three.js Premium Light Layer
 */
export default function ThreeScene({ theme }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const pointLight = new THREE.PointLight(theme === 'dark' ? 0xffffff : 0x000000, 1.2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    camera.position.z = 5;
    const animate = () => {
      const time = Date.now() * 0.0008;
      pointLight.position.x = Math.sin(time) * 5;
      pointLight.position.y = Math.cos(time * 0.5) * 5;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
    return () => renderer.dispose();
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        pointerEvents: "none",
        opacity: 0.2
      }} 
    />
  );
}
