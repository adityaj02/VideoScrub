import { useEffect, useState, useCallback } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(() => (navigator.geolocation ? "Detecting..." : "Location unavailable"));
  const [isLoading, setIsLoading] = useState(false);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }

    setIsLoading(true);
    setLocation("Detecting...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Using a more detailed zoom level and requesting full display name
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();

          if (data && data.display_name) {
             // Clean up the display name a bit (remove country/postcode if too long, or just keep it)
             // Usually display_name is very comprehensive.
             setLocation(data.display_name);
          } else {
            setLocation(
              data?.address?.suburb ||
              data?.address?.neighbourhood ||
              data?.address?.city ||
              data?.address?.town ||
              "Unknown location"
            );
          }
        } catch {
          setLocation("Unable to detect location");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setLocation("Location permission denied");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { location, isLoading, refreshLocation };
}
