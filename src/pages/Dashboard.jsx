import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "../lib/profile";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

import ServiceSlider from "../components/services/ServiceSlider";
import ServiceGrid from "../components/services/ServiceGrid";
import ServiceModal from "../components/services/ServiceModal";
import CartSummary from "../components/cart/CartSummary";
import { SERVICES as FALLBACK_SERVICES } from "../data/services";

import { BLOG_POSTS } from "../data/blogPosts";
import { TESTIMONIALS } from "../data/testimonials";

const SERVICE_IMAGES = {
  plumbing: "/Assets/plumber.png",
  electrician: "/Assets/electrician.png",
  electrical: "/Assets/electrician.png",
  "ac repair": "/Assets/ACservices.png",
  cleaning: "/Assets/services.png",
  "appliance repair": "/Assets/construction.png",
};

const DELHI_REGEX = /(delhi|new delhi)/i;

const isValidPhone = (value) => /^\d{10,15}$/.test(String(value || ""));
const idsEqual = (left, right) => String(left) === String(right);

export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [activeIdx, setActiveIdx] = useState(0);
  const [location, setLocation] = useState(() =>
    "geolocation" in navigator ? "Detecting..." : "Location unavailable"
  );
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [currentView, setCurrentView] = useState("home");
  const [selectedService, setSelectedService] = useState(null);
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState("");
  const [userInitials, setUserInitials] = useState("B");
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMetadata, setBookingMetadata] = useState(null);
  const contentRef = useRef(null);

  const isDelhiLocation = (value = "") => DELHI_REGEX.test(String(value));

  const normalizeService = (row) => {
    const key = String(row?.name || "").toLowerCase();
    return {
      id: row.service_id,
      service_id: row.service_id,
      title: row.name,
      name: row.name,
      desc:
        row.description ||
        "Professional doorstep service by verified experts.",
      description:
        row.description ||
        "Professional doorstep service by verified experts.",
      price: Number(row.price || 0),
      rating: "4.8",
      img: SERVICE_IMAGES[key] || "/Assets/services.png",
      subServices: [
        "Verified technician visit",
        "Transparent pricing",
        "Quality checks",
      ],
    };
  };

  const normalizeFallbackService = (row) => ({
    id: row.id,
    service_id: row.id,
    title: row.title,
    name: row.title,
    desc: row.desc,
    description: row.desc,
    price: Number(row.price || 0),
    rating: row.rating || "4.8",
    img: row.img || "/Assets/services.png",
    subServices:
      row.subServices ||
      ["Verified technician visit", "Transparent pricing", "Quality checks"],
  });

  const updateProfileLocation = useCallback(async (resolvedLocation) => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: user.email,
        location: resolvedLocation,
      },
      { onConflict: "user_id" }
    );

    if (!error) {
      setProfile((prev) => ({
        ...(prev || {}),
        userId: user.id,
        email: user.email,
        location: resolvedLocation,
      }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      if (!isMounted) return;
      setServicesLoading(true);
      setServicesError("");

      try {
        const { data, error } = await supabase
          .from("services")
          .select("service_id,name,description,price")
          .order("created_at", { ascending: true });

        if (!isMounted) return;

        if (error || !data?.length) {
          setServicesError(
            "Live services could not be loaded. Showing cached service catalog."
          );
          setServices(FALLBACK_SERVICES.map(normalizeFallbackService));
        } else {
          setServices(data.map(normalizeService));
        }
      } catch {
        if (!isMounted) return;
      const { data, error } = await supabase
        .from("services")
        .select("service_id,name,description,price")
        .order("created_at", { ascending: true });

      if (error || !data?.length) {
        setServicesError(
          "Live services could not be loaded. Showing cached service catalog."
        );
        setServices(FALLBACK_SERVICES.map(normalizeFallbackService));
      } else {
        setServices(data.map(normalizeService));
      }
      if (isMounted) setServicesLoading(false);
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      if (!isMounted) return;
      setBlogLoading(true);
      setBlogError("");
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id,title,category,excerpt,cover_image,read_time,published_at,slug")
          .order("published_at", { ascending: false })
          .limit(8);

        if (!isMounted) return;

        if (!error && data?.length) {
          setBlogPosts(
            data.map((row, idx) => ({
              id: row.id ?? idx + 1,
              cat: row.category || "Insights",
              readTime: row.read_time || "6 min read",
              date: row.published_at
                ? new Date(row.published_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Latest",
              title: row.title,
              view: row.slug ? `post-${row.slug}` : `post-${row.id ?? idx + 1}`,
              img: row.cover_image || "/Assets/services.png",
              excerpt: row.excerpt || "Read our latest service insights from Boys@Work.",
            }))
          );
        } else if (error) {
          setBlogError("Live blog feed is unavailable. Showing saved articles.");
        }
      } catch {
        if (!isMounted) return;
        setBlogError("Live blog feed is unavailable. Showing saved articles.");
      }
      if (isMounted) setBlogLoading(false);
    };

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const resolvedLocation =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.suburb ||
            data?.address?.state_district ||
            data?.address?.state ||
            "Unknown location";

          setLocation(resolvedLocation);
          await updateProfileLocation(resolvedLocation);
        } catch {
          setLocation("Unable to detect location");
        }
      },
      () => {
        setLocation("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateProfileLocation]);

  useEffect(() => {
    let isMounted = true;

    const loadUserInitials = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        if (isMounted) setProfileLoading(false);
        return;
      }
      if (isMounted) setUserId(user.id);

      let profileName = "";
      let profileData = null;
      try {
        profileData = await getUserProfile({ userId: user.id });
        profileName = profileData?.name || "";
      } catch {
        profileData = null;
      }

      if (!isMounted) return;
      setProfile(
        profileData || {
          userId: user.id,
          email: user.email,
          name: "",
          phone: "",
          location: "",
        }
      );
      setProfileLoading(false);

      const localName = localStorage.getItem(`profile_name:${user.id}`);
      const rawName =
        profileName ||
        localName ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email ||
        "B";
      const initials =
        rawName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("") || "B";

      if (isMounted) setUserInitials(initials);
      setUserInitials(initials);
    };

    loadUserInitials();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!services.length) return undefined;
    setActiveIdx((prev) => (prev >= services.length ? 0 : prev));

    const interval = setInterval(() => {
      if (currentView === "home" || currentView === "services") {
        setActiveIdx((prev) => (prev + 1) % services.length);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [currentView, services.length]);

  const toggleTheme = (e) => {
    e?.stopPropagation?.();
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      await supabase.auth.signOut();
      if (uid) {
        localStorage.removeItem(`profile_complete:${uid}`);
        localStorage.removeItem(`profile_name:${uid}`);
      }
    } finally {
      window.location.assign("/");
    }
  };

  const getServiceKey = (service) => service.service_id ?? service.id;

  const addToCart = (service) => {
    const itemKey = getServiceKey(service);
    setBookingSuccess(false);
    setCheckoutMessage("");
    setCartItems((prev) => {
      const existing = prev.find((item) => idsEqual(item.service_id, itemKey));
      if (existing) {
        return prev.map((item) =>
          idsEqual(item.service_id, itemKey)
      const existing = prev.find((item) => item.service_id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.service_id === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          service_id: itemKey,
          name: service.name,
          title: service.title,
          description: service.description,
          price: Number(service.price || 0),
          quantity: 1,
          img: service.img,
        },
      ];
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter((item) => !idsEqual(item.service_id, serviceId)));
    setCartItems((prev) => prev.filter((item) => item.service_id !== serviceId));
  };

  const updateQuantity = (serviceId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        idsEqual(item.service_id, serviceId)
        item.service_id === serviceId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const isInCart = (serviceId) => cartItems.some((item) => idsEqual(item.service_id, serviceId));
  const isInCart = (serviceId) =>
    cartItems.some((item) => String(item.service_id) === String(serviceId));

  const canCheckoutByLocation = isDelhiLocation(profile?.location || location);
  const locationWarning = !canCheckoutByLocation
    ? "Currently we only provide services in Delhi. You can still place a request, and our team will contact you if your area becomes serviceable."
    : "";

  const confirmBooking = async ({ date, time }) => {
    if (submittingBooking) return;
    if (!userId) {
      setCheckoutMessage("Session expired. Please login again.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutMessage("Please add at least one service to continue.");
      return;
    }
    if (!profile?.name || !profile?.phone || !profile?.location) {
      setCheckoutMessage(
        "Please complete your profile details (name, phone, location) before checkout."
      );
      return;
    }
    if (!isValidPhone(profile?.phone)) {
      setCheckoutMessage(
        "Please update your phone number to a valid format before checkout."
      );
      return;
    }
    if (!canCheckoutByLocation) {
      setCheckoutMessage(
        "Currently we only provide services in Delhi. You can browse services but checkout is unavailable for your location."
      );
      return;
    }
    if (hasNonBookableItems) {
      setCheckoutMessage(
        "Some fallback services are currently view-only. Please try again when live catalog sync is available."
      );
      return;
    }

    setSubmittingBooking(true);
    setCheckoutMessage("");
    setBookingSuccess(false);

    const rows = cartItems.flatMap((item) =>
      Array.from({ length: item.quantity }).map(() => ({
        user_id: userId,
        service_id: item.service_id,
        status: "pending",
      }))
    );

    if (rows.some((row) => !row.service_id)) {
      setCheckoutMessage("Some services are not ready for checkout yet. Please refresh and try again.");
      setSubmittingBooking(false);
      return;
    }

    const { error } = await supabase.from("orders").insert(rows);

    if (error) {
      setCheckoutMessage("Unable to place booking right now. Please try again.");
      setSubmittingBooking(false);
      return;
    }

    setBookingMetadata({ date, time, cart_items: cartItems });
    setCartItems([]);
    setBookingSuccess(true);
    setSubmittingBooking(false);
  };

  const switchView = useCallback((view, options = {}) => {
    const behavior = options.smooth === false ? "auto" : "smooth";
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior });
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior });
    }
  }, []);

  const canCheckout =
    canCheckoutByLocation &&
    !!profile?.name &&
    !!profile?.phone &&
    !!profile?.location &&
    isValidPhone(profile?.phone) &&
    !profileLoading;
  const hasNonBookableItems = cartItems.some(
    (item) => item.service_id == null || Number.isNaN(Number(item.service_id))
  );

  const colors = {
    bg: theme === "dark" ? "bg-[#03060d]" : "bg-[#f5f5f7]",
    text: theme === "dark" ? "text-white" : "text-[#1d1d1f]",
    subtext: theme === "dark" ? "text-white/40" : "text-[#6e6e73]",
    glass:
      theme === "dark"
        ? "bg-white/[0.10] border-white/20 shadow-2xl shadow-black/30"
        : "bg-white/85 border-black/10 shadow-lg",
    cardText: theme === "dark" ? "text-white/60" : "text-[#1d1d1f]/80",
  };

  const activePost = blogPosts.find((post) => post.view === currentView);

  return (
    <>
      <style>{`
        .glass { backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .premium-text {
          background: ${theme === "dark" ? "linear-gradient(180deg, #ffffff 0%, #9ea7bd 100%)" : "none"};
          color: ${theme === "dark" ? "#ffffff" : "#111113"};
          -webkit-background-clip: ${theme === "dark" ? "text" : "border-box"};
          -webkit-text-fill-color: ${theme === "dark" ? "transparent" : "currentColor"};
          text-shadow: ${theme === "dark" ? "0 6px 20px rgba(0, 82, 255, 0.2)" : "none"};
          letter-spacing: -0.02em;
        }
        .service-card-active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); animation: cardPop 700ms cubic-bezier(0.16, 1, 0.3, 1); }
        .service-card-hidden { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(20px); pointer-events: none; }
        @keyframes cardPop { 0% { transform: translateY(18px) scale(0.96); opacity: 0.2; } 70% { transform: translateY(-4px) scale(1.01); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .reflect-card { position: relative; overflow: hidden; border-width: 1px; }
        .reflect-card::after { content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, ${theme === "dark" ? "0.06" : "0.15"}) 50%, rgba(255, 255, 255, 0) 60%); transform: rotate(-45deg); animation: glint 10s infinite linear; pointer-events: none; }
        @keyframes glint { 0% { transform: translate(-30%, -30%) rotate(-45deg); } 12% { transform: translate(30%, 30%) rotate(-45deg); } 100% { transform: translate(30%, 30%) rotate(-45deg); } }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.16); border-radius: 10px; }
      `}</style>

      <VideoBackground theme={theme} blur={12} brightness={theme === "dark" ? 0.68 : 0.9} opacity={0.98} />
      <ThreeScene theme={theme} />

      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: theme === "dark" ? "rgba(0,0,0,0.36)" : "rgba(255,255,255,0.18)",
          zIndex: -10,
          pointerEvents: "none",
        }}
      />

      <div className={`relative z-40 h-screen overflow-hidden flex flex-row ${colors.bg}`}>
        <Sidebar
          currentView={currentView}
          setCurrentView={switchView}
          cartItems={cartItems}
          theme={theme}
          onLogout={handleLogout}
        />

        <div ref={contentRef} className="flex-1 h-screen overflow-y-auto relative bg-transparent ml-20 lg:ml-64 custom-scroll">
          <Navbar
            location={location}
            toggleTheme={toggleTheme}
            theme={theme}
            setCurrentView={switchView}
            userInitials={userInitials}
          />

          {currentView === "home" && (
            <>
              <section className="px-6 lg:px-24 pt-10 pb-2">
                <div className={`glass p-6 lg:p-8 rounded-[32px] border ${colors.glass}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <p className={`text-[11px] uppercase tracking-[0.35em] font-black ${colors.subtext}`}>Profile Overview</p>
                      <h3 className="text-3xl font-black premium-text mt-3">{profile?.name || "Complete your profile"}</h3>
                      <p className={`mt-2 text-sm ${colors.cardText}`}>Phone: {profile?.phone || "Pending"} · Location: {profile?.location || location}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => switchView("services")} className="px-6 py-3 rounded-full bg-blue-600 text-white text-[11px] uppercase font-black tracking-widest">Browse Services</button>
                      <button onClick={() => switchView("cart")} className="px-6 py-3 rounded-full border border-white/20 text-[11px] uppercase font-black tracking-widest">Cart ({cartItems.length})</button>
                    </div>
                  </div>
                </div>
              </section>

              {servicesLoading ? (
                <div className="px-6 lg:px-24 pt-8 pb-6"><div className={`glass p-8 rounded-[28px] border ${colors.glass}`}>Loading services...</div></div>
              ) : (
                <>
                  {!!servicesError && <div className="px-6 lg:px-24 pt-6"><div className="rounded-[20px] border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200">{servicesError}</div></div>}
                  <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} />
                  <ServiceGrid SERVICES={services} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} />
                </>
              )}

              <section className="px-6 lg:px-24 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "🛡️", title: "Verified Pros", desc: "Background checked service experts." },
                    { icon: "⚡", title: "Fast Response", desc: "Quick dispatch across Delhi NCR." },
                    { icon: "💳", title: "Transparent Pricing", desc: "No hidden fees. Clear breakdowns." },
                    { icon: "📞", title: "Always Available", desc: "Dedicated support for every booking." },
                  ].map((item) => (
                    <div key={item.title} className={`glass rounded-[28px] border p-6 ${colors.glass}`}>
                      <div className="text-3xl">{item.icon}</div>
                      <h4 className={`mt-3 text-lg font-black ${colors.text}`}>{item.title}</h4>
                      <p className={`mt-2 text-sm ${colors.cardText}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="px-6 lg:px-24 py-12">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <h2 className="text-4xl lg:text-6xl font-black premium-text">From Our Blog</h2>
                  <button onClick={() => switchView("blog")} className="px-6 py-3 rounded-full border border-white/20 text-[11px] uppercase tracking-widest font-black">View All</button>
                </div>
                {blogLoading ? (
                  <div className={`glass rounded-[28px] border p-6 ${colors.glass}`}>Loading latest posts...</div>
                ) : (
                  <>
                    {!!blogError && <div className="mb-5 rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 text-sm">{blogError}</div>}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {blogPosts.slice(0, 2).map((post) => (
                        <button key={post.id} onClick={() => switchView(post.view)} className={`glass text-left rounded-[32px] border p-7 ${colors.glass}`}>
                          <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>{post.cat} · {post.date}</p>
                          <h3 className="mt-3 text-2xl font-black premium-text">{post.title}</h3>
                          <p className={`mt-3 text-sm ${colors.cardText}`}>{post.excerpt}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="px-6 lg:px-24 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TESTIMONIALS.slice(0, 3).map((item) => (
                    <div key={item.name} className={`glass rounded-[28px] border p-6 ${colors.glass}`}>
                      <p className={`text-sm italic ${colors.cardText}`}>"{item.quote}"</p>
                      <p className={`mt-4 text-xs uppercase tracking-widest ${colors.subtext}`}>{item.name} · {item.loc}</p>
                    </div>
                  ))}
                </div>
              </section>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={() => switchView("services")} className="px-6 py-3 rounded-full bg-blue-600 text-white text-[11px] uppercase font-black tracking-widest">Browse Services</button>
                      <button onClick={() => switchView("cart")} className="px-6 py-3 rounded-full border border-white/20 text-[11px] uppercase font-black tracking-widest">Cart ({cartItems.length})</button>
                    </div>
                  </div>
                </div>
              </section>

              {servicesLoading ? (
                <div className="px-6 lg:px-24 pt-8 pb-6"><div className={`glass p-8 rounded-[28px] border ${colors.glass}`}>Loading services...</div></div>
              ) : (
                <>
                  {!!servicesError && <div className="px-6 lg:px-24 pt-6"><div className="rounded-[20px] border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200">{servicesError}</div></div>}
                  <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} />
                  <ServiceGrid SERVICES={services} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} />
                </>
              )}
            </>
          )}

          {currentView === "services" && (
            <section className="px-6 lg:px-24 py-20 relative z-20 animate-in fade-in zoom-in-95 duration-500 text-left">
              <div className="max-w-7xl mx-auto mb-10 text-left">
                <span className={`text-[10px] md:text-[12px] uppercase tracking-[0.6em] ${colors.subtext} font-bold block mb-4`}>Repository</span>
                <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-4">Services</h2>
              </div>
              <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} />
              <div className="pt-10">
                <ServiceGrid SERVICES={services} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} />
              </div>
              <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} />
            </section>
          )}

          {currentView === "blog" && (
            <section className="py-12 px-6 lg:px-24">
              <h1 className="text-6xl font-black premium-text mb-10">Our Blog</h1>
              {!!blogError && <div className="mb-6 rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 text-sm">{blogError}</div>}
              <div className="space-y-8">
                {blogPosts.map((post) => (
              <div className="space-y-8">
                {BLOG_POSTS.map((post) => (
                  <div key={post.id} onClick={() => switchView(post.view)} className={`glass rounded-[32px] border ${colors.glass} p-8 cursor-pointer`}>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>{post.cat} · {post.date}</p>
                    <h3 className="mt-3 text-3xl font-black premium-text">{post.title}</h3>
                    <p className={`mt-3 ${colors.cardText}`}>{post.excerpt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activePost && (
            <section className="py-12 px-6 lg:px-24">
              <button onClick={() => switchView("blog")} className="text-xs uppercase tracking-widest mb-6 opacity-70">← Back to Blog</button>
              <div className={`glass rounded-[32px] border ${colors.glass} p-8 lg:p-12`}>
                <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>{activePost.cat || "Article"}</p>
                <h2 className="mt-4 text-4xl lg:text-6xl font-black premium-text">{activePost.title}</h2>
                <p className={`mt-6 text-lg ${colors.cardText}`}>{activePost.excerpt}</p>
              </div>
          {["plumbing-post", "deep-cleaning-post", "monsoon-post", "ac-post"].includes(currentView) && (
            <section className="py-12 px-6 lg:px-24">
              <button onClick={() => switchView("blog")} className="text-xs uppercase tracking-widest mb-6 opacity-70">← Back to Blog</button>
              {(() => {
                const post = BLOG_POSTS.find((p) => p.view === currentView);
                return (
                  <div className={`glass rounded-[32px] border ${colors.glass} p-8 lg:p-12`}>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>{post?.cat || "Article"}</p>
                    <h2 className="mt-4 text-4xl lg:text-6xl font-black premium-text">{post?.title}</h2>
                    <p className={`mt-6 text-lg ${colors.cardText}`}>{post?.excerpt}</p>
                  </div>
                );
              })()}
            </section>
          )}

          {currentView === "cart" && (
            <CartSummary
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              theme={theme}
              setCurrentView={switchView}
              onConfirmBooking={confirmBooking}
              isCheckoutAvailable={canCheckout && !hasNonBookableItems}
              checkoutMessage={
                checkoutMessage ||
                (hasNonBookableItems
                  ? "Some fallback services are currently view-only. Please try again when live catalog sync is available."
                  : (!canCheckoutByLocation
                    ? "Currently we only provide services in Delhi. You can browse services but checkout is unavailable for your location."
                    : ""))
              }
              isCheckoutAvailable={canCheckout}
              checkoutMessage={checkoutMessage || (!canCheckoutByLocation ? "Currently we only provide services in Delhi. You can browse services but checkout is unavailable for your location." : "")}
              locationWarning={locationWarning}
              submitting={submittingBooking}
              bookingSuccess={bookingSuccess}
              bookingMetadata={bookingMetadata}
            />
          )}

          <footer id="footer-main" className={`glass p-12 lg:p-20 m-6 lg:mx-24 rounded-[56px] border ${colors.glass} relative z-20 mt-20 text-left shadow-2xl`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              <div>
                <div className="text-3xl font-black premium-text">Boysatwork.in</div>
                <p className={`text-sm leading-relaxed mt-5 ${colors.cardText}`}>Trusted partner for home services in Delhi NCR.</p>
              </div>
              <div>
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text}`}>Our Services</h4>
                <ul className={`space-y-3 text-sm mt-4 ${colors.cardText}`}>
                  {services.slice(0, 5).map((s) => (
                    <li key={s.id} onClick={() => switchView("services")} className="hover:text-blue-500 transition-colors cursor-pointer">{s.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text}`}>Quick Navigation</h4>
                <ul className={`space-y-3 text-sm mt-4 ${colors.cardText}`}>
                  <li className="cursor-pointer" onClick={() => switchView("home")}>Home</li>
                  <li className="cursor-pointer" onClick={() => switchView("services")}>Services</li>
                  <li className="cursor-pointer" onClick={() => switchView("blog")}>Blog</li>
                </ul>
              </div>
              <div>
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text}`}>Contact Hub</h4>
                <div className={`space-y-4 text-sm mt-4 ${colors.cardText}`}>
                  <div className="flex gap-3">📍<span>9 Guru Nanak Market, New Delhi - 110024</span></div>
                  <div className="flex gap-3">📞<span>+91 9811797407</span></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <ServiceModal
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        addToCart={addToCart}
        isInCart={isInCart}
        theme={theme}
      />
    </>
  );
}
