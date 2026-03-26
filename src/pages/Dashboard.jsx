import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "../lib/profile";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import SearchBar from "../components/layout/SearchBar";
import ReviewModal from "../components/layout/ReviewModal";

import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

import ServiceModal from "../components/services/ServiceModal";
import ServicesView from "../components/services/ServicesView";
import ServiceGrid from "../components/services/ServiceGrid";
import ServiceSlider from "../components/services/ServiceSlider";
import CartSummary from "../components/cart/CartSummary";
import useLocation from "../hooks/useLocation";
import ProfileModal from "../components/profile/ProfileModal";
import { SERVICES as FALLBACK_SERVICES } from "../data/services";
import { DASHBOARD_FILTERS, getThemeTokens, normalizeDashboardFilter, resolveThemeMode } from "../styles/theme";

import { BLOG_POSTS } from "../data/blogPosts";
import { TESTIMONIALS } from "../data/testimonials";

const SERVICE_IMAGES = {
  plumbing: "/Assets/plumbing.png",
  electrical: "/Assets/electrical.png",
  carpentry: "/Assets/carpentry.png",
  painting: "/Assets/painting.png",
  "ac service": "/Assets/ac-service.png",
  "ac repair": "/Assets/ac-service.png",
  building: "/Assets/building.png",
  property: "/Assets/property.png",
  facility: "/Assets/facility.png",
  cleaning: "/Assets/facility.png",
};

const isValidPhone = (value) => /^\d{10,15}$/.test(String(value || ""));
const idsEqual = (left, right) => String(left) === String(right);
// ... removed from here to move inside component ...

const formatPhoneForDisplay = (value = "") => {
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "Pending";
  if (clean.length === 10) return `+91 ${clean}`;
  return `+${clean}`;
};

const hasResolvedLocation = (value = "") =>
  Boolean(
    value &&
    value !== "Detecting..." &&
    value !== "Location unavailable" &&
    value !== "Unable to detect location" &&
    !String(value).toLowerCase().includes("denied")
  );

export default function Dashboard() {
  const [theme, setTheme] = useState(() => localStorage.getItem("dashboard_theme") || "dark");
  const [activeIdx, setActiveIdx] = useState(0);
  const { location: detectedLocation, isLoading: isLocating, refreshLocation } = useLocation({ autoStart: false });
  const [location, setLocation] = useState("");
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("services_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentView, setCurrentView] = useState(() => localStorage.getItem("dashboard_view") || "home");
  const [activeFilter, setActiveFilter] = useState("All services");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingTab, setBookingTab] = useState("cart"); // cart, upcoming, completed, cancelled
  const [localTestimonials, setLocalTestimonials] = useState(TESTIMONIALS.slice(0, 3));
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState("");
  const [userInitials, setUserInitials] = useState("H");
  const [blogCategory, setBlogCategory] = useState("All");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogVisibleCount, setBlogVisibleCount] = useState(3);
  const [readingPost, setReadingPost] = useState(null);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMetadata, setBookingMetadata] = useState(null);
  const [toast, setToast] = useState("");
  const [totalBookingsCount, setTotalBookingsCount] = useState(4200);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState(() => {
    try {
      const stored = localStorage.getItem("dashboard_contact_form");
      return stored ? JSON.parse(stored) : {
        name: "",
        phone: "",
        email: "",
        service: "AC Service",
        message: ""
      };
    } catch {
      return {
        name: "",
        phone: "",
        email: "",
        service: "AC Service",
        message: ""
      };
    }
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const contentRef = useRef(null);

  const formatShortAddress = useCallback((addr = "") => {
    if (!addr || addr === "Detecting..." || addr === "Location unavailable" || addr.includes("denied")) return addr;
    const parts = addr.split(",").map(p => p.trim());
    if (parts.length <= 2) return addr;
    return parts.slice(0, 2).join(", ");
  }, []);

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
      img: SERVICE_IMAGES[key] || `/Assets/${key.replace(/\s+/g, '-')}.png`,
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
    img: SERVICE_IMAGES[row.title.toLowerCase()] || row.img || "/Assets/facility.png",
    themeColor: row.themeColor || '#3b82f6',
    lightColor: row.lightColor || '#dbeafe',
    subServices:
      row.subServices ||
      ["Verified technician visit", "Transparent pricing", "Quality checks"],
  });

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

    //  Real-time: re-fetch whenever any row in `services` changes (price, name, etc.)
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
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async () => {
      if (!isMounted) return;
      setBlogLoading(true);
      setBlogError("");
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id,title,category,excerpt,content,cover_image,read_time,published_at,slug")
          .order("published_at", { ascending: false });

        if (!isMounted) return;

        if (!error && data?.length) {
          const BLOG_IMAGE_MAP = {
            "best-deep-cleaning-services-in-delhi": "/Assets/facility.png",
            "essential-home-maintenance-tips-delhi-monsoon": "/Assets/plumbing.png",
            "how-to-choose-the-right-ac-service-provider-delhi": "/Assets/ac-service.png"
          };

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
              slug: row.slug || `post-${row.id ?? idx + 1}`,
              view: row.slug ? `post-${row.slug}` : `post-${row.id ?? idx + 1}`,
              img: BLOG_IMAGE_MAP[row.slug] || row.cover_image || "/Assets/services.png",
              excerpt: row.excerpt || "Read our latest service insights from Houserve.",
              content: row.content || "",
              author: "Houserve Team",
              role: "Support Expert",
              emoji: row.category?.toLowerCase().includes('cleaning') ? '' :
                row.category?.toLowerCase().includes('plumbing') ? '' :
                  row.category?.toLowerCase().includes('ac') ? '' :
                    row.category?.toLowerCase().includes('maintenance') ? '' : ''
            }))
          );
        } else if (error) {
          console.error("Blog fetch error:", error);
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
    if (hasResolvedLocation(detectedLocation)) {
      setLocation(detectedLocation);
    }
  }, [detectedLocation]);

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
      if (profileData?.location) setLocation(profileData.location);
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

      // Pre-fill contact form
      setContactForm(prev => ({
        ...prev,
        name: profileData?.name || user.user_metadata?.name || user.user_metadata?.full_name || "",
        phone: profileData?.phone || "",
        email: profileData?.email || user.email || ""
      }));
    };

    loadUserInitials();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId || !profile?.email) {
      if (!userId) setBookingsLoading(false);
      return;
    }
    let isMounted = true;

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_email", profile?.email || "")
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setBookings(data);
        }
        setBookingsLoading(false);
      }
    };

    fetchBookings();

    const fetchTotalBookings = async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      if (!error && count !== null) {
        setTotalBookingsCount(4200 + count);
      }
    };
    fetchTotalBookings();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_email=eq.${profile?.email || ""}` },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId, profile?.email]);

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

  const blogCategories = useMemo(() => {
    const cats = [...new Set(blogPosts.map(b => b.cat).filter(Boolean))];
    return ['All', ...cats];
  }, [blogPosts]);

  const filteredBlogs = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCat = blogCategory === 'All' || post.cat === blogCategory;
      const matchesSearch = !blogSearch ||
        post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(blogSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [blogPosts, blogCategory, blogSearch]);

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      // Adjust to IST if needed, but assuming local time is already IST as per metadata
      const day = now.getDay(); // 0 is Sunday, 1-5 is Mon-Fri, 6 is Saturday
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hour * 60 + minutes;

      let isOpen = false;
      if (day >= 1 && day <= 5) { // Mon-Fri: 9am - 8pm
        isOpen = timeInMinutes >= 9 * 60 && timeInMinutes < 20 * 60;
      } else if (day === 6) { // Saturday: 9am - 6pm
        isOpen = timeInMinutes >= 9 * 60 && timeInMinutes < 18 * 60;
      } else if (day === 0) { // Sunday: 10am - 4pm
        isOpen = timeInMinutes >= 10 * 60 && timeInMinutes < 16 * 60;
      }
      setIsServiceOpen(isOpen);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("services_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("dashboard_view", currentView);
  }, [currentView]);


  useEffect(() => {
    localStorage.setItem("dashboard_theme", theme);
    const themeMode = resolveThemeMode(theme);
    document.documentElement.dataset.dashboardTheme = themeMode;
    document.body.dataset.dashboardTheme = themeMode;
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dashboard_contact_form", JSON.stringify(contactForm));
  }, [contactForm]);

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

      const sName = String(service.name || "").toLowerCase();
      const sImg = SERVICE_IMAGES[sName] || service.img || `/Assets/${sName.replace(/\s+/g, '-')}.png` || "/Assets/facility.png";

      return [
        ...prev,
        {
          service_id: itemKey,
          name: service.name,
          title: service.title,
          description: service.description,
          price: Number(service.price || 0),
          quantity: 1,
          img: sImg,
        },
      ];
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter((item) => !idsEqual(item.service_id, serviceId)));
  };

  const resendEmail = async (booking) => {
    setToast("Sending email request...");
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          name: profile?.name || "Customer",
          email: profile?.email || booking.user_email,
          phone: profile?.phone,
          service: booking.service_name,
          location: booking.address || profile?.location,
          date: booking.scheduled_date || "Flexible",
          time: booking.scheduled_time || "Flexible",
          order_id: booking.order_id,
          type: 'confirmation_resend',
          admin_email: "shivskukreja@gmail.com",
          to_email: profile?.email || booking.user_email || "shivskukreja@gmail.com"
        },
      });
      if (error) throw error;
      setToast(`Confirmation email resent for #${booking.order_id.slice(0, 8).toUpperCase()}`);
    } catch (err) {
      console.error("Failed to resend email:", err);
      setToast("Failed to resend email notification.");
    }
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
        user_email: profile?.email || "",
      }))
    );

    const { data: insertedData, error } = await supabase.from("orders").insert(rows).select();

    if (error) {
      setCheckoutMessage("Unable to place booking right now. Please try again.");
      setSubmittingBooking(false);
      return;
    }

    const firstRow = insertedData?.[0];

    // Trigger WhatsApp notification via Supabase Edge Functions (User + Admin)
    const serviceNames = cartItems.map((item) => item.name || item.title).join(", ");
    try {
      await supabase.functions.invoke("send-whatsapp", {
        body: {
          name: profile?.name,
          phone: profile?.phone,
          email: profile?.email || "N/A",
          service: serviceNames,
          location: address || profile?.location,
          date: date || "Flexible",
          time: time || "Flexible",
          order_id: firstRow?.order_id,
          isAdminNotify: true,
          admin_phone: "9811797407"
        },
      });
    } catch (err) {
      console.error("Failed to trigger WhatsApp notification:", err);
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
          admin_email: "shivskukreja@gmail.com", // Notifying admin via email too
          to_email: "shivskukreja@gmail.com" // Ensure the edge function knows where to send
        },
      });
    } catch (err) {
      console.error("Failed to trigger email notification:", err);
      // We don't block the UI if email fails, booking is already inserted.
    }

    setBookingMetadata({
      date,
      time,
      address,
      cart_items: cartItems,
      order_id: firstRow?.order_id
    });
    setCartItems([]);
    setBookingSuccess(true);
    setSubmittingBooking(false);
    
    // Clear checkout related cache
    localStorage.removeItem("checkout_step");
    localStorage.removeItem("checkout_date");
    localStorage.removeItem("checkout_time");
    localStorage.removeItem("checkout_address");
    localStorage.removeItem("checkout_address_details");
    // Success will be handled in CartSummary success screen, 
    // but the realtime listener will pick up the new order in Dashboard.
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactForm.name.trim()) errors.name = true;
    if (!contactForm.phone.trim()) errors.phone = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast("Please fill in required fields.");
      return;
    }

    setFormErrors({});
    
    // Construct Gmail link
    const subject = encodeURIComponent(`Service Inquiry from ${contactForm.name} - ${contactForm.service}`);
    const bodyText = `Hello Houserve,\n\nI am interested in ${contactForm.service} service.\n\nMy Details:\nName: ${contactForm.name}\nPhone: ${contactForm.phone}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}\n\nBest regards,\n${contactForm.name}`;
    const body = encodeURIComponent(bodyText);
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=shivskukreja@gmail.com&su=${subject}&body=${body}`;
    
    // Redirect to Gmail
    window.location.href = gmailLink;
    
    setContactSuccess(true);
    setToast(`Redirecting to Gmail for ${contactForm.service}...`);
    localStorage.removeItem("dashboard_contact_form");
  };

  const cancelBooking = async (orderId) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("order_id", orderId);

    if (error) {
      setToast("Failed to cancel booking.");
      return;
    }
    setToast("Booking cancelled successfully.");
  };

  const rebook = (booking) => {
    const service = services.find(s => (s.name || s.title) === booking.service_name);
    if (service) {
      addToCart(service);
      switchView('cart');
      setToast(`Added ${booking.service_name} to cart.`);
    } else {
      setToast("Service no longer available for direct rebooking.");
    }
  };

  const openWhatsApp = (booking) => {
    const bookingId = booking.order_id || 'N/A';
    const serviceName = booking.service_name || 'Service';
    const date = booking.scheduled_date || 'Flexible';
    
    const message = `Hi, I'm reaching out regarding my booking. 
