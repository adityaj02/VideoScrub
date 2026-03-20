import { useEffect, useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(() => (navigator.geolocation ? "Detecting..." : "Location unavailable"));

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          setLocation(
            data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.suburb ||
              data?.address?.state_district ||
              data?.address?.state ||
              "Unknown location"
          );
        } catch {
          setLocation("Unable to detect location");
        }
      },
      () => setLocation("Location permission denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return location;
}
