import { useEffect, useState, useCallback } from "react";

export default function useLocation({ autoStart = false } = {}) {
  const [location, setLocation] = useState(() =>
    autoStart ? (navigator.geolocation ? "Detecting..." : "Location unavailable") : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return Promise.resolve("Location unavailable");
    }

    setIsLoading(true);
    setLocation("Detecting...");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await res.json();

            const nextLocation = data?.display_name ||
              data?.address?.suburb ||
              data?.address?.neighbourhood ||
              data?.address?.city ||
              data?.address?.town ||
              "Unknown location";

            setLocation(nextLocation);
            resolve(nextLocation);
          } catch {
            const fallbackLocation = "Unable to detect location";
            setLocation(fallbackLocation);
            resolve(fallbackLocation);
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          const deniedLocation = "Location permission denied";
          setLocation(deniedLocation);
          setIsLoading(false);
          resolve(deniedLocation);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    refreshLocation();
  }, [autoStart, refreshLocation]);

  return { location, isLoading, refreshLocation };
}