Booking ID: #${bookingId.slice(0, 8).toUpperCase()}
Service: ${serviceName}
Date: ${date}`;

    const url = `https://wa.me/919811797407?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };



  const switchView = useCallback((view, options = {}) => {
    const behavior = options.smooth === false ? "auto" : "smooth";
    setCurrentView(view);
    setReadingPost(null);
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
  const themeMode = resolveThemeMode(theme);
  const colors = getThemeTokens(theme);
  const normalizedFilter = normalizeDashboardFilter(activeFilter);

  const legacyDisplayedServices = services.filter((s, index) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match = s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
    }
    if (normalizedFilter === "Nearby") {
      match = match && index % 2 === 0;
    } else if (normalizedFilter === "Top rated") {
      match = match && Number(s.rating) >= 4.7;
    } else if (activeFilter === "Top rated ") {
      match = match && Number(s.rating) >= 4.7;
    } else if (normalizedFilter === "Available today") {
      match = match && index % 3 !== 0;
    } else if (normalizedFilter === "Under 500") {
      match = match && s.price < 500;
    } else if (activeFilter === "Under 500") {
      match = match && s.price < 500;
    }
    return match;
  });

  const displayedServices = services.filter((s, index) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match = s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
    }

    if (normalizedFilter === "Nearby") {
      match = match && index % 2 === 0;
    } else if (normalizedFilter === "Top rated") {
      match = match && Number(s.rating) >= 4.7;
    } else if (normalizedFilter === "Available today") {
      match = match && index % 3 !== 0;
    } else if (normalizedFilter === "Under 500") {
      match = match && Number(s.price) < 500;
    }

    return match;
  });

  void legacyDisplayedServices;

  return (
    <>
      <style>{`
        html, body { 
          scroll-behavior: smooth; 
          scrollbar-gutter: stable;
        }
        .glass { backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .premium-text {
          background: ${theme === "dark" ? "linear-gradient(180deg, #ffffff 0%, #9ea7bd 100%)" : "none"};
          color: ${theme === "dark" ? "#ffffff" : "#111113"};
          -webkit-background-clip: ${theme === "dark" ? "text" : "border-box"};
          -webkit-text-fill-color: ${theme === "dark" ? "transparent" : "currentColor"};
          text-shadow: ${theme === "dark" ? "0 6px 20px rgba(0, 82, 255, 0.2)" : "none"};
          letter-spacing: -0.02em;
          padding-bottom: 0.15em;
          margin-bottom: -0.15em;
          line-height: normal;
        }
        .service-card-active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); animation: cardPop 700ms cubic-bezier(0.16, 1, 0.3, 1); }
        .service-card-hidden { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(20px); pointer-events: none; }
        @keyframes cardPop { 0% { transform: translateY(18px) scale(0.96); opacity: 0.2; } 70% { transform: translateY(-4px) scale(1.01); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .reflect-card { position: relative; overflow: hidden; border-width: 1px; }
        .reflect-card::after { content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, ${theme === "dark" ? "0.06" : "0.15"}) 50%, rgba(255, 255, 255, 0) 60%); transform: rotate(-45deg); animation: glint 10s infinite linear; pointer-events: none; }
        @keyframes glint { 0% { transform: translate(-30%, -30%) rotate(-45deg); } 12% { transform: translate(30%, 30%) rotate(-45deg); } 100% { transform: translate(30%, 30%) rotate(-45deg); } }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.16); border-radius: 10px; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-in { animation: fadeIn 0.5s ease-out fill-mode-both; }
        .fade-in { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
        .zoom-in-95 { transform: scale(0.95); animation: zoomIn 0.5s ease-out forwards; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .service-chip-active { box-shadow: 0 0 20px rgba(37, 99, 235, 0.2); }
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

      <div data-dashboard-theme={themeMode} className={`relative z-40 h-screen overflow-hidden flex flex-col md:flex-row ${colors.bg}`}>
        <Sidebar
          currentView={currentView}
          setCurrentView={switchView}
          cartItems={cartItems}
          theme={theme}
          onLogout={handleLogout}
          bookingsCount={bookings.filter(b => b.status === 'pending').length}
        />

        <MobileBottomNav
          currentView={currentView}
          setCurrentView={switchView}
          theme={theme}
          bookingsCount={bookings.filter(b => b.status === 'pending').length}
        />

        <div ref={contentRef} className="flex-1 h-screen overflow-y-auto relative bg-transparent md:ml-20 lg:ml-64 custom-scroll theme-scrollbar scroll-smooth overscroll-contain [scroll-behavior:smooth] pb-24 md:pb-8">
          <Navbar
            location={formatShortAddress(location)}
            onLogout={handleLogout}
            onViewProfile={() => setShowProfileModal(true)}
            toggleTheme={toggleTheme}
            theme={theme}
            setCurrentView={switchView}
            userInitials={userInitials}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {currentView === "home" && !readingPost && (
            <>
              {/* Profile Strip - Redesigned for Mobile */}
              <section className="px-4 lg:px-24 pt-4 lg:pt-8 pb-2">
                <div className={`glass px-4 py-3 lg:py-3 lg:px-5 rounded-3xl lg:rounded-2xl border ${colors.glass} flex items-center justify-between`}>
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center font-bold text-[14px] bg-blue-600 text-white shadow-lg">
                        {userInitials}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full shadow-sm"></span>
                    </div>
                    <div>
                      <h3 className={`text-[13px] lg:text-[14px] font-black tracking-tight ${colors.text}`}>{profile?.name || "Aditya Jha"}</h3>
                      <p className={`text-[10px] lg:text-[12px] mt-0.5 flex items-center gap-1.5 ${colors.subtext} font-bold opacity-70`}>
                        {formatShortAddress(profile?.location || location)} | {profile?.phone || "8851853122"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => switchView("services")} className={`px-4 py-2 lg:py-2.5 rounded-xl text-[10px] lg:text-[12px] font-black uppercase tracking-widest theme-button-motion ${colors.secondaryButton}`}>Browse services</button>
                  </div>
                </div>

                {/* Search Bar Container */}
                <div className="mt-6 lg:mt-8">
                  <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    location={formatShortAddress(location)}
                    setLocation={setLocation}
                    theme={theme}
                    isLocating={isLocating}
                    onLocationClick={refreshLocation}
                  />
                </div>
              </section>

              <section className="lg:hidden px-4 mb-6">
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                  {[
                    { value: DASHBOARD_FILTERS[0].value, label: "All" },
                    { value: DASHBOARD_FILTERS[1].value, label: "Nearby" },
                    { value: DASHBOARD_FILTERS[2].value, label: "Top rated" },
                    { value: DASHBOARD_FILTERS[3].value, label: "Today only" },
                    { value: DASHBOARD_FILTERS[4].value, label: "Budget" },
                  ].map((filter) => {
                    const isActive = normalizedFilter === filter.value;

                    return (
                      <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap active:scale-95 theme-button-motion ${isActive ? colors.activeChip : colors.inactiveChip}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Horizontal Filter Chips (Mobile only) */}
              <section className="hidden lg:hidden px-4 mb-6">
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                    {['All', 'Nearby', 'Top rated', 'Today only', 'Budget'].map((label, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveFilter && setActiveFilter(label.split(' ')[0])}
                            className={`px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${activeFilter?.includes(label.split(' ')[0])
                                ? 'bg-[#111111] text-white border-white/10 shadow-xl'
                                : 'bg-white border-black/5 text-black/40 shadow-sm'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
              </section>

              {/* Featured Card - Mobile Only */}
              <section className="lg:hidden px-4 mb-8">
                {theme === 'dark' ? (
                  // Dark Mode: Photo-overlay style
                  <div className="relative w-full h-[200px] rounded-[32px] overflow-hidden group shadow-2xl border border-white/5 bg-[#0a0a0b]">
                      <img 
                          src="/Assets/ac-service.png" 
                          className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 opacity-40" 
                          alt="Featured" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                      
                      <div className="absolute top-4 left-4 z-20">
                          <div className="bg-blue-600 px-3 py-1 rounded-full border border-blue-400/30 shadow-lg">
                              <span className="text-white text-[9px] font-black uppercase tracking-widest">Next-Day Slots</span>
                          </div>
                      </div>

                      <div className="absolute top-4 right-4 z-20">
                          <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                              <span className="text-white text-[11px] font-black">4.7</span>
                              <span className="text-amber-400 text-[10px]">*</span>
                          </div>
                      </div>

                      <div className="absolute bottom-6 left-6 z-20">
                          <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Featured Service</p>
                          <h2 className="text-3xl font-black text-white leading-tight mb-4">AC Service</h2>
                          <div className="flex items-center gap-3">
                              <button onClick={() => switchView("services")} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 theme-button-motion ${colors.contrastButton}`}>Add to cart</button>
                              <button onClick={() => switchView("services")} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.secondaryButton}`}>Book now</button>
                          </div>
                      </div>
                      
                      <div className="absolute bottom-6 right-6 text-4xl font-black opacity-20 z-20 drop-shadow-2xl">AC</div>
                  </div>
                ) : (
                  // Light Mode: Clean blue gradient card
                  <div className="relative w-full p-8 rounded-[40px] overflow-hidden group shadow-xl bg-gradient-to-br from-[#fff9ef] via-[#f7eddc] to-[#e8dcc7] border border-black/10">
                      <div className="relative z-20 flex flex-col items-start h-full">
                          <div className="flex gap-2 mb-6">
                              <span className="bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-500/20">Featured</span>
                              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-white/10 text-white border-white/10' : 'bg-black/[0.04] text-[#111113] border-black/10'}`}>Houserve Premium</span>
                          </div>
                          
                          <p className="text-black/60 text-[11px] font-black uppercase tracking-[0.3em] mb-2">Starting from Rs 299</p>
                          <h2 className="text-4xl font-black text-[#111113] leading-tight mb-4">Electrical</h2>
                          
                          <p className="text-[#2f2f35] text-[13px] leading-relaxed mb-8 max-w-[80%] font-medium">
                              Professional electrical services ensuring safety and efficiency. All work compliant with standards.
                          </p>
                          
                          <button onClick={() => switchView("services")} className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center gap-2 theme-button-motion ${colors.primaryButton}`}>
                              Book now <span className="text-lg leading-none"></span>
                          </button>
                          
                          <p className="mt-6 text-black/55 text-[11px] font-bold">21+ professionals available today</p>
                      </div>
                  </div>
                )}
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
                  <ServiceGrid SERVICES={displayedServices} addToCart={addToCart} isInCart={isInCart} setSelectedService={setSelectedService} theme={theme} onViewSummary={() => switchView("services")} />
                  <ServiceSlider SERVICES={displayedServices} activeIdx={activeIdx} setActiveIdx={setActiveIdx} addToCart={addToCart} isInCart={isInCart} theme={theme} onViewSummary={() => switchView("cart")} onSeeDetails={setSelectedService} />
                </>
              )}

              <section className="px-6 lg:px-24 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "OK", title: "Verified Pros", desc: "Background checked service experts." },
                    { icon: "FAST", title: "Fast Response", desc: "Quick dispatch across Delhi NCR." },
                    { icon: "Rs", title: "Transparent Pricing", desc: "No hidden fees. Clear breakdowns." },
                    { icon: "24/7", title: "Always Available", desc: "Dedicated support for every booking." },
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
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                      {blogPosts.slice(0, 2).map((post, idx) => (
                        <button key={post.id} onClick={() => { setReadingPost(post); switchView('blog'); }} className={`relative glass text-left rounded-[32px] border p-7 ${colors.glass} group flex flex-col`}>
                          <div className={`relative w-full rounded-[20px] mb-6 flex items-center justify-center overflow-hidden ${idx === 0 ? 'h-64' : 'h-48'}`}>
                            <img src={post.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="" />
                            <div className={`absolute top-3 right-3 backdrop-blur text-[10px] font-bold px-3 py-1.5 rounded-full border ${colors.badge}`}>
                              {post.readTime}
                            </div>
                          </div>
                          <p className={`text-[10px] uppercase font-bold text-blue-500 tracking-wider mb-2`}>{post.cat} <span className={colors.subtext}>| {post.date}</span></p>
                          <h3 className={`mt-1 text-2xl font-black premium-text group-hover:text-blue-400 transition-colors line-clamp-2`}>{post.title}</h3>
                          <p className={`mt-3 text-[13px] ${colors.cardText} line-clamp-2`}>{post.excerpt}</p>
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <p className={`text-[11px] font-bold ${colors.subtext}`}>By Houserve</p>
                            <span className="text-blue-500 group-hover:translate-x-1 transition-transform"></span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="px-4 lg:px-24 py-10 lg:py-16">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl lg:text-6xl font-black premium-text">Reviews</h2>
                  <button onClick={() => setShowReviewModal(true)} className="px-5 py-2.5 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 text-xs font-black uppercase tracking-widest transition-all">Write review</button>
                </div>
                <div className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar pb-6 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                  {localTestimonials.map((item, idx) => (
                    <div key={item.name} className={`glass min-w-[280px] lg:min-w-0 rounded-[32px] border ${colors.glass} p-6 lg:p-8 flex flex-col justify-between ${idx === 0 ? 'border-blue-500/30' : ''}`}>
                      <div>
                        <div className="text-3xl text-blue-500 opacity-60 font-serif leading-none mb-3">"</div>
                        <p className={`text-[13px] lg:text-[14px] italic leading-relaxed ${colors.cardText}`}>{item.quote}</p>
                      </div>
                      <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-lg">
                            {item.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className={`text-xs lg:text-sm font-black ${colors.text}`}>{item.name}</p>
                            <p className={`text-[10px] lg:text-[11px] font-bold ${colors.subtext} opacity-60`}>{item.loc}</p>
                          </div>
                        </div>
                        <div className="text-amber-400 text-[10px] tracking-widest text-right font-black">
                          <br />
                          <span className="text-green-500 font-black tracking-normal inline-block mt-1 bg-green-500/10 px-2 py-0.5 rounded-full text-[8px] uppercase">Verified</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {currentView === "services" && (
            <ServicesView addToCart={addToCart} isInCart={isInCart} setCurrentView={switchView} theme={theme} />
          )}

          {currentView === "blog" && !readingPost && (
            <section className="py-12 px-6 lg:px-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h1 className="text-5xl lg:text-7xl font-black premium-text">Our Blog</h1>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg"></span>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className={`rounded-2xl py-3 pl-12 pr-6 text-sm w-full md:w-64 focus:border-blue-500/50 transition-all outline-none border ${colors.inputBg}`}
                  />
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-3 mb-12">
                {blogCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setBlogCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold border theme-button-motion ${blogCategory === cat ? colors.activeChip : colors.inactiveChip}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {blogLoading ? (
                <div className="py-20 text-center opacity-50">Loading articles...</div>
              ) : blogError ? (
                <div className="py-10 text-center text-amber-500 bg-amber-500/10 rounded-3xl border border-amber-500/20">{blogError}</div>
              ) : (
                <div className="space-y-12">
                  {/* Featured Hero (Only if searching/filtering allows) */}
                  {filteredBlogs.length > 0 && blogCategory === 'All' && !blogSearch && (
                    <div className={`glass rounded-[40px] border ${colors.glass} overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all shadow-2xl`} onClick={() => setReadingPost(filteredBlogs[0])}>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
                        <div className={`relative min-h-[400px] flex items-center justify-center overflow-hidden`}>
                          <img src={filteredBlogs[0].img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="" />
                          <span className="absolute top-6 left-6 bg-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Featured</span>
                          <span className="absolute top-6 right-6 bg-black/40 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full">{filteredBlogs[0].readTime}</span>
                        </div>
                        <div className="p-10 lg:p-14 flex flex-col justify-center">
                          <p className="text-xs uppercase font-black text-blue-500 tracking-[0.2em] mb-4">{filteredBlogs[0].cat}  {filteredBlogs[0].date}</p>
                          <h2 className="text-4xl lg:text-5xl font-black premium-text leading-tight mb-6">{filteredBlogs[0].title}</h2>
                          <p className={`text-base lg:text-lg leading-relaxed mb-10 ${colors.cardText} opacity-70 line-clamp-3`}>{filteredBlogs[0].excerpt}</p>
                          <div className={`flex items-center justify-between mt-auto pt-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shadow-lg">{filteredBlogs[0].author[0]}</div>
                              <span className="text-sm font-bold opacity-80">{filteredBlogs[0].author}</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">Read article <span></span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blog Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.slice((blogCategory === 'All' && !blogSearch) ? 1 : 0, blogVisibleCount + ((blogCategory === 'All' && !blogSearch) ? 1 : 0)).map((post) => (
                      <div key={post.id} onClick={() => setReadingPost(post)} className={`glass rounded-[32px] border ${colors.glass} overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all flex flex-col`}>
                        <div className={`h-48 relative overflow-hidden flex items-center justify-center`}>
                          <img src={post.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="" />
                          <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-full">{post.readTime}</span>
                        </div>
                        <div className="p-7 flex flex-col flex-grow">
                          <p className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] mb-4">{post.cat}</p>
                          <h3 className="text-xl font-black premium-text leading-tight mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">{post.title}</h3>
                          <p className={`text-xs leading-relaxed mb-6 ${colors.cardText} opacity-60 line-clamp-2`}>{post.excerpt}</p>
                          <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${colors.subtext}`}>{post.date}</span>
                            <span className="text-blue-500 group-hover:translate-x-1 transition-transform"></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {filteredBlogs.length === 0 && (
                    <div className="py-20 text-center opacity-40">
                      <p className="text-lg font-bold">No articles match your search</p>
                      <button onClick={() => { setBlogSearch(''); setBlogCategory('All'); }} className="mt-4 text-sm text-blue-500 underline uppercase tracking-widest font-black">Clear filters</button>
                    </div>
                  )}

                  {/* Load More */}
                  {filteredBlogs.length > blogVisibleCount + 1 && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setBlogVisibleCount(prev => prev + 3)}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                          <span className="text-xl group-hover:text-white transition-colors"></span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {readingPost && (
            <section className="py-12 px-6 lg:px-24 max-w-5xl mx-auto">
              <button
                onClick={() => setReadingPost(null)}
                className={`flex items-center gap-3 text-xs uppercase tracking-widest font-black mb-10 hover:text-blue-500 transition-colors ${colors.text} opacity-70`}
              >
                <span className="text-xl"></span> Back to Blog
              </button>

              <div className={`glass rounded-[40px] border ${colors.glass} overflow-hidden p-6 lg:p-12 shadow-2xl`}>
                <div className={`relative w-full aspect-video rounded-[32px] mb-12 flex items-center justify-center overflow-hidden`}>
                  <img src={readingPost.img} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="" />
                </div>

                <div className="max-w-3xl mx-auto">
                  <p className="text-sm uppercase font-black text-blue-500 tracking-[0.3em] mb-6">{readingPost.cat}</p>
                  <h2 className="text-4xl lg:text-7xl font-black premium-text leading-[1.1] mb-8">{readingPost.title}</h2>

                  <div className="flex flex-wrap items-center gap-6 mb-12 py-8 border-y border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase ${colors.subtext}`}>CAL</span>
                      <span className={`text-sm font-bold ${colors.subtext}`}>{readingPost.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase text-blue-500`}>TIME</span>
                      <span className={`text-sm font-bold ${colors.subtext}`}>{readingPost.readTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase ${colors.subtext}`}>BY</span>
                      <span className={`text-sm font-bold ${colors.subtext}`}>{readingPost.author}</span>
                    </div>
                  </div>

                  <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none text-lg leading-relaxed space-y-8 ${colors.cardText} opacity-80`}>
                    {(readingPost.content || readingPost.excerpt).split('\n\n').map((para, idx) => (
                      <p key={idx} className="mb-4">{para}</p>
                    ))}

                    {!readingPost.content && (
                      <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-600/10 italic text-sm">
                        This is a summary of the article. Full content is available on the live portal.
                      </div>
                    )}
                  </div>
                </div>
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

          {currentView === "bookings" && (
            <section className="px-6 lg:px-24 py-16 lg:py-20 relative z-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <h2 className="text-5xl lg:text-7xl font-black premium-text">My Bookings</h2>
                <div className={`flex border p-1 rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar ${colors.panel}`}>
                  {[
                    { id: 'cart', label: 'Cart', icon: 'CRT', count: cartItems.length },
                    { id: 'upcoming', label: 'Upcoming', icon: 'CAL', count: bookings.filter(b => b.status === 'pending').length },
                    { id: 'completed', label: 'Completed', icon: 'OK', count: bookings.filter(b => b.status === 'completed').length },
                    { id: 'cancelled', label: 'Cancelled', icon: 'X', count: bookings.filter(b => b.status === 'cancelled').length },
                  ].map(t => {
                    const isActive = bookingTab === t.id;
                    const activeStyles = colors.activeTab;
                    const inactiveStyles = `${colors.inactiveTab} uppercase tracking-widest`;
                    const badgeStyles = isActive ? colors.badge : colors.stepActive;
                    
                    return (
                      <button
                        key={t.id}
                        onClick={() => setBookingTab(t.id)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black theme-button-motion flex items-center gap-2 whitespace-nowrap ${isActive ? activeStyles : inactiveStyles}`}
                      >
                        <span className="text-sm">{t.icon}</span>
                        {t.label}
                        {t.count > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${badgeStyles}`}>
                            {t.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`glass w-full min-h-[400px] rounded-[32px] border ${colors.glass} p-6 lg:p-10`}>
                {bookingTab === 'cart' && (
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
                    onClearAll={() => setCartItems([])}
                    profile={profile}
                  />
                )}

                {bookingTab !== 'cart' && (
                  <div className="space-y-6">
                    {bookingsLoading ? (
                      <div className="py-20 text-center opacity-50">Loading your history...</div>
                    ) : (
                      <>
                        {bookings.filter(b => b.status === (bookingTab === 'upcoming' ? 'pending' : bookingTab)).length === 0 ? (
                          <div className="py-20 text-center opacity-50 flex flex-col items-center gap-4">
                            <span className="text-4xl text-blue-500 opacity-40"></span>
                            <p className="text-lg font-bold">No {bookingTab} bookings found</p>
                            <button onClick={() => switchView('services')} className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold">Explore Services</button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookings.filter(b => b.status === (bookingTab === 'upcoming' ? 'pending' : bookingTab)).map(booking => {
                              const sName = String(booking.service_name || "").toLowerCase();
                              let sImg = SERVICE_IMAGES[sName];
                              if (!sImg) {
                                const key = Object.keys(SERVICE_IMAGES).find(k => sName.includes(k) || k.includes(sName));
                                sImg = key ? SERVICE_IMAGES[key] : "/Assets/facility.png";
                              }

                              return (
                                <div key={booking.order_id} className={`p-5 sm:p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'} group hover:border-blue-500/30 transition-all flex flex-col gap-4 shadow-sm`}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-black shrink-0 border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                        <img src={sImg} className="w-full h-full object-cover" alt={booking.service_name} />
                                      </div>
                                      <div>
                                        <h4 className={`font-black text-[15px] sm:text-lg leading-tight ${colors.text}`}>{booking.service_name}</h4>
                                        <p className={`text-[10px] sm:text-xs mt-1 font-bold ${colors.subtext}`}>ID: #{booking.order_id.slice(0, 8).toUpperCase()}</p>
                                      </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[8px] sm:text-[10px] uppercase font-black tracking-widest ${booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                          'bg-blue-500/10 text-blue-500'
                                      }`}>
                                      {booking.status === 'pending' ? 'Upcoming' : booking.status}
                                    </span>
                                  </div>
                                  
                                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} flex justify-between items-center`}>
                                    <div className="flex items-center gap-3 sm:gap-6">
                                      <div>
                                        <p className={`text-[9px] uppercase tracking-widest ${colors.subtext} font-black mb-0.5`}>Date</p>
                                        <p className={`text-[11px] sm:text-sm font-black ${colors.text}`}>{booking.scheduled_date || 'Flexible'}</p>
                                      </div>
                                      <div className={`w-px h-6 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                                      <div>
                                        <p className={`text-[9px] uppercase tracking-widest ${colors.subtext} font-black mb-0.5`}>Time</p>
                                        <p className={`text-[11px] sm:text-sm font-black ${colors.text}`}>{booking.scheduled_time || 'Flexible'}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                       <p className={`text-[9px] uppercase tracking-widest ${colors.subtext} font-black mb-0.5`}>Cost</p>
                                       <p className="text-[11px] sm:text-sm font-black text-blue-500">499</p> 
                                    </div>
                                  </div>

                                  <div className={`grid grid-cols-2 gap-2 pt-2 mt-auto`}>
                                    {booking.status === 'pending' && (
                                      <>
                                        <button onClick={() => openWhatsApp(booking)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] text-[9px] uppercase font-black tracking-widest hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20">
                                           <span>WhatsApp</span>
                                        </button>
                                        <button onClick={() => cancelBooking(booking.order_id)} className="py-3 rounded-2xl bg-red-500/10 text-red-500 text-[9px] uppercase font-black tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20">Cancel</button>
                                      </>
                                    )}
                                    {booking.status === 'completed' && (
                                       <>
                                         <button onClick={() => rebook(booking)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white text-[9px] uppercase font-black tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Rebook</button>
                                         <button onClick={() => resendEmail(booking)} className="py-3 rounded-2xl bg-blue-600/10 text-blue-500 text-[9px] uppercase font-black tracking-widest hover:bg-blue-600/20 transition-all border border-blue-600/20">Email</button>
                                       </>
                                    )}
                                    {booking.status === 'cancelled' && (
                                      <button onClick={() => rebook(booking)} className="col-span-2 py-3 rounded-2xl bg-blue-600 text-white text-[9px] uppercase font-black tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Retry Booking</button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {currentView === "about" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {/* Hero Section */}
              <section className="px-6 lg:px-24 py-16 lg:py-24 relative overflow-hidden">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 group cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Est. 2021 | Delhi NCR</span>
                  </div>
                  <h1 className="text-5xl lg:text-8xl font-black premium-text leading-[1.1] tracking-tight">
                    Reliable help for <br/>
                    <span className="text-blue-500">every home.</span>
                  </h1>
                  <p className={`mt-8 text-lg lg:text-xl leading-relaxed ${colors.cardText} max-w-2xl opacity-80`}>
                    We connect families and businesses with verified experts for essential home services across Delhi NCR. 
                    Our focus is simple - transparent pricing, punctual visits, and quality-first execution. 
                    No surprises, no excuses.
                  </p>
                  <div className="mt-12 flex flex-wrap gap-4">
                    <button 
                      onClick={() => switchView("services")}
                      className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-[1.05] flex items-center gap-3 theme-button-motion ${colors.primaryButton}`}
                    >
                      Browse services <span>{"->"}</span>
                    </button>
                    <a 
                      href="https://wa.me/919811797407" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 flex items-center gap-3 theme-button-motion ${colors.secondaryButton}`}
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
                
                {/* Background Accent */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none select-none -z-10">
                  <span className="text-[20rem] font-black tracking-tighter">H</span>
                </div>
              </section>

              {/* Stats Bar */}
              <section className="px-6 lg:px-24 py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Bookings completed", value: `${(totalBookingsCount / 1000).toFixed(1)}K+`, icon: "CAL", color: "text-blue-500" },
                    { label: "Verified professionals", value: "170+", icon: "PRO", color: "text-blue-500" },
                    { label: "Average rating", value: "4.8", icon: "STAR", color: "text-amber-400" },
                    { label: "Areas in Delhi NCR", value: "12+", icon: "MAP", color: "text-blue-500" },
                  ].map((stat) => (
                    <div key={stat.label} className={`glass rounded-[32px] border p-8 ${colors.glass} flex flex-col items-center text-center group hover:border-blue-500/30 transition-all`}>
                      <span className="text-2xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</span>
                      <h3 className={`text-4xl font-black ${stat.color} mb-2 tracking-tighter`}>{stat.value}</h3>
                      <p className={`text-[10px] uppercase tracking-wider font-bold ${colors.subtext}`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Values Section */}
              <section className="px-6 lg:px-24 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black premium-text">What we stand for</h2>
                    <p className={`text-sm tracking-widest ${colors.subtext} font-bold mt-2`}>Our three core commitments</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { 
                      title: "Verified workforce", 
                      icon: "OK", 
                      bg: "bg-emerald-500/10",
                      desc: "Every professional undergoes background checks, skill assessments, and reference verification before being listed on our platform." 
                    },
                    { 
                      title: "Transparent pricing", 
                      icon: "LIST", 
                      bg: "bg-purple-500/10",
                      desc: "You see the price before you book. No hidden fees, no unnecessary add-ons at the door. What you see is exactly what you pay." 
                    },
                    { 
                      title: "Customer first", 
                      icon: "CARE", 
                      bg: "bg-rose-500/10",
                      desc: "From booking to completion, our support team is available 7 days a week. We follow up after every service to ensure satisfaction." 
                    },
                  ].map((v) => (
                    <div key={v.title} className={`glass rounded-[40px] border p-10 ${colors.glass} relative overflow-hidden group hover:border-white/20 transition-all`}>
                      <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>{v.icon}</div>
                      <h3 className={`text-xl font-black ${colors.text} mb-4`}>{v.title}</h3>
                      <p className={`text-sm leading-relaxed ${colors.cardText} opacity-70`}>{v.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Story + Timeline */}
              <section className="px-6 lg:px-24 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
                  <div>
                    <p className={`text-[10px] uppercase tracking-[0.4em] font-black ${colors.subtext} mb-4`}>Our Journey</p>
                    <h2 className="text-4xl lg:text-6xl font-black premium-text mb-8 leading-tight">Started with one city, <br/>one problem to solve.</h2>
                    <div className={`space-y-6 text-base lg:text-lg leading-relaxed ${colors.cardText} opacity-75`}>
                      <p>
                        Houserve was founded in 2021 after our founders struggled to find reliable, fairly-priced home service professionals in Delhi. Every call ended with a no-show, an inflated bill, or untrained workers.
                      </p>
                      <p>
                        We built a platform that solves exactly that - a curated network of verified professionals, transparent pricing, and a booking experience that actually works. Today we serve thousands of households across Delhi NCR every month.
                      </p>
                    </div>
                  </div>

                  <div className={`glass rounded-[44px] border p-10 lg:p-12 ${colors.glass} relative`}>
                    <p className={`text-[10px] uppercase tracking-[0.4em] font-black ${colors.subtext} mb-10`}>The Roadmap</p>
                    <div className={`space-y-12 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px ${theme === 'dark' ? 'before:bg-white/10' : 'before:bg-black/10'}`}>
                      {[
                        { year: "2021", event: "Founded in Delhi", detail: "Launched with 3 services and 12 professionals in South Delhi." },
                        { year: "2022", event: "50k bookings milestone", detail: "Expanded to 8 service categories and added the mobile app." },
                        { year: "2023", event: "NCR expansion", detail: "Launched in Noida, Gurgaon, and Faridabad. 150+ professionals on board." },
                        { year: "2024", event: "4,200+ bookings", detail: "Reached over 4k verified pros and launched same-day booking." },
                        { year: "2025", event: "Pan-India expansion", detail: "Targeting Mumbai, Bangalore, and Pune. Coming soon.", blur: true },
                      ].map((t) => (
                        <div key={t.year} className={`relative pl-10 group ${t.blur ? 'opacity-30' : ''}`}>
                          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${t.blur ? 'bg-zinc-800 border-zinc-700' : 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'} z-10 group-hover:scale-125 transition-transform`}></div>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black tracking-widest uppercase mb-1 ${colors.subtext}`}>{t.year}</span>
                            <h4 className={`text-base font-black ${colors.text}`}>{t.event}</h4>
                            <p className={`mt-2 text-[11px] leading-relaxed ${colors.cardText} opacity-60`}>{t.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Team Grid */}
              <section className="px-6 lg:px-24 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black premium-text">The team behind it</h2>
                    <p className={`text-sm tracking-widest ${colors.subtext} font-bold mt-2`}>Building for your peace of mind</p>
                  </div>
                  <div className={`flex items-center gap-3 text-xs font-bold ${colors.subtext} hidden lg:flex`}>
                    <span>170+ professionals across Delhi NCR</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { name: "Arjun Kapoor", role: "Co-Founder & CEO", badge: "Leadership", badgeColor: "bg-blue-500/10 text-blue-500", initials: "AK" },
                    { name: "Rohit Sharma", role: "Head of Operations", badge: "Operations", badgeColor: "bg-emerald-500/10 text-emerald-500", initials: "RS" },
                    { name: "Priya Mehta", role: "Customer Experience", badge: "Support", badgeColor: "bg-purple-500/10 text-purple-500", initials: "PM" },
                    { name: "Vikram Nair", role: "Head of Professionals", badge: "Field Ops", badgeColor: "bg-amber-500/10 text-amber-500", initials: "VN" },
                  ].map((m) => (
                    <div key={m.name} className={`glass rounded-[32px] border p-8 ${colors.glass} flex flex-col items-center text-center group hover:-translate-y-2 transition-all`}>
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-black text-white bg-gradient-to-br ${m.initials === 'AK' ? 'from-blue-600 to-indigo-700' : m.initials === 'RS' ? 'from-emerald-600 to-teal-700' : m.initials === 'PM' ? 'from-purple-600 to-pink-700' : 'from-amber-600 to-orange-700'} mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                        {m.initials}
                      </div>
                      <h3 className={`text-lg font-black ${colors.text} mb-1`}>{m.name}</h3>
                      <p className={`text-xs ${colors.subtext} mb-4`}>{m.role}</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.badgeColor}`}>{m.badge}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trust Signals - Mobile Scroll */}
              <section className="px-4 lg:px-24 py-12 lg:py-24">
                <div className="mb-8 px-2">
                  <h2 className="text-2xl lg:text-5xl font-black premium-text">Trust & Safety</h2>
                  <p className={`text-[10px] lg:text-sm tracking-widest ${colors.subtext} font-black uppercase lg:normal-case mt-1 lg:mt-2`}>Built-in guarantees on every booking</p>
                </div>
                <div className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar pb-6 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                  {[
                    { title: "GST registered", icon: "GST", desc: "Fully compliant business. GST invoices available for every booking." },
                    { title: "Insured work", icon: "SAFE", desc: "All service jobs are covered. Any damage during service is on us." },
                    { title: "Licensed pros", icon: "PRO", desc: "Every pro is licensed, background checked and skill-tested before onboarding." },
                    { title: "On-time guarantee", icon: "TIME", desc: "We show up in the slot you choose. Late arrival = 15% off next booking." },
                    { title: "Re-service policy", icon: "REDO", desc: "Not satisfied? We'll send a pro back at no extra charge within 48 hours." },
                    { title: "Secure payments", icon: "LOCK", desc: "All transactions are encrypted. We never store card details." },
                  ].map((s) => (
                    <div key={s.title} className={`min-w-[240px] lg:min-w-0 p-6 rounded-[32px] border ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'} group hover:border-blue-500/20 transition-all`}>
                      <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{s.icon}</div>
                        <div>
                          <h4 className={`text-[15px] lg:text-lg font-black ${colors.text} mb-2`}>{s.title}</h4>
                          <p className={`text-[11px] lg:text-xs leading-relaxed ${colors.cardText} opacity-60`}>{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA Banner - Mobile Redesign */}
              <section className="px-4 lg:px-24 pb-24">
                <div className={`glass rounded-[40px] border p-8 lg:p-20 relative overflow-hidden text-center shadow-2xl ${colors.glass}`}>
                    <div className={`absolute inset-0 pointer-events-none ${themeMode === "dark" ? "bg-gradient-to-br from-blue-900/20 to-transparent" : "bg-gradient-to-br from-blue-500/10 via-transparent to-amber-500/10"}`} />
                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                        <h2 className={`text-3xl lg:text-5xl font-black mb-4 lg:mb-6 ${colors.text}`}>Ready to book?</h2>
                        <p className={`text-sm lg:text-lg mb-8 lg:mb-10 font-bold max-w-md ${colors.cardText}`}>
                        Join 4,000+ households across Delhi NCR and simplify your home maintenance today.
                        </p>
                        
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 lg:gap-4 w-full lg:w-fit">
                        <button 
                            onClick={() => switchView("services")}
                            className={`w-full lg:w-fit px-10 py-4 lg:py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.05] active:scale-95 theme-button-motion ${colors.primaryButton}`}
                        >
                            Get started <span>{"->"}</span>
                        </button>
                        
                        <a 
                            href="https://wa.me/919811797407" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-full lg:w-fit px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:border-emerald-500/30 theme-button-motion flex items-center justify-center gap-3 active:scale-95 ${colors.secondaryButton}`}
                        >
                            <span className="text-[10px] font-black">WA</span>
                            <span className="lg:hidden">WhatsApp</span>
                        </a>
                        </div>
                    </div>
                </div>
              </section>
            </div>
          )}

          {currentView === "contact" && (
            <section className="px-6 lg:px-24 py-14 lg:py-20 relative z-20">
              <div className="max-w-7xl mx-auto">
                <p className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext} mb-4`}>Get in touch</p>
                <h2 className="text-5xl lg:text-7xl font-black premium-text mb-12">Let's plan your service.</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">
                  {/* Left Column: Info Cards & Socials */}
                  <div className="space-y-6">
                    {/* Logged In Info */}
                    <div className={`glass rounded-[28px] border p-6 ${colors.glass} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
                          {userInitials}
                        </div>
                        <div>
                          <h4 className={`font-bold ${colors.text}`}>{profile?.name || "Aditya"}</h4>
                          <p className={`text-xs ${colors.subtext}`}>{formatPhoneForDisplay(profile?.phone || "9319409696")}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest">Logged In</span>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 gap-4">
                      <a href="tel:+919811797407" className={`glass rounded-[24px] border p-6 ${colors.glass} group hover:border-blue-500/50 transition-all flex items-center gap-5`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform`}>CALL</div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1 font-bold`}>Phone</p>
                          <p className={`text-xl font-black ${colors.text}`}>+91 9811797407</p>
                          <p className={`text-[10px] ${colors.subtext} mt-1`}>Tap to call | Mon-Sun 9am-8pm</p>
                        </div>
                      </a>

                      <a 
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=shivskukreja@gmail.com&su=Inquiry&body=Hi%20Houserve%2C%0A%0A" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`glass rounded-[24px] border p-6 ${colors.glass} group hover:border-blue-500/50 transition-all flex items-center gap-5`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform`}>MAIL</div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1 font-bold`}>Email</p>
                          <p className={`text-xl font-black ${colors.text}`}>shivskukreja@gmail.com</p>
                          <p className={`text-[10px] ${colors.subtext} mt-1`}>Tap to email | Reply within 2 hours</p>
                        </div>
                      </a>

                      <a href="https://maps.google.com/?q=9+Guru+Nanak+Market+New+Delhi+110024" target="_blank" rel="noopener noreferrer" className={`glass rounded-[24px] border p-6 ${colors.glass} group hover:border-blue-500/50 transition-all flex items-center gap-5`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform`}>MAP</div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1 font-bold`}>Service Address</p>
                          <p className={`text-xl font-black ${colors.text}`}>9 Guru Nanak Market</p>
                          <p className={`text-[10px] ${colors.subtext} mt-1`}>New Delhi - 110024 | Tap to open maps</p>
                        </div>
                      </a>
                    </div>

                    {/* Service Hours */}
                    <div className={`glass rounded-[32px] border p-8 ${colors.glass}`}>
                      <div className="flex items-center justify-between mb-8">
                        <h4 className={`text-[11px] uppercase tracking-widest font-black ${colors.text}`}>Service Hours</h4>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${isServiceOpen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isServiceOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                          {isServiceOpen ? 'Open now' : 'Closed'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1`}>Mon-Fri</p>
                          <p className={`text-sm font-bold ${colors.text}`}>9am - 8pm</p>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1`}>Saturday</p>
                          <p className={`text-sm font-bold ${colors.text}`}>9am - 6pm</p>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1`}>Sunday</p>
                          <p className={`text-sm font-bold ${colors.text}`}>10am - 4pm</p>
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase tracking-widest ${colors.subtext} mb-1`}>Public holidays</p>
                          <p className={`text-sm font-bold ${colors.text}`}>Closed</p>
                        </div>
                      </div>
                    </div>

                    {/* Socials */}
                    <div>
                      <p className={`text-[10px] uppercase tracking-widest font-black ${colors.subtext} mb-4`}>Follow us</p>
                      <div className="flex gap-4">
                        <a href="https://wa.me/919811797407" target="_blank" rel="noopener noreferrer" className={`flex-1 glass border py-3.5 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[#25D366] ${colors.glass}`}>
                          <span>WhatsApp</span>
                        </a>
                        <a href="https://instagram.com/houserve.official/" target="_blank" rel="noopener noreferrer" className={`flex-1 glass border py-3.5 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all hover:bg-pink-500/10 hover:border-pink-500/40 text-[#E4405F] ${colors.glass}`}>
                          <span>Instagram</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Form */}
                  <div className={`glass rounded-[40px] border p-8 lg:p-12 ${colors.glass} flex flex-col relative overflow-hidden`}>
                    {contactSuccess ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-5xl mb-8"></div>
                        <h3 className="text-4xl font-black premium-text mb-4">Message sent!</h3>
                        <p className={`text-lg ${colors.cardText} opacity-70 mb-10`}>
                          Thank you, {contactForm.name}! We've received your inquiry for <strong>{contactForm.service}</strong> services. Our team will get back to you within 2 hours.
                        </p>
                        <button 
                          onClick={() => setContactSuccess(false)}
                          className="px-8 py-3.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className={`text-2xl font-black ${colors.text} mb-2`}>Send us a message</h3>
                        <p className={`text-xs ${colors.subtext} mb-10`}>We'll get back to you within 2 hours during service hours.</p>

                        <form onSubmit={handleContactSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className={`text-[10px] uppercase font-black tracking-widest ${colors.subtext}`}>Your Name</label>
                              <input 
                                type="text" 
                                value={contactForm.name}
                                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                placeholder="Aditya"
                                className={`w-full border rounded-2xl py-4 px-6 text-sm focus:border-blue-500/50 transition-all outline-none ${formErrors.name ? 'border-red-500' : colors.inputBg}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={`text-[10px] uppercase font-black tracking-widest ${colors.subtext}`}>Phone Number</label>
                              <input 
                                type="text"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                                placeholder="+91 9319409696"
                                className={`w-full border rounded-2xl py-4 px-6 text-sm focus:border-blue-500/50 transition-all outline-none ${formErrors.phone ? 'border-red-500' : colors.inputBg}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className={`text-[10px] uppercase font-black tracking-widest ${colors.subtext}`}>Email Address</label>
                            <input 
                              type="email" 
                              value={contactForm.email}
                              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                              placeholder="your@email.com"
                              className={`w-full border rounded-2xl py-4 px-6 text-sm focus:border-blue-500/50 transition-all outline-none ${colors.inputBg}`}
                            />
                          </div>

                          <div className="space-y-4">
                            <label className={`text-[10px] uppercase font-black tracking-widest ${colors.subtext}`}>Service you need</label>
                            <div className="flex flex-wrap gap-2">
                              {['AC Service', 'Plumbing', 'Carpentry', 'Electrical', 'Painting', 'Other'].map(s => (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => setContactForm({...contactForm, service: s})}
                                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all border theme-button-motion ${contactForm.service === s ? colors.activeChip : colors.inactiveChip}`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <label className={`text-[10px] uppercase font-black tracking-widest ${colors.subtext}`}>Message</label>
                              <span className={`text-[10px] font-bold ${contactForm.message.length > 300 ? 'text-red-500' : colors.subtext}`}>
                                {contactForm.message.length}/300
                              </span>
                            </div>
                            <textarea 
                              value={contactForm.message}
                              onChange={(e) => setContactForm({...contactForm, message: e.target.value.slice(0, 300)})}
                              placeholder="Tell us about your requirement..."
                              rows={4}
                              className={`w-full border rounded-2xl py-4 px-6 text-sm focus:border-blue-500/50 transition-all outline-none resize-none ${colors.inputBg}`}
                            />
                          </div>

                          <button 
                            type="submit"
                            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group theme-button-motion ${colors.primaryButton}`}
                          >
                            Send message <span className="text-lg group-hover:translate-x-1 transition-transform">{"->"}</span>
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Map & CTAs */}
                <div className="mt-12 space-y-12">
                  <div className={`glass rounded-[40px] border ${colors.glass} overflow-hidden`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black">MAP</span>
                        <h4 className={`text-sm font-bold ${colors.text}`}>Service area - Delhi NCR</h4>
                      </div>
                      <a href="https://maps.google.com/?q=9+Guru+Nanak+Market+New+Delhi+110024" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/20">
                        Open in Maps {"->"}
                      </a>
                    </div>
                    <div className="relative h-96 bg-[#0a0f18] p-12 flex items-center justify-center group">
                      {/* Grid pattern background */}
                      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
                      
                      {/* Radius light */}
                      <div className="absolute w-64 h-64 rounded-full bg-blue-600/10 border border-blue-600/20 animate-pulse"></div>
                      
                      {/* Inner dot */}
                      <div className="relative w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,1)]">
                        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl border ${colors.panelStrong} ${colors.text}`}>
                          9 Guru Nanak Market, New Delhi
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => switchView("services")}
                      className="flex-1 bg-blue-600 text-white py-5 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
                    >
                      Continue to booking <span className="text-lg group-hover:translate-x-1 transition-transform">{"->"}</span>
                    </button>
                    <a 
                      href="https://wa.me/919811797407?text=Hi%20Houserve!%20I%20want%20to%20book%20a%20service."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border-2 border-emerald-500/30 text-emerald-500 py-5 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-3 group"
                    >
                      Chat on WhatsApp <span className="opacity-60 text-xs">Hi Houserve!...</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentView === "profile" && (
            <section className="px-6 py-12 lg:py-20 relative z-20 max-w-2xl mx-auto">
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4">
                <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/20 mb-6`}>
                  {userInitials}
                </div>
                <h2 className={`text-3xl font-black ${colors.text} mb-1 tracking-tight`}>{profile?.name || "Member"}</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Premium Member</span>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4 mb-12">
                <label className={`text-[10px] uppercase font-black tracking-[0.2em] ${colors.subtext} px-2`}>Account Details</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Mobile Number', value: formatPhoneForDisplay(profile?.phone) || "Not set", icon: 'PH', color: 'bg-blue-500/10 text-blue-500' },
                    { label: 'Email Address', value: profile?.email || "Not set", icon: 'MAIL', color: 'bg-purple-500/10 text-purple-500' },
                    { label: 'Saved Location', value: profile?.location || "Not set", icon: 'MAP', color: 'bg-rose-500/10 text-rose-500' },
                  ].map((item) => (
                    <div key={item.label} className={`glass p-5 rounded-3xl border ${colors.glass} flex items-center gap-5 group hover:border-blue-500/30 transition-all`}>
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={`text-[9px] uppercase tracking-widest ${colors.subtext} font-black mb-0.5`}>{item.label}</p>
                        <p className={`font-black ${colors.text}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="space-y-4 mb-12">
                <label className={`text-[10px] uppercase font-black tracking-[0.2em] ${colors.subtext} px-2`}>Need Help?</label>
                <div className={`glass p-6 rounded-[32px] border ${colors.glass} bg-blue-600/5`}>
                  <p className={`text-sm font-bold ${colors.text} mb-6 leading-relaxed`}>Questions about your booking? Our team is available 9am - 8pm.</p>
                  <div className="flex flex-col gap-3">
                    <a 
                      href="https://wa.me/919811797407?text=Hi%20Houserve!%20I%20need%20support%20with%20my%20profile."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all"
                    >
                      <span>Chat on WhatsApp</span>
                    </a>
                    <a 
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=shivskukreja@gmail.com&su=Support%20Request&body=Hi%20Houserve%2C%0A%0AI%20need%20help%20with..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-4 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-500/10 transition-all ${colors.text}`}
                    >
                      <span>Email Support</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/10 mb-20 md:mb-10">
                <button 
                  onClick={handleLogout}
                  className="w-full py-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[11px] hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-[10px] font-black">OUT</span> Logout Account
                </button>
                <p className={`text-center text-[10px] ${colors.subtext} mt-6 font-medium`}>Version 2.4.0 (Stable) | Houserve Premium</p>
              </div>
            </section>
          )}

          <footer id="footer-main" className={`glass p-12 lg:p-16 m-6 lg:mx-24 rounded-[32px] border ${colors.glass} relative z-20 mt-20 text-left shadow-2xl`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
              <div>
                <div className="text-2xl font-black premium-text flex items-center gap-2">Houserve<span className="w-2 h-2 rounded-full bg-blue-600"></span></div>
                <p className={`text-sm leading-relaxed mt-4 ${colors.cardText}`}>Trusted partner for home services in Delhi NCR. We connect you with top-rated professionals.</p>
                <div className="flex items-center gap-3 mt-6">
                  {[
                    { icon: 'IG', url: 'https://www.instagram.com/houserve.official/' },
                    { icon: 'YT', url: '#' }
                  ].map((social) => (
                    <a key={social.icon} href={social.url} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold theme-button-motion hover:bg-blue-600 hover:text-white hover:border-transparent ${colors.footerBadge}`}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
              <div className="lg:pl-8">
                <h4 className={`text-[11px] uppercase tracking-widest font-black ${colors.text}`}>Our Services</h4>
                <ul className={`space-y-3 text-sm mt-6 ${colors.cardText}`}>
                  {services.slice(0, 5).map((s) => (
                    <li key={s.id} onClick={() => switchView("services")} className={`hover:text-blue-500 transition-colors cursor-pointer w-fit`}>{s.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={`text-[11px] uppercase tracking-widest font-black ${colors.text}`}>Quick Navigation</h4>
                <ul className={`space-y-3 text-sm mt-6 ${colors.cardText}`}>
                  <li className="cursor-pointer hover:text-blue-500 transition-colors w-fit" onClick={() => switchView("home")}>Home</li>
                  <li className="cursor-pointer hover:text-blue-500 transition-colors w-fit" onClick={() => switchView("services")}>Services</li>
                  <li className="cursor-pointer hover:text-blue-500 transition-colors w-fit" onClick={() => switchView("bookings")}>My Bookings</li>
                  <li className="cursor-pointer hover:text-blue-500 transition-colors w-fit" onClick={() => switchView("blog")}>Blog</li>
                  <li className="cursor-pointer hover:text-blue-500 transition-colors w-fit" onClick={() => switchView("about")}>About</li>
                </ul>
              </div>
              <div>
                <h4 className={`text-[11px] uppercase tracking-widest font-black ${colors.text}`}>Contact</h4>
                <div className={`space-y-4 text-sm mt-6 ${colors.cardText}`}>
                  <a href="#" className="flex gap-3 hover:text-blue-500 transition-colors group">
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-[9px] font-black group-hover:bg-blue-500/10 group-hover:border-blue-500/30 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>MAP</span>
                    <span className="mt-1">9 Guru Nanak Market, New Delhi - 110024</span>
                  </a>
                  <a href="tel:+919811797407" className="flex items-center gap-3 hover:text-blue-500 transition-colors group">
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-[9px] font-black group-hover:bg-blue-500/10 group-hover:border-blue-500/30 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>CALL</span>
                    <span>+91 9811797407</span>
                  </a>
                  <a 
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=shivskukreja@gmail.com&su=General%20Inquiry&body=Hi%20Houserve%2C%0A%0A" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 hover:text-blue-500 transition-colors group"
                  >
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-[9px] font-black group-hover:bg-blue-500/10 group-hover:border-blue-500/30 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>MAIL</span>
                    <span>shivskukreja@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t flex flex-col lg:flex-row items-center justify-between gap-6 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
              <p className={`text-xs ${colors.subtext}`}>(c) 2025 Houserve. All rights reserved.</p>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {[
                  { text: 'OK GST registered', tooltip: 'Registered with Government of India' },
                  { text: 'OK Licensed pros', tooltip: 'All experts undergo background checks' },
                  { text: 'OK Insured work', tooltip: 'Protection up to Rs 10,000 on damages' }
                ].map((badge) => (
                  <div key={badge.text} className="relative group cursor-help">
                    <span className={`px-4 py-2 rounded-full border text-[11px] font-bold theme-button-motion ${colors.footerBadge}`}>{badge.text}</span>
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border ${colors.panelStrong} ${colors.text}`}>
                      {badge.tooltip}
                    </div>
                  </div>
                ))}
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

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        theme={theme}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={(newReview) => {
          setLocalTestimonials([{
            name: profile?.name || 'Verified User',
            loc: profile?.location || location || 'Delhi',
            quote: newReview.text
          }, ...localTestimonials]);
          setShowReviewModal(false);
        }}
        theme={theme}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[220] rounded-2xl border border-blue-500/30 bg-[#0d141c] px-5 py-4 text-sm font-medium text-blue-200 shadow-[0_24px_60px_rgba(0,0,0,0.45)] animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </>
  );
}
