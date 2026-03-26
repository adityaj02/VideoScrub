import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { SERVICES as SERVICES_DATA } from "../../data/services";
import { getThemeTokens } from "../../styles/theme";

const FALLBACK_IMAGES = {
  plumbing: "/Assets/plumbing.png",
  electrical: "/Assets/electrical.png",
  carpentry: "/Assets/carpentry.png",
  painting: "/Assets/painting.png",
  "ac service": "/Assets/ac-service.png",
  building: "/Assets/building.png",
  property: "/Assets/property.png",
  facility: "/Assets/facility.png",
  cleaning: "/Assets/facility.png",
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeService(row, index) {
  const serviceName = String(row?.name || "Service");
  const lookup = serviceName.toLowerCase();
  const image = FALLBACK_IMAGES[lookup] || row.image_url || `/Assets/${lookup.replace(/\s+/g, '-')}.png` || "/Assets/facility.png";
  const dataMatch = SERVICES_DATA.find((service) => service.title.toLowerCase() === lookup);

  return {
    service_id: row.service_id,
    name: serviceName,
    description: row.description || "Premium doorstep support delivered by verified professionals.",
    price: Number(row.price || 0),
    img: image,
    rating: (4.7 + ((index % 4) * 0.1)).toFixed(1),
    prosCount: 18 + index * 3,
    availableToday: index % 5 !== 4,
    badge: index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Fast Response" : "Top Rated",
    themeColor: dataMatch?.themeColor || '#3b82f6',
    lightColor: dataMatch?.lightColor || '#dbeafe',
  };
}

export default function ServicesView({ addToCart, isInCart, setCurrentView, theme }) {
  const colors = getThemeTokens(theme);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);

  const handleBookNow = (service) => {
    addToCart?.(service);
    setCurrentView?.("cart");
  };

  async function fetchServices() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("service_id,name,description,price")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setServices((data || []).map(normalizeService));
    } catch (fetchError) {
      console.error(fetchError);
      setError("Could not load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchText.trim().toLowerCase());
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    if (services.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % services.slice(0, 3).length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [services]);

  const categories = useMemo(() => {
    const uniqueNames = [...new Set(services.map((service) => service.name).filter(Boolean))];
    return ["All", ...uniqueNames];
  }, [services]);

  const featuredServices = useMemo(() => services.slice(0, 3), [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchQuery) ||
        service.description.toLowerCase().includes(searchQuery);
      const matchesCategory = activeCategory === "All" || service.name === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery, services]);

  useEffect(() => {
    if (!featuredServices.length) {
      setHeroIndex(0);
      return;
    }

    if (heroIndex >= featuredServices.length) {
      setHeroIndex(0);
    }
  }, [featuredServices, heroIndex]);

  function clearFilters() {
    setSearchText("");
    setSearchQuery("");
    setActiveCategory("All");
  }

  return (
    <div className={`relative min-h-screen px-6 py-12 lg:px-24 transition-colors duration-500 ${colors.bg} ${colors.text}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,113,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-14 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className={`text-4xl font-black tracking-[-0.04em] ${colors.text} sm:text-5xl lg:text-8xl premium-text`}>
                Services
              </h1>
              <p className={`mt-3 text-sm font-bold uppercase tracking-widest ${colors.subtext}`}>
                Premium Selection
              </p>
            </div>
            <div className={`w-full max-w-md rounded-[24px] border px-4 py-3 ${colors.glass} ${colors.border}`}>
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by service or requirement"
                className={`w-full bg-transparent outline-none text-sm ${colors.text} ${theme === "dark" ? "placeholder-white/40" : "placeholder-black/40"}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest theme-button-motion ${activeCategory === category ? colors.activeChip : colors.inactiveChip}`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {loading ? <LoadingState theme={theme} /> : null}
        {!loading && error ? <ErrorState onRetry={fetchServices} theme={theme} /> : null}

        {!loading && !error ? (
          <>
            {!!featuredServices.length && activeCategory === "All" && !searchQuery ? (
              <FeaturedHero
                featuredServices={featuredServices}
                heroIndex={heroIndex}
                setHeroIndex={setHeroIndex}
                onBook={handleBookNow}
                theme={theme}
              />
            ) : null}

            {filteredServices.length === 0 ? (
              <EmptyState onClear={clearFilters} theme={theme} />
            ) : (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.service_id}
                    service={service}
                    addToCart={addToCart}
                    isInCart={Boolean(isInCart?.(service.service_id))}
                    onBook={() => handleBookNow(service)}
                    theme={theme}
                  />
                ))}
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function LoadingState({ theme }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`relative h-[410px] overflow-hidden rounded-[28px] border ${theme === 'dark' ? 'border-white/8 bg-[#141414]' : 'border-black/5 bg-white'}`}
        >
          <div className={`absolute inset-0 animate-pulse ${theme === 'dark' ? 'bg-[linear-gradient(110deg,#2a2a2a_15%,#333333_45%,#2a2a2a_75%)]' : 'bg-[linear-gradient(110deg,#ececec_15%,#f5f5f5_45%,#ececec_75%)]'} bg-[length:200%_100%]`} />
        </div>
      ))}
    </section>
  );
}

function ErrorState({ onRetry, theme }) {
  const colors = getThemeTokens(theme);

  return (
    <section className={`flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${colors.panel} ${colors.border}`}>
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${colors.badge} text-2xl`}>
        !
      </div>
      <h2 className={`text-2xl font-bold ${colors.text}`}>Could not load services</h2>
      <p className={`mt-2 text-sm ${colors.subtext}`}>Please try again in a moment.</p>
      <button
        type="button"
        onClick={onRetry}
        className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold theme-button-motion ${colors.primaryButton}`}
      >
        Try again
      </button>
    </section>
  );
}

function EmptyState({ onClear, theme }) {
  const colors = getThemeTokens(theme);

  return (
    <section className={`flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border text-center ${colors.panel} ${colors.border}`}>
      <p className={`text-lg font-semibold ${colors.text}`}>No matching services found</p>
      <p className={`mt-2 text-sm ${colors.subtext}`}>Try a different service name or clear the current filters.</p>
      <button
        type="button"
        onClick={onClear}
        className={`mt-6 rounded-full border px-5 py-3 text-sm theme-button-motion ${colors.secondaryButton}`}
      >
        Clear all
      </button>
    </section>
  );
}

function FeaturedHero({ featuredServices, heroIndex, setHeroIndex, onBook, theme }) {
  const colors = getThemeTokens(theme);
  const service = featuredServices[heroIndex] || featuredServices[0];
  if (!service) return null;

  return (
    <section className="relative mb-12 overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500">
      {theme === 'dark' ? (
        <div className="relative w-full min-h-[400px] flex flex-col md:grid md:grid-cols-2 bg-[#0a0a0b] border border-white/5">
          <div className="relative h-64 md:h-full overflow-hidden order-1 md:order-2">
            <img
              src={service.img}
              alt={service.name}
              className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent md:bg-gradient-to-r md:from-[#0a0a0b] md:via-transparent" />
          </div>
          
          <div className="p-8 lg:p-12 flex flex-col justify-center order-2 md:order-1 relative z-10">
            <div className="flex gap-2 mb-6">
              <span className="bg-blue-600 px-3 py-1 rounded-full border border-blue-400/30 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">Featured</span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/70">Next-Day Slots</span>
            </div>
            
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em] mb-2">Starting from {formatPrice(service.price)}</p>
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">{service.name}</h2>
            <p className="text-white/60 text-sm lg:text-base leading-relaxed mb-10 max-w-md font-medium">{service.description}</p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => onBook(service)} className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.primaryButton}`}>
                Book now
              </button>
              <div className="text-[11px] font-black text-white/50 uppercase tracking-widest">
                {service.prosCount}+ Experts Online
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full min-h-[400px] p-8 lg:p-14 bg-[linear-gradient(135deg,#fff6e8_0%,#eef4ff_100%)] border border-black/10 text-black">
          <div className="relative z-10 flex flex-col items-start max-w-2xl">
            <div className="flex gap-2 mb-8">
              <span className="bg-black/5 text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-black/10 shadow-sm">Featured</span>
              <span className="bg-blue-500/10 text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-500/15">Houserve Premium</span>
            </div>
            
            <p className="text-black/60 text-[12px] font-black uppercase tracking-[0.4em] mb-3">Starting from {formatPrice(service.price)}</p>
            <h2 className="text-4xl lg:text-7xl font-black text-black leading-tight mb-6">{service.name}</h2>
            <p className="text-black/75 text-base lg:text-lg leading-relaxed mb-10 max-w-xl font-medium">{service.description}</p>
            
            <button
              type="button"
              onClick={() => onBook(service)}
              className={`px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.primaryButton}`}
            >
              Book now
            </button>
            
            <p className="mt-8 text-black/60 text-[11px] font-black uppercase tracking-widest">21+ professionals available today</p>
          </div>
          
          <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block text-[12rem] opacity-10 font-black pointer-events-none select-none">
            {service.name.slice(0, 1)}
          </div>
        </div>
      )}

      {featuredServices.length > 1 ? (
        <div className="absolute bottom-6 right-8 z-20 flex gap-2">
          {featuredServices.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === heroIndex ? `w-8 ${theme === "dark" ? "bg-white shadow-sm" : "bg-black shadow-sm"}` : `w-3 ${theme === "dark" ? "bg-white/30 hover:bg-white/50" : "bg-black/20 hover:bg-black/35"}`
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ServiceCard({ service, addToCart, isInCart, onBook, theme }) {
  const [added, setAdded] = useState(false);
  const colors = getThemeTokens(theme);

  function handleAddToCart() {
    addToCart?.(service);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className={`group flex h-[410px] flex-col overflow-hidden rounded-[28px] border hover:border-blue-500/30 theme-card-motion ${theme === 'dark' ? 'border-white/10 bg-[#0f0f0f]' : 'border-black/5 bg-white shadow-lg'}`} style={theme === 'dark' ? { backgroundColor: `${service.themeColor}10`, borderColor: `${service.themeColor}20` } : {}}>
      <div className="relative h-[200px] overflow-hidden" style={{ backgroundColor: theme === 'dark' ? `${service.themeColor}20` : service.lightColor }}>
        {service.img ? (
          <img
            src={service.img}
            alt={service.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.1]"
          />
        ) : null}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-white text-[9px] font-black uppercase tracking-widest">{service.badge}</span>
          </div>
          <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/30">
            <span className="text-white text-[9px] font-black uppercase tracking-widest">
              {service.availableToday ? "Available" : "Tomorrow"}
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-white text-[9px] font-black uppercase tracking-widest">{service.prosCount} Pros</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className={`line-clamp-1 text-lg font-black ${colors.text}`}>{service.name}</h3>
          <div className="shrink-0 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
            <span className="text-[10px] font-black text-amber-500">{service.rating}</span>
            <span className="text-amber-500 text-[8px]">★</span>
          </div>
        </div>

        <div className={`mb-2 text-xs font-black p-1.5 rounded-lg w-fit ${theme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-black/5 text-black/60'}`}>
          Starting from {formatPrice(service.price)}
        </div>
        <p className={`line-clamp-2 text-xs leading-relaxed font-medium ${colors.subtext}`}>{service.description}</p>

        <div className="mt-auto flex gap-3 pt-5">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); handleAddToCart(); }}
            className={`flex-1 rounded-xl border py-3 text-[10px] font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.secondaryButton}`}
          >
            {added ? "Added" : isInCart ? "In cart" : "+ Cart"}
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onBook(); }}
            className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.primaryButton}`}
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}
