import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

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

const PLACEHOLDER_BACKGROUNDS = [
  "linear-gradient(135deg, #0f4c81, #1d8db8)",
  "linear-gradient(135deg, #5f2c82, #49a09d)",
  "linear-gradient(135deg, #7b3f00, #d57a1f)",
  "linear-gradient(135deg, #374151, #111827)",
  "linear-gradient(135deg, #7f1d1d, #be123c)",
  "linear-gradient(135deg, #1f2937, #0f766e)",
];

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
  
  // Prioritize local fallback assets for a guaranteed premium look
  const image = FALLBACK_IMAGES[lookup] || row.image_url || `/Assets/${lookup.replace(/\s+/g, '-')}.png` || "/Assets/facility.png";

  return {
    service_id: row.service_id,
    name: serviceName,
    description:
      row.description || "Premium doorstep support delivered by verified professionals.",
    price: Number(row.price || 0),
    img: image,
    rating: (4.7 + ((index % 4) * 0.1)).toFixed(1),
    prosCount: 18 + index * 3,
    availableToday: index % 5 !== 4,
    badge: index % 2 === 0 ? "Popular" : "Fast response",
  };
}

export default function ServicesView({ addToCart, isInCart, setCurrentView, theme }) {
  const colors = {
    bg: theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f5f5f7]',
    text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
    subtext: theme === 'dark' ? 'text-white/35' : 'text-[#6e6e73]',
    cardBg: theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-[#ffffff]',
    border: theme === 'dark' ? 'border-white/10' : 'border-black/10',
    glass: theme === 'dark' ? 'bg-white/[0.03] border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]' : 'bg-white/90 border-black/5 shadow-md',
  };

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [toast, setToast] = useState("");

  const handleBookNow = (service) => {
    addToCart?.(service);
    if (setCurrentView) {
      setCurrentView("cart");
    } else {
      console.warn("setCurrentView prop is missing in ServicesView");
    }
  };

  async function fetchServices() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("service_id,name,description,price")
        .order("created_at", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

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

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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
    <div className={`relative min-h-screen ${colors.bg} px-6 py-12 ${colors.text} lg:px-24 transition-colors duration-500`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,113,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className={`text-4xl font-black tracking-[-0.04em] ${colors.text} sm:text-5xl lg:text-8xl premium-text`}>
              Services
            </h1>
          </div>
          <p className={`text-sm ${colors.subtext} font-bold uppercase tracking-widest`}>
            Premium Selection
          </p>
        </header>

        {loading && <LoadingState theme={theme} />}

        {!loading && error && <ErrorState onRetry={fetchServices} theme={theme} />}

        {!loading && !error && (
          <>
            {!!featuredServices.length && activeCategory === "All" && !searchQuery && (
              <FeaturedHero
                featuredServices={featuredServices}
                heroIndex={heroIndex}
                setHeroIndex={setHeroIndex}
                onBook={handleBookNow}
                theme={theme}
              />
            )}

            {filteredServices.length === 0 ? (
               <EmptyState onClear={clearFilters} theme={theme} />
            ) : (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service, index) => (
                  <ServiceCard
                    key={service.service_id}
                    service={service}
                    index={index}
                    addToCart={addToCart}
                    isInCart={Boolean(isInCart?.(service.service_id))}
                    onBook={() => handleBookNow(service)}
                    theme={theme}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[220] rounded-2xl border border-emerald-400/30 bg-[#0d1c14] px-5 py-4 text-sm font-medium text-emerald-200 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          {toast}
        </div>
      )}
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
  return (
    <section className={`flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white'} text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]`}>
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/12 bg-white/[0.04]' : 'border-black/5 bg-black/5'} text-2xl`}>
        !
      </div>
      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Could not load services</h2>
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/45' : 'text-black/45'}`}>Could not load services</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-full bg-[#4f7cff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6c90ff]"
      >
        Try again
      </button>
    </section>
  );
}

function EmptyState({ onClear, theme }) {
  return (
    <section className={`flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white'} text-center`}>
      <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>No matching services found</p>
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/45' : 'text-black/45'}`}>Try a different service name or clear the current filters.</p>
      <button
        type="button"
        onClick={onClear}
        className={`mt-6 rounded-full border ${theme === 'dark' ? 'border-white/15 text-white hover:bg-white/[0.05]' : 'border-black/15 text-black hover:bg-black/5'} px-5 py-3 text-sm transition`}
      >
        Clear all
      </button>
    </section>
  );
}

function FeaturedHero({ featuredServices, heroIndex, setHeroIndex, onBook, theme }) {
  return (
    <section className={`relative mb-10 overflow-hidden rounded-[32px] border ${theme === 'dark' ? 'border-white/10 bg-[#0a0d16]' : 'border-black/5 bg-white'} shadow-[0_40px_120px_rgba(0,0,0,0.55)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,124,255,0.24),transparent_26%),linear-gradient(120deg,rgba(255,255,255,0.03),transparent_45%)]" />

      <div className="relative min-h-[420px]">
        {featuredServices.map((service, index) => {
          const visible = index === heroIndex;

          return (
            <div
              key={service.service_id}
              className={`absolute inset-0 grid transition-opacity duration-700 md:grid-cols-[1.15fr_0.85fr] ${
                visible ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="flex flex-col justify-between p-8 md:p-10 lg:p-12">
                <div>
                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#4f7cff]/35 bg-[#4f7cff]/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9bb3ff]">
                      Featured
                    </span>
                    <span className={`rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/[0.05] text-white/65' : 'border-black/10 bg-black/5 text-black/60'} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]`}>
                      Houserve Premium
                    </span>
                  </div>

                   <p className={`mb-3 text-xs uppercase tracking-[0.45em] ${theme === 'dark' ? 'text-white/35' : 'text-black/40'}`}>
                    Starting from {formatPrice(service.price)}
                  </p>
                  <h2 className={`max-w-2xl text-4xl font-black leading-none tracking-[-0.05em] ${theme === 'dark' ? 'text-white' : 'text-black'} sm:text-5xl lg:text-[52px]`}>
                    {service.name}
                  </h2>
                   <p className={`mt-5 max-w-xl text-base leading-7 ${theme === 'dark' ? 'text-white/65' : 'text-black/60'}`}>
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onBook(service)}
                    className="rounded-full bg-[#4f7cff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6c90ff]"
                  >
                    Book now
                  </button>
                   <div className={`text-sm ${theme === 'dark' ? 'text-white/55' : 'text-black/50'}`}>
                    {service.prosCount}+ professionals available
                  </div>
                </div>
              </div>

              <div className="relative min-h-[240px] overflow-hidden">
                <img
                  src={service.img}
                  alt={service.name}
                  className="h-full w-full object-cover opacity-85"
                />
                <div className={`absolute inset-0 ${theme === 'dark' 
                  ? 'bg-[linear-gradient(180deg,transparent_10%,rgba(5,5,5,0.18)_55%,rgba(5,5,5,0.88)_100%)] md:bg-[linear-gradient(90deg,transparent_0%,rgba(5,5,5,0.12)_45%,rgba(5,5,5,0.78)_100%)]' 
                  : 'bg-[linear-gradient(180deg,transparent_10%,rgba(255,255,255,0.18)_55%,rgba(255,255,255,0.88)_100%)] md:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_45%,rgba(255,255,255,0.78)_100%)]'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {featuredServices.length > 1 && (
        <div className="absolute bottom-6 left-8 z-10 flex gap-2">
          {featuredServices.map((service, index) => (
            <button
              key={service.service_id}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === heroIndex ? "w-10 bg-[#4f7cff]" : "w-6 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show ${service.name}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ServiceCard({ service, index, addToCart, isInCart, onBook, theme }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart?.(service);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const background = PLACEHOLDER_BACKGROUNDS[index % PLACEHOLDER_BACKGROUNDS.length];

  return (
    <article className={`group flex h-[410px] flex-col overflow-hidden rounded-[28px] border ${theme === 'dark' ? 'border-white/10 bg-[#0f0f0f]' : 'border-black/5 bg-white'} shadow-[0_30px_70px_rgba(0,0,0,0.38)] transition hover:-translate-y-1 hover:border-blue-500/30`}>
      <div className="relative h-[200px] overflow-hidden">
        {service.img ? (
          <img
            src={service.img}
            alt={service.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background }}>
            <span className="text-6xl font-black uppercase text-white/25">
              {service.name.slice(0, 1)}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            {service.badge}
          </span>
        </div>

        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {service.prosCount} Pros
        </div>

        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {service.availableToday ? "Available today" : "Next-day slots"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className={`line-clamp-1 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{service.name}</h3>
          <div className="shrink-0 text-sm font-semibold text-amber-300">{service.rating}</div>
        </div>

         <div className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/50'}`}>{formatPrice(service.price)}</div>
        <p className={`line-clamp-1 text-sm leading-6 ${theme === 'dark' ? 'text-white/48' : 'text-black/45'}`}>{service.description}</p>

        <div className="mt-auto flex gap-3 pt-5">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 rounded-2xl border ${theme === 'dark' ? 'border-white/15 text-white hover:bg-white/[0.05]' : 'border-black/15 text-black hover:bg-black/5'} px-4 py-3 text-sm font-semibold transition`}
          >
            {added ? "Added" : isInCart ? "In cart" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={onBook}
            className="flex-1 rounded-2xl bg-[#4f7cff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6c90ff]"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}
