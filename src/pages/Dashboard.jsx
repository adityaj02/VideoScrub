import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

import ServiceSlider from "../components/services/ServiceSlider";
import ServiceGrid from "../components/services/ServiceGrid";
import ServiceModal from "../components/services/ServiceModal";
import CartSummary from "../components/cart/CartSummary";

import { SERVICES } from "../data/services";
import { BLOG_POSTS } from "../data/blogPosts";
import { TESTIMONIALS } from "../data/testimonials";

export default function Dashboard() {
  const [theme, setTheme] = useState('dark');
  const [activeIdx, setActiveIdx] = useState(0);
  const [location, setLocation] = useState(() => ("geolocation" in navigator ? "Detecting..." : "Delhi Hub"));
  const [cartItems, setCartItems] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // Now defaults directly to 'home' because Dashboard only runs authenticated!
  const [selectedService, setSelectedService] = useState(null);
  const [userInitials, setUserInitials] = useState('B');

  const detectLocationInstantly = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocation(data.address.city || data.address.town || data.address.suburb || "Delhi NCR");
        } catch {
          setLocation("New Delhi, IN");
        }
      },
      () => setLocation("Delhi Hub"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    detectLocationInstantly();
  }, []);



  useEffect(() => {
    const loadUserInitials = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const localName = localStorage.getItem(`profile_name:${user.id}`);
      const rawName = localName || user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'B';
      const initials = rawName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'B';

      setUserInitials(initials);
    };

    loadUserInitials();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      if (currentView === 'home') setActiveIdx((prev) => (prev + 1) % SERVICES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentView]);

  const toggleTheme = (e) => {
    e.stopPropagation();
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addToCart = (service) => {
    if (cartItems.some(item => item.id === service.id)) {
      setCurrentView('cart');
      return;
    }
    setCartItems(prev => [...prev, { ...service, cartId: Date.now() + Math.random() }]);
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const isInCart = (id) => cartItems.some(item => item.id === id);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#0b0b0c]' : 'bg-[#f5f5f7]',
    text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
    subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
    glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    cardText: theme === 'dark' ? 'text-white/60' : 'text-[#1d1d1f]/80',
    sidebarHover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5',
  };

  return (
    <>
      <style>{`
        .glass { backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); }
        .premium-text {
          background: ${theme === 'dark'
          ? 'linear-gradient(180deg, #ffffff 0%, #999999 100%)'
          : 'linear-gradient(180deg, #1d1d1f 0%, #4a4a4c 100%)'};
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em; padding: 0.2em 0.25em 0.35em 0.1em; margin: -0.2em -0.25em -0.35em -0.1em;
          display: inline-block; line-height: 1.1; overflow: visible; position: relative;
        }
        .service-card-active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        .service-card-hidden { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(20px); pointer-events: none; }
        .reflect-card { position: relative; overflow: hidden; border-width: 1px; }
        .reflect-card::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, ${theme === 'dark' ? '0.05' : '0.15'}) 50%, rgba(255, 255, 255, 0) 60%);
          transform: rotate(-45deg); animation: glint 10s infinite linear; pointer-events: none;
        }
        @keyframes glint { 0% { transform: translate(-30%, -30%) rotate(-45deg); } 12% { transform: translate(30%, 30%) rotate(-45deg); } 100% { transform: translate(30%, 30%) rotate(-45deg); } }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; border-radius: 10px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(155, 155, 155, 0.3); border-radius: 10px; }
      `}</style>
      
      <VideoBackground theme={theme} blur={25} />
      <ThreeScene theme={theme} />

      {/* Safety overlay */}
      <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", zIndex: -10, pointerEvents: "none"
      }} />

      <div className={`relative z-40 h-screen overflow-hidden flex flex-row ${colors.bg}`}>
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            cartItems={cartItems}
            theme={theme}
          />

          <div className="flex-1 h-screen overflow-y-auto relative bg-transparent ml-20 lg:ml-64 custom-scroll">
            <Navbar
              location={location}
              toggleTheme={toggleTheme}
              theme={theme}
              setCurrentView={setCurrentView}
              userInitials={userInitials}
            />

          {currentView === 'home' && (
            <>
              <ServiceSlider
                SERVICES={SERVICES}
                activeIdx={activeIdx}
                setActiveIdx={setActiveIdx}
                addToCart={addToCart}
                isInCart={isInCart}
                theme={theme}
              />

              <ServiceGrid
                SERVICES={SERVICES}
                addToCart={addToCart}
                isInCart={isInCart}
                setSelectedService={setSelectedService}
                theme={theme}
              />

              {/* WHY CHOOSE US */}
              <section id="why-us" className="px-6 lg:px-24 py-20 relative z-20 text-left border-t border-white/5 bg-white/5">
                <div className="max-w-7xl mx-auto text-left md:text-center mb-16">
                  <span className="glass px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold border border-white/10 mb-6 inline-block">Why Boysatwork</span>
                  <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible md:text-center">Why Choose Us?</h2>
                  <p className={`text-lg md:text-xl max-w-2xl mx-auto mt-6 font-medium ${colors.subtext} md:text-center`}>We're committed to delivering the best service experience in Delhi NCR</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { icon: '🛡️', title: 'Verified Pros', desc: 'Background checks and skill verification on all technicians.' },
                    { icon: '⏱️', title: 'On-Time', desc: 'Guaranteed arrival within the scheduled time slot.' },
                    { icon: '💎', title: 'Transparent', desc: 'No hidden charges. Know price upfront.' },
                    { icon: '💬', title: '24/7 Support', desc: 'Our technical team is always ready to assist you.' }
                  ].map((f, i) => (
                    <div key={i} className={`glass p-10 rounded-[48px] border ${colors.glass} flex flex-col items-center text-center hover:scale-[1.05] transition-all shadow-xl`}>
                      <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{f.icon}</div>
                      <h4 className={`text-xl font-black uppercase tracking-tight mb-4 ${colors.text}`}>{f.title}</h4>
                      <p className={`text-sm font-medium ${colors.cardText}`}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* VISION & MISSION */}
              <section id="about-experience" className="px-6 lg:px-24 py-24 relative z-20 border-t border-white/5 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className={`glass p-12 lg:p-20 rounded-[64px] border ${colors.glass} relative overflow-hidden group`}>
                    <span className="text-blue-500 text-[11px] uppercase tracking-[0.6em] font-black block mb-6">Our Vision</span>
                    <h3 className="text-4xl lg:text-5xl font-black premium-text tracking-tighter leading-tight mb-8 py-2 overflow-visible">Building a Trusted Future</h3>
                    <p className={`text-lg font-medium leading-relaxed mb-6 ${colors.text}`}>To become Delhi NCR's most trusted and preferred home services platform.</p>
                    <p className={`text-sm leading-relaxed ${colors.cardText}`}>To set the gold standard for quality, transparency, and customer satisfaction in the home services industry.</p>
                  </div>
                  <div className={`glass p-12 lg:p-20 rounded-[64px] border ${colors.glass} relative overflow-hidden group`}>
                    <span className="text-blue-500 text-[11px] uppercase tracking-[0.6em] font-black block mb-6">Our Mission</span>
                    <h3 className="text-4xl lg:text-5xl font-black premium-text tracking-tighter leading-tight mb-8 py-2 overflow-visible">Delivering Excellence</h3>
                    <p className={`text-lg font-medium leading-relaxed mb-6 ${colors.text}`}>To deliver exceptional home services through a network of background-verified professionals.</p>
                    <p className={`text-sm leading-relaxed ${colors.cardText}`}>We empower local skilled workers with fair wages and growth, creating a win-win ecosystem across Delhi NCR.</p>
                  </div>
                </div>
              </section>

              {/* BLOG PREVIEW */}
              <section className="px-6 lg:px-24 py-20 relative z-20 text-left border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div>
                    <span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-4`}>Technical Insights</span>
                    <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible text-left">From Our Blog</h2>
                  </div>
                  <button onClick={() => { setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-10 py-5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap">Explore All Insights →</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {BLOG_POSTS.slice(0, 2).map((post) => (
                    <div key={post.id} onClick={() => { setCurrentView(post.view); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className={`glass rounded-[56px] border ${colors.glass} overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all shadow-xl`}>
                      <div className="w-full h-72 overflow-hidden relative">
                        <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[8s]" alt={post.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-8 left-8 flex items-center gap-4"><span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10">{post.cat}</span></div>
                      </div>
                      <div className="p-10 lg:p-14 flex flex-col justify-center text-left">
                        <div className="flex items-center gap-3 mb-6 opacity-40 text-[10px] font-black uppercase tracking-widest"><span>{post.date}</span><span>•</span><span>{post.readTime}</span></div>
                        <h3 className="text-3xl lg:text-4xl font-black premium-text tracking-tighter leading-tight mb-8 py-2 overflow-visible group-hover:text-blue-500 transition-colors text-left">{post.title}</h3>
                        <div className="flex items-center gap-4 text-blue-500 font-black text-[12px] uppercase tracking-[0.4em] group-hover:gap-6 transition-all text-left">Read Detail <span className="text-xl">→</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* TESTIMONIALS */}
              <section id="testimonials" className="px-6 lg:px-24 py-24 relative z-20 text-left border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-1">
                    <span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-6`}>User Experiences</span>
                    <h2 className="text-5xl lg:text-6xl font-black premium-text tracking-tighter leading-[0.9] mb-12 py-2 overflow-visible">What Our Customers Say</h2>
                    <div className={`glass p-12 rounded-[56px] border ${colors.glass} shadow-xl`}>
                      <div className="flex items-end gap-4 mb-6">
                        <span className="text-7xl font-black">4.8</span>
                        <span className="text-3xl text-yellow-500 mb-2">★★★★★</span>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-40 mb-10 text-left">Based on 2,340 reviews</p>
                      <div className="space-y-5">
                        {[
                          { star: 5, pct: 78 }, { star: 4, pct: 15 }, { star: 3, pct: 5 }, { star: 2, pct: 1 }, { star: 1, pct: 1 }
                        ].map(r => (
                          <div key={r.star} className="flex items-center gap-4">
                            <span className="text-xs font-black w-4">{r.star}</span>
                            <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.pct}%` }} />
                            </div>
                            <span className="text-xs font-black opacity-40 w-8">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                      <div key={i} className={`glass p-10 rounded-[48px] border ${colors.glass} flex flex-col justify-between hover:bg-white/5 transition-all text-left shadow-md`}>
                        <p className={`text-lg font-medium leading-relaxed italic ${colors.text}`}>"{t.quote}"</p>
                        <div className="mt-10 flex items-center gap-5 border-t border-white/5 pt-8">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center font-black text-blue-500">{t.name.charAt(0)}</div>
                          <div className="text-left">
                            <h5 className="font-black text-base">{t.name}</h5>
                            <p className={`text-[10px] font-bold ${colors.subtext} uppercase tracking-widest mt-1`}>{t.loc} • {t.svc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FINAL CTA */}
              <section className="px-6 lg:px-24 py-24 relative z-20">
                <div className="glass p-16 lg:p-24 rounded-[64px] border border-blue-500/20 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-blue-600/[0.03] backdrop-blur-3xl" />
                  <div className="relative z-10 text-center">
                    <h2 className="text-5xl lg:text-9xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible mb-10 md:text-center">Ready to Book?</h2>
                    <p className={`text-xl lg:text-2xl font-medium max-w-2xl mx-auto mb-16 ${colors.text} md:text-center`}>Expert help for your home in just a few clicks. Same-day available.</p>
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-center">
                      <button onClick={() => setCurrentView('services')} className="w-full md:w-auto px-16 py-8 rounded-[32px] bg-white text-black text-[14px] font-black uppercase tracking-[0.5em] shadow-2xl hover:scale-[1.05] transition-all active:scale-95 text-center">Book Now</button>
                      <a href="tel:+919811797407" className={`text-xl font-black tracking-widest border-b-2 border-white/20 pb-2 hover:border-blue-500 transition-all ${colors.text} text-center`}>Call +91 9811797407</a>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {currentView === 'services' && (
            <section className="px-6 lg:px-24 py-20 relative z-20 text-left animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-7xl mx-auto mb-16 text-left">
                <span className={`text-[10px] md:text-[12px] uppercase tracking-[0.6em] ${colors.subtext} font-bold block mb-4`}>Repository</span>
                <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible text-left text-left">Services</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-20">
                {SERVICES.map((service) => (
                  <div key={service.id} className={`glass reflect-card p-8 lg:p-10 rounded-[48px] flex flex-col justify-between border transition-all duration-500 hover:scale-[1.02] ${colors.glass} ${isInCart(service.id) ? 'in-cart-highlight' : ''}`}>
                    <div className="text-left">
                      <div className="flex justify-between items-start mb-6 lg:mb-8 text-left">
                        <div className="w-20 lg:w-24 h-20 lg:h-24 rounded-3xl overflow-hidden bg-black shrink-0 shadow-lg border border-white/5 text-left"><img src={service.img} className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-110" alt={service.title} /></div>
                        <div className="text-right text-left"><div className={`text-xl font-black tracking-tighter ${colors.text} text-left`}>{service.rating} ★</div></div>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-black premium-text tracking-tighter mb-4 py-1 overflow-visible text-left text-left">{service.title}</h3>
                      <p className={`text-sm leading-relaxed mb-6 font-medium line-clamp-2 ${colors.cardText} text-left text-left`}>{service.desc}</p>
                      <button onClick={() => setSelectedService(service)} className={`text-[10px] uppercase tracking-[0.3em] font-black underline underline-offset-8 mb-8 transition-colors ${colors.text} hover:text-blue-500 block text-left text-left`}>Full Detail</button>
                    </div>
                    <button onClick={() => addToCart(service)} className={`w-full py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 ${isInCart(service.id) ? 'bg-blue-600 text-white shadow-blue-500/20' : (theme === 'dark' ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white shadow-sm')} text-center`}>{isInCart(service.id) ? 'View in Summary' : 'Add to Cart'}</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentView === 'blog' && (
            <div className="flex-grow flex flex-col py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-6xl mx-auto w-full text-left text-left text-left">
                <div className="mb-20 text-left text-left"><span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-6 text-left text-left`}>Knowledge Hub</span><h1 className="text-6xl lg:text-9xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible text-left text-left text-left">Our Blog</h1></div>
                <div className="space-y-16 text-left text-left text-left">
                  {BLOG_POSTS.map((post) => (
                    <div key={post.id} onClick={() => { setCurrentView(post.view); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className={`glass rounded-[64px] border ${colors.glass} overflow-hidden flex flex-col md:flex-row group cursor-pointer hover:scale-[1.01] transition-all shadow-xl text-left text-left`}>
                      <div className="w-full md:w-[40%] h-64 md:h-auto overflow-hidden shrink-0 text-left"><img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} /></div>
                      <div className="w-full md:w-[60%] p-12 lg:p-16 flex flex-col justify-center text-left text-left text-left">
                        <div className="flex items-center gap-5 mb-8 text-left text-left text-left"><span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 text-left text-left">{post.cat}</span><span className={`text-[10px] font-black uppercase tracking-widest ${colors.subtext} text-left`}>{post.date}</span></div>
                        <h2 className="text-4xl font-black premium-text tracking-tighter leading-tight mb-8 py-2 overflow-visible group-hover:text-blue-500 transition-colors text-left text-left text-left">{post.title}</h2>
                        <div className="flex items-center gap-4 text-blue-500 font-black text-[11px] uppercase tracking-[0.4em] text-left text-left">Full Review <span className="text-xl">→</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'plumbing-post' && (
            <div className="flex-grow flex flex-col py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-4xl mx-auto w-full">
                <button onClick={() => setCurrentView('blog')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-all text-left"><span>←</span> Back to Blog</button>
                <header className="mb-20 text-left">
                  <div className="flex items-center gap-6 mb-8 text-left"><span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-left">Plumbing</span><span className={`text-[11px] font-black uppercase tracking-widest ${colors.subtext} text-left`}>10 min read • Feb 20, 2026</span></div>
                  <h1 className="text-5xl lg:text-8xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible mb-12 text-left">Best Plumber in Lajpat Nagar – Fast, Reliable & Affordable</h1>
                </header>
                <article className={`space-y-12 text-lg lg:text-xl font-medium ${colors.cardText} text-left text-left`}>
                  <div className="rounded-[56px] overflow-hidden shadow-2xl mb-16 border border-white/5 text-left"><img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1200" className="w-full object-cover h-[500px]" alt="Plumbing" /></div>
                  <h2 className={`text-3xl lg:text-5xl font-black tracking-tighter ${colors.text} leading-tight text-left`}>Trusted Plumbing Experts Near You</h2>
                  <p>Finding the best plumber in Lajpat Nagar can be challenging. Whether it’s a minor tap repair or a complete pipeline installation, you need a professional who is skilled, punctual, and affordable.</p>
                  <div className={`p-10 rounded-[48px] border ${colors.glass} space-y-6 bg-blue-600/5 text-left`}>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-blue-500 mb-4 text-left">Industrial Checklist:</h3>
                    {['Leakage Repair', 'Bathroom Fitting', 'Kitchen RO Connection', 'Emergency Rapid Response'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-left"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" /><span>{item}</span></div>
                    ))}
                  </div>
                  <div className="mt-32 p-16 rounded-[64px] border border-blue-500/30 bg-blue-600/10 text-center">
                    <h2 className="text-4xl lg:text-6xl font-black premium-text tracking-tighter mb-8 py-2 overflow-visible">Need Technical Help?</h2>
                    <a href="tel:+919811797407" className="px-12 py-6 rounded-[32px] bg-white text-black font-black uppercase tracking-widest shadow-xl inline-block">Call +91 9811797407</a>
                  </div>
                </article>
              </div>
            </div>
          )}

          {currentView === 'deep-cleaning-post' && (
            <div className="flex-grow flex flex-col py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-4xl mx-auto w-full">
                <button onClick={() => setCurrentView('blog')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-all text-left"><span>←</span> Back to Blog</button>
                <header className="mb-20 text-left">
                  <div className="flex items-center gap-6 mb-8 text-left"><span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-left">Deep Cleaning</span><span className={`text-[11px] font-black uppercase tracking-widest ${colors.subtext} text-left`}>8 min read • Dec 15, 2025</span></div>
                  <h1 className="text-5xl lg:text-8xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible mb-12 text-left">Best Deep Cleaning Services in Delhi - Trusted Experts</h1>
                </header>
                <article className={`space-y-12 text-lg lg:text-xl font-medium ${colors.cardText} text-left text-left`}>
                  <div className="rounded-[56px] overflow-hidden shadow-2xl mb-16 border border-white/5 text-left"><img src="https://images.unsplash.com/photo-1581578731522-a204e14a2cd2?auto=format&fit=crop&q=80&w=1200" className="w-full object-cover h-[500px]" alt="Deep Cleaning" /></div>
                  <p>Living in Delhi means dealing with dust and pollution. Professional deep cleaning restores hygiene and air quality by tackling areas usually ignored: behind furniture, bathroom scrubbing, and kitchen grease removal.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {['Eco-friendly Products', 'Industrial Machines', 'Background Verified Staff', 'Transparent Quotes'].map((svc, i) => (
                      <div key={i} className={`p-8 rounded-[40px] border ${colors.glass} text-left font-black uppercase text-sm`}>{svc}</div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          )}

          {currentView === 'monsoon-post' && (
            <div className="flex-grow flex flex-col py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-4xl mx-auto w-full text-left">
                <button onClick={() => setCurrentView('blog')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-all text-left"><span>←</span> Back to Blog</button>
                <header className="mb-20 text-left">
                  <div className="flex items-center gap-6 mb-8 text-left"><span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-left">Home Maintenance</span><span className={`text-[11px] font-black uppercase tracking-widest ${colors.subtext} text-left`}>5 min read • Nov 20, 2025</span></div>
                  <h1 className="text-5xl lg:text-8xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible mb-12 text-left">Essential Maintenance for Delhi Monsoon Season</h1>
                </header>
                <article className={`space-y-12 text-lg lg:text-xl font-medium ${colors.cardText} text-left`}>
                  <div className="rounded-[56px] overflow-hidden shadow-2xl mb-16 border border-white/5 text-left"><img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" className="w-full object-cover h-[500px]" alt="Monsoon Maintenance" /></div>
                  <p>The monsoon season in Delhi brings relief but also poses challenges like roof leaks and electrical hazards. Proactive inspection saves thousands in repairs. Check roof cracks, unclog drainage, and waterproof exterior walls.</p>
                </article>
              </div>
            </div>
          )}

          {currentView === 'ac-post' && (
            <div className="flex-grow flex flex-col py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left text-left">
              <div className="max-w-4xl mx-auto w-full text-left">
                <button onClick={() => setCurrentView('blog')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60 hover:opacity-100 transition-all text-left"><span>←</span> Back to Blog</button>
                <header className="mb-20 text-left">
                  <div className="flex items-center gap-6 mb-8 text-left"><span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-left">AC Service</span><span className={`text-[11px] font-black uppercase tracking-widest ${colors.subtext} text-left`}>6 min read • Oct 10, 2025</span></div>
                  <h1 className="text-5xl lg:text-8xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible mb-12 text-left">Choosing the Right AC Provider in Delhi</h1>
                </header>
                <article className={`space-y-12 text-lg lg:text-xl font-medium ${colors.cardText} text-left text-left`}>
                  <div className="rounded-[56px] overflow-hidden shadow-2xl mb-16 border border-white/5 text-left"><img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200" className="w-full object-cover h-[500px]" alt="AC Service" /></div>
                  <p>With summers reaching 45+ degrees, functioning AC is essential. Certified technicians, transparent pricing, and service warranty are technical requirements for peace of mind.</p>
                </article>
              </div>
            </div>
          )}

          {currentView === 'cart' && (
            <CartSummary
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              theme={theme}
              setCurrentView={setCurrentView}
              userInitials={userInitials}
            />
          )}

          {/* Corporate Footer */}
          <footer id="footer-main" className={`glass p-12 lg:p-20 m-6 lg:mx-24 rounded-[56px] border ${colors.glass} relative z-20 mt-20 text-left shadow-2xl`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 text-left">
              <div className="lg:col-span-1 space-y-8 text-left text-left">
                <div className="text-3xl font-black premium-text tracking-tighter py-1 overflow-visible text-left text-left">Boysatwork.in</div>
                <p className={`text-sm leading-relaxed font-medium ${colors.cardText} text-left`}>Trusted partner for home services in Delhi NCR. Near Moolchand Metro Station. Industrial-grade technical solutions.</p>
              </div>
              <div className="space-y-6 text-left text-left">
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text} text-left`}>Our Services</h4>
                <ul className={`space-y-4 text-sm font-medium ${colors.cardText} text-left`}>
                  {SERVICES.slice(0, 5).map(s => <li key={s.id} onClick={() => { setCurrentView('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-500 transition-colors cursor-pointer text-left">{s.title}</li>)}
                </ul>
              </div>
              <div className="space-y-6 text-left text-left">
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text} text-left`}>Quick Navigation</h4>
                <ul className={`space-y-4 text-sm font-medium ${colors.cardText} text-left text-left`}>
                  {['Home', 'About Us', 'Blog'].map(l => <li key={l} className="hover:text-blue-500 transition-colors cursor-pointer text-left text-left" onClick={() => { if (l === 'Blog') setCurrentView('blog'); else if (l === 'Home') setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{l}</li>)}
                </ul>
              </div>
              <div className="space-y-6 text-left text-left">
                <h4 className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.text} text-left`}>Contact Hub</h4>
                <div className={`space-y-5 text-sm font-medium ${colors.cardText} text-left text-left`}>
                  <div className="flex gap-4 text-left text-left text-left">📍<span>9 Guru Nanak Market, New Delhi - 110024</span></div>
                  <div className="flex gap-4 text-left text-left text-left text-left">📞<span>+91 9811797407</span></div>
                </div>
              </div>
            </div>
            <div className="mt-24 pt-10 border-t border-white/5 text-center md:text-left text-left text-left">
              <span className={`text-[10px] uppercase tracking-widest ${colors.subtext} text-left`}>© 2026 Boysatwork.in. All rights reserved.</span>
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
