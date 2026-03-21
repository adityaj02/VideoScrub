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

const isValidPhone = (value) => /^\d{10,15}$/.test(String(value || ""));
const idsEqual = (left, right) => String(left) === String(right);
const formatPhoneForDisplay = (value = "") => {
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "Pending";
  if (clean.length === 10) return `+91 ${clean}`;
  return `+${clean}`;
};

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

    const fetchServices = async () => {
      if (!isMounted) return;
      try {
        const { data, error } = await supabase
          .from("services")
          .select("service_id,name,description,price")
          .order("created_at", { ascending: true });

        if (!isMounted) return;

        if (error || !data?.length) {
          setServicesError("Live services could not be loaded. Showing cached service catalog.");
          setServices(FALLBACK_SERVICES.map(normalizeFallbackService));
        } else {
          setServicesError("");
          setServices(data.map(normalizeService));
        }
      } catch {
        if (!isMounted) return;
        setServicesError("Live services could not be loaded. Showing cached service catalog.");
        setServices(FALLBACK_SERVICES.map(normalizeFallbackService));
      }
      if (isMounted) setServicesLoading(false);
    };

    setServicesLoading(true);
    fetchServices();

    // ── Real-time: re-fetch whenever any row in `services` changes (price, name, etc.)
    const channel = supabase
      .channel("services-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => { if (isMounted) fetchServices(); }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
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
              slug: row.slug || `post-${row.id ?? idx + 1}` ,
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
  };

  const updateQuantity = (serviceId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        idsEqual(item.service_id, serviceId)
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const isInCart = (serviceId) => cartItems.some((item) => idsEqual(item.service_id, serviceId));

  const confirmBooking = async ({ date, time, address }) => {
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


    setSubmittingBooking(true);
    setCheckoutMessage("");
    setBookingSuccess(false);

    const rows = cartItems.flatMap((item) =>
      Array.from({ length: item.quantity }).map(() => ({
        user_id: userId,
        service_id: item.service_id,
        service_name: item.name || item.title || "",
        status: "pending",
        scheduled_date: date || null,
        scheduled_time: time || null,
        address: address || null,
      }))
    );

    const { error } = await supabase.from("orders").insert(rows);

    if (error) {
      setCheckoutMessage("Unable to place booking right now. Please try again.");
      setSubmittingBooking(false);
      return;
    }

    // Trigger WhatsApp notification via Supabase Edge Functions
    const serviceNames = cartItems.map((item) => item.name || item.title).join(", ");
    try {
      // Loop over items to send summary, or just send the first service name.
      await supabase.functions.invoke("send-whatsapp", {
        body: {
          name: profile?.name,
          phone: profile?.phone, // The edge function will handle prefixing format
          email: profile?.email || "N/A",
          service: serviceNames,
          location: address || profile?.location,
          date: date || "Flexible",
          time: time || "Flexible",
        },
      });
    } catch (err) {
      console.error("Failed to trigger WhatsApp notification:", err);
      // We don't block the UI if WhatsApp fails, booking is already inserted.
    }

    // Trigger Email notification via Resend (send-email edge function)
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          name: profile?.name,
          email: profile?.email,
          phone: profile?.phone,
          service: serviceNames,
          location: address || profile?.location,
          date: date || "Flexible",
          time: time || "Flexible",
        },
      });
    } catch (err) {
      console.error("Failed to trigger email notification:", err);
      // We don't block the UI if email fails, booking is already inserted.
    }

    setBookingMetadata({ date, time, address, cart_items: cartItems });
    setCartItems([]);
    setBookingSuccess(true);
    setSubmittingBooking(false);
  };

  const switchView = useCallback((view, options = {}) => {
    const behavior = options.smooth === false ? "auto" : "smooth";
    setCurrentView(view);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior });
      return;
    }
    window.scrollTo({ top: 0, behavior });
  }, []);

  const canCheckout =
    !!profile?.name &&
    !!profile?.phone &&
    !!profile?.location &&
    isValidPhone(profile?.phone) &&
    !profileLoading;
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
        html, body { scroll-behavior: smooth; }
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

        <div ref={contentRef} className="flex-1 h-screen overflow-y-auto relative bg-transparent ml-20 lg:ml-64 custom-scroll scroll-smooth [scroll-behavior:smooth]">
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
                  {!!servicesError && (
                    <div className="px-6 lg:px-24 pt-8 pb-0">
                      <div className={`rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                        {servicesError}
                      </div>
                    </div>
                  )}
                  <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} onViewSummary={() => switchView("cart")} />
                  <ServiceGrid SERVICES={services} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} onViewSummary={() => switchView("cart")} />
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
                  <button onClick={() => switchView("blog")} className={`px-6 py-3 rounded-full border ${theme === 'dark' ? 'border-white/20' : 'border-black/20'} text-[11px] uppercase tracking-widest font-black ${colors.text}`}>View All</button>
                </div>
                {blogLoading ? (
                  <div className={`glass rounded-[28px] border p-6 ${colors.glass}`}>Loading latest posts...</div>
                ) : (
                  <>
                    {!!blogError && <div className={`mb-5 rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>{blogError}</div>}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {blogPosts.slice(0, 2).map((post) => (
                        <button key={post.id} onClick={() => switchView(post.view)} className={`glass text-left rounded-[32px] border p-7 ${colors.glass}`}>
                          <img src={post.img} alt={post.title} className="w-full h-44 object-cover rounded-[20px] mb-5" />
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
            </>
          )}

          {currentView === "services" && (
            <section className="px-6 lg:px-24 py-20 relative z-20 animate-in fade-in zoom-in-95 duration-500 text-left">
              <div className="max-w-7xl mx-auto mb-10 text-left">
                <span className={`text-[10px] md:text-[12px] uppercase tracking-[0.6em] ${colors.subtext} font-bold block mb-4`}>Repository</span>
                <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-4">Services</h2>
              </div>
              {!!servicesError && (
                <div className={`mb-6 rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                  {servicesError}
                </div>
              )}
              <ServiceSlider SERVICES={services} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} onViewSummary={() => switchView("cart")} />
              <div className="pt-10">
                <ServiceGrid SERVICES={services} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} onViewSummary={() => switchView("cart")} />
              </div>
            </section>
          )}

          {currentView === "blog" && (
            <section className="py-12 px-6 lg:px-24">
              <h1 className="text-6xl font-black premium-text mb-10">Our Blog</h1>
              {!!blogError && <div className={`mb-6 rounded-[18px] border border-amber-500/40 bg-amber-500/10 p-4 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>{blogError}</div>}
              <div className="space-y-8">
                {blogPosts.map((post) => (
                  <div key={post.id} onClick={() => switchView(post.view)} className={`glass rounded-[32px] border ${colors.glass} p-8 cursor-pointer`}>
                    <img src={post.img} alt={post.title} className="w-full h-56 object-cover rounded-[20px] mb-5" />
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
              <button onClick={() => switchView("blog")} className={`text-xs uppercase tracking-widest mb-6 opacity-70 ${colors.text}`}>← Back to Blog</button>
              <div className={`glass rounded-[32px] border ${colors.glass} p-8 lg:p-12`}>
                <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>{activePost.cat || "Article"}</p>
                <h2 className="mt-4 text-4xl lg:text-6xl font-black premium-text">{activePost.title}</h2>
                <img src={activePost.img} alt={activePost.title} className="mt-8 w-full max-h-[440px] object-cover rounded-[24px]" />
                <p className={`mt-6 text-lg ${colors.cardText}`}>{activePost.excerpt}</p>
                {!!activePost.content?.length && (
                  <div className={`mt-7 space-y-4 text-base leading-relaxed ${colors.cardText}`}>
                    {activePost.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
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
              isCheckoutAvailable={canCheckout}
              checkoutMessage={checkoutMessage}
              submitting={submittingBooking}
              bookingSuccess={bookingSuccess}
              bookingMetadata={bookingMetadata}
            />
          )}

          {currentView === "about" && (
            <section id="about-experience" className="px-6 lg:px-24 py-14 lg:py-20">
              <div className={`glass rounded-[36px] border p-8 lg:p-12 ${colors.glass}`}>
                <p className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext}`}>About Boys@Work</p>
                <h2 className="mt-4 text-4xl lg:text-6xl font-black premium-text">Reliable help for every home.</h2>
                <p className={`mt-6 text-base lg:text-lg leading-relaxed ${colors.cardText}`}>
                  We connect families and businesses with verified experts for essential services across Delhi NCR.
                  Our focus is simple: transparent pricing, punctual visits, and quality-first execution.
                </p>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Verified Workforce", detail: "Experienced professionals with quality checks on every booking." },
                    { title: "Transparent Process", detail: "Clear service details, expected timelines, and fair pricing." },
                    { title: "Customer First", detail: "Fast support and proactive updates from booking to completion." },
                  ].map((item) => (
                    <div key={item.title} className={`rounded-[20px] border p-5 ${theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                      <h3 className={`text-lg font-black ${colors.text}`}>{item.title}</h3>
                      <p className={`mt-3 text-sm ${colors.cardText}`}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {currentView === "contact" && (
            <section className="px-6 lg:px-24 py-14 lg:py-20">
              <div className={`glass rounded-[36px] border p-8 lg:p-12 ${colors.glass}`}>
                <p className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext}`}>Contact</p>
                <h2 className="mt-4 text-4xl lg:text-6xl font-black premium-text">Let's plan your service.</h2>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className={`rounded-[20px] border p-6 ${theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>Phone</p>
                    <p className={`mt-2 text-2xl font-black ${colors.text}`}>+91 9811797407</p>
                  </div>
                  <div className={`rounded-[20px] border p-6 ${theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>Email</p>
                    <p className={`mt-2 text-2xl font-black break-all ${colors.text}`}>support@boysatwork.in</p>
                  </div>
                  <div className={`rounded-[20px] border p-6 lg:col-span-2 ${theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${colors.subtext}`}>Service Address</p>
                    <p className={`mt-2 text-lg font-semibold ${colors.text}`}>9 Guru Nanak Market, New Delhi - 110024</p>
                    <p className={`mt-4 text-sm ${colors.cardText}`}>
                      Logged-in profile contact: {profile?.name || "Pending name"} · {formatPhoneForDisplay(profile?.phone)}
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <button onClick={() => switchView("cart")} className="px-7 py-3 rounded-full bg-blue-600 text-white text-[11px] uppercase font-black tracking-widest">
                    Continue to Booking
                  </button>
                </div>
              </div>
            </section>
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
