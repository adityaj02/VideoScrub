import { useEffect, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(() =>
    navigator.geolocation ? "Detecting..." : "Delhi Hub"
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const data = await res.json();

        setLocation(data.address.city || "Delhi NCR");
      } catch {
        setLocation("Delhi NCR");
      }
    });
  }, []);

  return location;
}
