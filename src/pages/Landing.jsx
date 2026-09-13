import { useState, useEffect } from "react";
import "../styles/global.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { useAuth } from "../context/AuthContext";

export default function Landing({ initialLoginOpen = false }) {
  const [openLogin, setOpenLogin] = useState(initialLoginOpen);
  const [activeView, setActiveView] = useState("overview");
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const signOut = auth?.signOut;
  const user = auth?.user;

  useEffect(() => {
    setOpenLogin(initialLoginOpen);
  }, [initialLoginOpen]);

  if (activeView === "houserve") {
    return <Dashboard onBackToOneHome={() => setActiveView("overview")} />;
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white font-sans min-h-screen">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => setActiveView("overview")} className="flex items-center gap-3 text-slate-900 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">roofing</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">OneHome</span>
            </button>
            <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-slate-600">
              <button onClick={() => setActiveView("overview")} className={`transition-colors cursor-pointer ${activeView === "overview" ? "text-slate-950 font-bold border-b-2 border-slate-950 pb-0.5" : "hover:text-slate-950"}`}>Overview</button>
              <button onClick={() => setActiveView("houserve")} className={`transition-colors cursor-pointer ${activeView === "houserve" ? "text-slate-950 font-bold border-b-2 border-slate-950 pb-0.5" : "hover:text-slate-950"}`}>Houserve</button>
              <a href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 transition-colors cursor-pointer font-medium">BuildKart</a>
              <button onClick={() => { setActiveView("overview"); setTimeout(() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" }), 50); }} className="hover:text-slate-950 transition-colors cursor-pointer">Properties</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveView("houserve")} className="px-4 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5">
                  <span>Houserve Pro</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <button onClick={signOut} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors shadow-xs cursor-pointer">
                  Log out
                </button>
              </div>
            ) : (
              <button onClick={() => setOpenLogin(true)} className="px-4 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer">
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* 1. EDITORIAL HERO WITH TOP ARCHITECTURAL BANNER */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Dark Cinematic Architectural Banner */}
            <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-slate-950 shadow-sm border border-slate-800/40 flex items-center justify-center">
              <img alt="Atmospheric living interior with skyline" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity filter contrast-125 brightness-75 scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida/AEtjO1Vl4skS5Gr-0UFvkWfGcQ-45iHZJoSsoVG7Puye38CRfgmvv7nc6glAQ24obuATFuU_hLc4iTbi8rfoo2JP1EReuP_9_2-4vV19T4RKtoMrbW64NOWXnjNjExTKnGz79aI6ksyqoQ_GS9Zqlxzk8gVgo1ssAtDvyTWiwCAIaDzJ0IeDh1PVARF_OZldDK0D6KKYsPaJ-5HRBxTTS2KBxxypfKw-ZpF17lPoDagGqgisU3z9vk3prM1Nrz7O" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
              <div className="relative z-10 text-center px-6 max-w-2xl">
                <span className="inline-block text-[11px] tracking-[0.2em] font-medium text-slate-400 uppercase mb-3">Living Architecture & Lifecycle</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight">
                  OneHome
                </h1>
                <p className="mt-3 text-sm md:text-base text-slate-300 font-light max-w-lg mx-auto leading-relaxed">
                  A unified operating standard for modern residential management, architectural procurement, and verified property transactions.
                </p>
              </div>
            </div>
            {/* Clean Editorial Content Canvas */}
            <div className="w-full bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/70 shadow-sm">
              <div className="mb-6">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Principles
                </span>
              </div>
              <div className="max-w-4xl">
                <h2 className="text-2xl sm:text-3xl lg:text-[40px] leading-[1.25] font-display font-bold text-slate-900 tracking-[-0.02em]">
                  OneHome is built on a simple idea: <span className="text-slate-400 font-normal">property ownership should feel clear, not overwhelming.</span> We synchronize how spaces are maintained, supplied, and lived in.
                </h2>
              </div>
              {/* 3 Pristine Editorial White Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 lg:mt-16">
                {/* Card 1 */}
                <div className="group bg-white rounded-2xl p-7 lg:p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white mb-8 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">filter_center_focus</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-950 tracking-tight mb-2">Clarity</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500 font-normal">
                      Information and service schedules are organized with transparent upfront line-items, so you always clearly know what matters now.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-900">
                    <span className="text-slate-400">HouseServe Labor</span>
                    <button onClick={() => setActiveView("houserve")} className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 cursor-pointer">Master Trades →</button>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="group bg-white rounded-2xl p-7 lg:p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white mb-8 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-950 tracking-tight mb-2">Adaptability</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500 font-normal">
                      Renovation requirements evolve. Site materials, architectural batches, and deliveries adjust with it, not work against you.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-900">
                    <span className="text-slate-400">BuildCart Logistics</span>
                    <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Direct Supply →</span>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="group bg-white rounded-2xl p-7 lg:p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white mb-8 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-950 tracking-tight mb-2">Focus</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500 font-normal">
                      Everything works together under one title guarantee, legal audit, and escrow ledger, so you move through transactions without friction.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-900">
                    <span className="text-slate-400">Title Escrow</span>
                    <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Verified Portfolios →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CORE SERVICES: HOUSESERVE */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" id="services">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
            <div>
              <span className="inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Service Framework</span>
              <h3 className="text-2xl font-display font-bold text-slate-950 tracking-tight">Houserve™ Trades & Maintenance</h3>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0 font-normal">
              Background-cleared technicians, standardized rate cards, and a ₹25,000 property protection bond on every booking.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img alt="Professional floor sanitization" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src="/Assets/facility.png" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-md text-slate-800 border border-slate-200">Deep Sanitation</span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Whole-Home Architectural Scrub</h4>
                    <span className="text-xs font-semibold text-slate-950">₹3,499</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Hospital-grade multi-surface steam extraction, grout renewal, and microfiber detailing for luxury residences.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] text-slate-400">4.92 ★ (18,400+ jobs)</span>
                  <button onClick={() => setActiveView("houserve")} className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer">Book Now</button>
                </div>
              </div>
            </div>
            {/* Service Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img alt="HVAC diagnostics technician" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src="/Assets/ac-service.png" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-md text-slate-800 border border-slate-200">Climate & VRV</span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Inverter AC Deep Jet Overhaul</h4>
                    <span className="text-xs font-semibold text-slate-950">₹1,199</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Digital pressure testing, antibacterial coil foaming, and precision ampere checks for optimum cooling efficiency.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] text-slate-400">4.96 ★ (32,100+ jobs)</span>
                  <button onClick={() => setActiveView("houserve")} className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer">Book Now</button>
                </div>
              </div>
            </div>
            {/* Service Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img alt="Master plumbing and bathroom renovation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src="/Assets/plumbing.png" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-1 rounded-md text-slate-800 border border-slate-200">Hydraulics & Tile</span>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Concealed Plumbing & Waterproofing</h4>
                    <span className="text-xs font-semibold text-slate-950">₹2,800/pt</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    CPVC thermal pressure diagnostics, Kohler diverter fittings, and membrane leak protection guarantees.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[12px] text-slate-400">4.91 ★ (9,800+ jobs)</span>
                  <button onClick={() => setActiveView("houserve")} className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BUILDCART */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" id="procurement">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/70 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-slate-100 gap-4">
              <div>
                <span className="inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Direct Site Procurement</span>
                <h3 className="text-2xl font-display font-bold text-slate-950 tracking-tight">BuildKart™ Architectural Supply</h3>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-slate-500 font-medium">B2B Trade Pricing · Direct from Depot</span>
                <a className="text-xs font-semibold text-slate-950 hover:text-slate-600 flex items-center gap-1 cursor-pointer" href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer">Browse All (4,200+) →</a>
              </div>
            </div>
            {/* Logistics Hub Feature Banner */}
            <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 p-8 sm:p-10 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-semibold tracking-wide uppercase mb-3">
                    Hub Infrastructure
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3">
                    Direct warehousing in Bhiwandi & Greater Noida
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mb-6">
                    All high-yield sanitaryware, vitrified porcelain, and concealed wiring are inspected, palletized, and dispatched under scheduled jobsite windows.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Same-day site drop</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Zero batch mismatch</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Transit insurance included</span>
                  </div>
                </div>
                <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden">
                  <img alt="BuildKart warehouse" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida/AEtjO1U5Z2Zq3So5myMG9MLEAArot0zvc-gYNyDIZM5CYTywxbbe7LM1wK12Z32Bu_gvKPKfSnZzMsrumekm-cAtI5SdCY38DetZWjbOhcTIlNg_AwJLL3VgDEIZoOkPpCeYjgllChjF0uiRTsmxXVpY4Y9r0hirN7GwX-w_bShODuBvm8XY8ZlUWQYFTh4Y70jpHOXBHPI0YmgS41ymDXZwn9lii-9ukkUeaMWExupDnWseQ_pUQ3_nSTLQx7hs" />
                </div>
              </div>
            </div>
            {/* 4 Refined Product Cards Extracted from BuildKart.in */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Item 1 */}
              <div className="rounded-2xl p-5 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between bg-[#fcfdfe]">
                <div>
                  <div className="h-36 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
                    <span className="material-symbols-outlined text-[42px] text-slate-400">grid_view</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-800 border border-slate-200">-18%</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Masonry & Porcelain</span>
                  <h5 className="font-display font-bold text-slate-900 text-sm mt-1">Kajaria Vitrified Slabs 1200x600</h5>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-950">₹82 / sq.ft</span>
                    <span className="text-xs text-slate-400 line-through">₹100</span>
                  </div>
                </div>
                <a href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200 text-slate-900 text-xs font-semibold transition-all text-center block cursor-pointer">
                  Order on BuildKart →
                </a>
              </div>
              {/* Item 2 */}
              <div className="rounded-2xl p-5 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between bg-[#fcfdfe]">
                <div>
                  <div className="h-36 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
                    <span className="material-symbols-outlined text-[42px] text-slate-400">shower</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-800 border border-slate-200">-24%</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sanitary & Brass</span>
                  <h5 className="font-display font-bold text-slate-900 text-sm mt-1">Kohler Concealed 3-Way Diverter</h5>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-950">₹14,990</span>
                    <span className="text-xs text-slate-400 line-through">₹19,750</span>
                  </div>
                </div>
                <a href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200 text-slate-900 text-xs font-semibold transition-all text-center block cursor-pointer">
                  Order on BuildKart →
                </a>
              </div>
              {/* Item 3 */}
              <div className="rounded-2xl p-5 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between bg-[#fcfdfe]">
                <div>
                  <div className="h-36 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
                    <span className="material-symbols-outlined text-[42px] text-slate-400">format_paint</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-800 border border-slate-200">-15%</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Coatings</span>
                  <h5 className="font-display font-bold text-slate-900 text-sm mt-1">Asian Paints Royale Matt (20L)</h5>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-950">₹4,890</span>
                    <span className="text-xs text-slate-400 line-through">₹5,750</span>
                  </div>
                </div>
                <a href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200 text-slate-900 text-xs font-semibold transition-all text-center block cursor-pointer">
                  Order on BuildKart →
                </a>
              </div>
              {/* Item 4 */}
              <div className="rounded-2xl p-5 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between bg-[#fcfdfe]">
                <div>
                  <div className="h-36 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
                    <span className="material-symbols-outlined text-[42px] text-slate-400">bolt</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-800 border border-slate-200">-22%</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Conduit & Electric</span>
                  <h5 className="font-display font-bold text-slate-900 text-sm mt-1">Finolex FR-LSH Copper Wire 90m</h5>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-slate-950">₹1,180</span>
                    <span className="text-xs text-slate-400 line-through">₹1,510</span>
                  </div>
                </div>
                <a href="https://build-kart-in-is6v.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2 rounded-xl bg-white hover:bg-slate-950 hover:text-white border border-slate-200 text-slate-900 text-xs font-semibold transition-all text-center block cursor-pointer">
                  Order on BuildKart →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TURNKEY BUNDLE */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" id="bundle">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/70 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-wider uppercase mb-3">
                    Synchronized Blueprint
                  </span>
                  <h3 className="text-3xl font-display font-bold text-slate-950 tracking-tight">
                    Turnkey Master Bath Modernization
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We align BuildCart drops exactly 24 hours prior to master plumber arrival. No miscommunication, zero contractor downtime, and a clear itemized breakdown.
                  </p>
                </div>
                {/* Ledger Table */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 divide-y divide-slate-200/80 text-xs">
                  <div className="flex items-center justify-between pb-3 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <span>Synchronized Phase</span>
                    <span>Audited Allocation</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-800 font-medium">BuildCart Material Drop (Subway Porcelain, Kohler Brass, CPVC)</span>
                    <span className="font-semibold text-slate-950">₹58,200</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-800 font-medium">HouseServe Certified Trades (Tile Setting, Hydrostatic Pressure Test)</span>
                    <span className="font-semibold text-slate-950">₹46,800</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-slate-900 font-semibold">
                    <span className="text-slate-600">5-Year Waterproofing Escrow Bond</span>
                    <span className="text-emerald-700 font-bold">Included</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Total Turnkey Investment</span>
                    <span className="text-2xl font-display font-bold text-slate-950">₹1,05,000</span>
                    <span className="text-xs text-emerald-600 ml-2 font-medium">Saves ₹26,000 vs fragmented trades</span>
                  </div>
                  <button className="px-5 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">
                    Reserve Turnkey Window
                  </button>
                </div>
              </div>
              {/* Real Image Representation */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-80 lg:h-96">
                  <img alt="Modern site tile pallet and materials" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1UTQcnpMo7W0KfXkms6FJidMo2tVOj7pL3vfWgs1XbJyvXFUftznS8gTfPtKXSxQLMAnmY65gvTLXJiXvSkUVKdmrDOg14XSjkpObnahSZh2MCRoAC2R3_Tes5-wODqyxKny9soaOuBDGBTn6UTzWzQvYOrYJ3kXcZy8J4UDxRNawwgPd7-CfVx5n3WI4_R7VxNE1F0Xytt810yTK1CR82RcfW_8cozldKNXP-gcmSt6Bxw8HwE-lLflIKh" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Subway & Architectural Brass Spec</span>
                      <span className="text-slate-500 text-[11px]">Turnaround: 6 calibrated working days</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-950 text-[20px]">task_alt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VERIFIED PROPERTIES PORTFOLIO */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" id="portfolio">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
            <div>
              <span className="inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Title-Audited Portfolios</span>
              <h3 className="text-2xl font-display font-bold text-slate-950 tracking-tight">Verified Properties</h3>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0 font-normal">
              Zero brokerage on direct seller listings, 30-step title auditing, and digital escrow closure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Property 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <div className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTLfZW_RhrYBbdGpBnosy-Jc9Ba2uogT4ePg9zzwRZlTu5UBWRIhNsbvbtaQikTe-AjCcTOiJVPt04E5k6vv6iazWfzONmWxG3vQB4-KpvO5amX2cR8MzhMyktX6cWw_zyYjOnflddu6tvZE-BxxQHOHUKe5eikAMitw7qT6MNllUjul042LhrgThMPR1BomJ7IhKGPaklOxw2SVWquQr_ZtsQIKWIy1bg_yUXmcUrH8gD3HdeQW1GUQ")` }}></div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-slate-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded">Verified Title</span>
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">DLF Phase 5</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-display font-bold text-sm">
                    ₹1.85 Cr
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-display font-bold text-slate-900 text-base">3 BHK Skyline High-Rise</h4>
                  <p className="text-xs text-slate-500 mt-1">Gurugram, Golf Course Extension corridor</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                    <span>3 Bed</span>·<span>3 Bath</span>·<span>1,820 sq.ft</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-950 text-[16px]">check_circle</span>
                  <span>Includes pre-move HouseServe deep seal warranty.</span>
                </div>
              </div>
            </div>
            {/* Property 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <div className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAq_H19Ic4d-I7JNglHDcl84blKpSfPWrW5baK1Yyo52qmPIIpu-YLpNTOhytrBVccYvLpR8tYF12K4bSufhGrQSzHmpqTgoVSGnOXtnv1ZGzgBCXcV0rGRREg1NrB2dRDyvYnkRKQZB83SGaJP-b0MUffZw8Y_1JHTq64P-fpvbfB7a_L7cyVmlMMZAQ4fb9o7_1U4K-oqwcMEn--0FkrlyHt7P81uZD7QFCDDeP2gh-p5AKdrja-esA")` }}></div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-slate-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded">Verified Title</span>
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">Whitefield</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-display font-bold text-sm">
                    ₹3.49 Cr
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-display font-bold text-slate-900 text-base">4 BHK Architectural Villa</h4>
                  <p className="text-xs text-slate-500 mt-1">Bengaluru, Palm Greens Enclave</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                    <span>4 Bed</span>·<span>4 Bath</span>·<span>3,200 sq.ft</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-950 text-[16px]">check_circle</span>
                  <span>Pre-engineered with BuildCart solar micro-grid.</span>
                </div>
              </div>
            </div>
            {/* Property 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <div className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1BXYCckQaUpkHziQp8mKRFJpUbRygOtuFTZjx3V84l3q4WAywvvWJqB6Q4rwoKY99FhN_17YE7XCI_-HN6Yd8GrnDBt8u4J_LvktFkiqjkzQ0r5pyf5rP3R1mBPMVNEX4TG1WVUJFD_CMQqCF6wbZSi8E3wB_XK8Qomly3hx-02jMvb0qPXYcs0-Ll4E9-xdWci0QWpMFbghoPpPztxtrvsTpNTqodfX7afacsFAFKG-PuqNZcKN52Q")` }}></div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-slate-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded">Verified Title</span>
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">Kharadi</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-display font-bold text-sm">
                    ₹89.00 L
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-display font-bold text-slate-900 text-base">2 BHK Executive Urban Condo</h4>
                  <p className="text-xs text-slate-500 mt-1">Pune, EON Free Zone Avenue</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                    <span>2 Bed</span>·<span>2 Bath</span>·<span>1,140 sq.ft</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-950 text-[16px]">check_circle</span>
                  <span>Digital escrow tenure with immediate registration.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. KEY TRUST METRICS STRIP */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/70 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">1.2M+</div>
                <div className="text-xs font-semibold text-slate-900 mt-1">Properties Managed</div>
                <div className="text-xs text-slate-500 mt-0.5">Across 18 Tier-1 metro centers</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">45,000+</div>
                <div className="text-xs font-semibold text-slate-900 mt-1">Certified Master Trades</div>
                <div className="text-xs text-slate-500 mt-0.5">Audited skill credentials</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">99.4%</div>
                <div className="text-xs font-semibold text-slate-900 mt-1">Guaranteed SLA</div>
                <div className="text-xs text-slate-500 mt-0.5">On-time dispatch or credit</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">₹0</div>
                <div className="text-xs font-semibold text-slate-900 mt-1">Owner Commission</div>
                <div className="text-xs text-slate-500 mt-0.5">Completely zero broker markup</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. EDITORIAL CALL TO ACTION */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <div className="relative rounded-3xl bg-slate-950 overflow-hidden text-center p-12 sm:p-20 shadow-xl border border-slate-800">
            <img alt="Background interior architecture" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity filter contrast-125 brightness-50" src="https://lh3.googleusercontent.com/aida/AEtjO1Vl4skS5Gr-0UFvkWfGcQ-45iHZJoSsoVG7Puye38CRfgmvv7nc6glAQ24obuATFuU_hLc4iTbi8rfoo2JP1EReuP_9_2-4vV19T4RKtoMrbW64NOWXnjNjExTKnGz79aI6ksyqoQ_GS9Zqlxzk8gVgo1ssAtDvyTWiwCAIaDzJ0IeDh1PVARF_OZldDK0D6KKYsPaJ-5HRBxTTS2KBxxypfKw-ZpF17lPoDagGqgisU3z9vk3prM1Nrz7O" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60"></div>
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium uppercase tracking-wider mb-4 border border-white/10">
                Start Today
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4">
                Experience effortless homeownership.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed mb-8 max-w-lg">
                From emergency repairs to complete turnkey transformations, unify your entire property footprint on OneHome.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button onClick={() => isAuthenticated ? setActiveView("houserve") : setOpenLogin(true)} className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-sm cursor-pointer">
                  {isAuthenticated ? "Launch Houserve →" : "Get Started →"}
                </button>
                <a className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors border border-white/10" href="#portfolio">
                  Speak with Concierge
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CLEAN EDITORIAL FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-white pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[16px]">roofing</span>
                </div>
                <span className="font-display font-bold text-base text-slate-950">OneHome</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Unified property ecosystem syncing certified mechanical labor, architectural procurement, and authenticated title transfers across modern Indian metros.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">Ecosystem</h5>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><a className="hover:text-slate-950 transition-colors" href="#services">HouseServe™ Labor</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#procurement">BuildCart™ Depot</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#portfolio">Verified Properties</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#bundle">Turnkey Bundles</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">Legal & Trust</h5>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><a className="hover:text-slate-950 transition-colors" href="#">Escrow Guarantee</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#">Title Audit Process</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#">Terms of Platform</a></li>
                <li><a className="hover:text-slate-950 transition-colors" href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">Coverage Hubs</h5>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><span>Delhi NCR & Gurugram</span></li>
                <li><span>Bengaluru Urban</span></li>
                <li><span>Mumbai & MMR</span></li>
                <li><span>Pune Metropolis</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <span>© 2025 OneHome Technologies Pvt. Ltd. Minimal editorial architecture.</span>
            <div className="flex items-center gap-6">
              <a className="hover:text-slate-600 transition-colors" href="#">Status</a>
              <a className="hover:text-slate-600 transition-colors" href="#">Security</a>
              <a className="hover:text-slate-600 transition-colors" href="#">Concierge</a>
            </div>
          </div>
        </div>
      </footer>

      {openLogin && <Login close={() => setOpenLogin(false)} />}
    </div>
  );
}
