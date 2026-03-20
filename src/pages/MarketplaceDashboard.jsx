import { useState, useEffect } from "react";

/* ─── DATA ─────────────────────────────────────────────────── */
const SERVICES = [
  {
    id: 1,
    title: "AC Service & Repair",
    desc: "Deep clean, gas refill & full diagnostics by certified technicians.",
    category: "Cooling",
    basePrice: 499,
    tiers: { inspection: 199, service: 799, full: 1499 },
    rating: 4.8,
    reviews: 1240,
    duration: "60–90 mins",
    distance: "2.1 km",
    badge: "Top Rated",
    emoji: "❄️",
    tags: ["AC Repair", "Cooling"],
  },
  {
    id: 2,
    title: "Plumbing Solutions",
    desc: "Leak fixes, pipe work & bathroom fittings by verified plumbers.",
    category: "Plumbing",
    basePrice: 349,
    tiers: { inspection: 149, service: 549, full: 999 },
    rating: 4.7,
    reviews: 876,
    duration: "45–75 mins",
    distance: "1.4 km",
    badge: "Quick Fix",
    emoji: "🔧",
    tags: ["Plumbing", "Repair"],
  },
  {
    id: 3,
    title: "Electrical Repairs",
    desc: "Wiring, switchboards, MCBs & fixture installations by certified pros.",
    category: "Electrical",
    basePrice: 299,
    tiers: { inspection: 99, service: 499, full: 899 },
    rating: 4.9,
    reviews: 2103,
    duration: "30–60 mins",
    distance: "0.8 km",
    badge: "Most Booked",
    emoji: "⚡",
    tags: ["Electrical", "Wiring"],
  },
  {
    id: 4,
    title: "Deep Home Cleaning",
    desc: "Full home sanitisation — floors, kitchen, bathrooms & more.",
    category: "Cleaning",
    basePrice: 799,
    tiers: { inspection: 299, service: 1199, full: 2499 },
    rating: 4.6,
    reviews: 654,
    duration: "2–4 hrs",
    distance: "3.2 km",
    badge: "Best Value",
    emoji: "🧹",
    tags: ["Cleaning", "Sanitisation"],
  },
  {
    id: 5,
    title: "Appliance Repair",
    desc: "Washing machine, fridge, microwave & more — doorstep repair.",
    category: "Appliances",
    basePrice: 399,
    tiers: { inspection: 149, service: 649, full: 1199 },
    rating: 4.7,
    reviews: 923,
    duration: "60–120 mins",
    distance: "1.9 km",
    badge: "Guaranteed",
    emoji: "🔌",
    tags: ["Appliances", "Repair"],
  },
  {
    id: 6,
    title: "Painting & Décor",
    desc: "Interior walls, textures & waterproofing with premium paints.",
    category: "Painting",
    basePrice: 1299,
    tiers: { inspection: 399, service: 2499, full: 4999 },
    rating: 4.5,
    reviews: 412,
    duration: "4–8 hrs",
    distance: "4.0 km",
    badge: "Premium",
    emoji: "🎨",
    tags: ["Painting", "Décor"],
  },
];

const CATEGORIES = ["All", "Cooling", "Plumbing", "Electrical", "Cleaning", "Appliances", "Painting"];

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: "⊞" },
  { id: "services", label: "Services", icon: "⚙" },
  { id: "blog",     label: "Blog",     icon: "✦" },
  { id: "cart",     label: "Cart",     icon: "🛒" },
];

/* ─── HELPERS ───────────────────────────────────────────────── */
const stars = (n) => "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "");

/* ─── COMPONENTS ────────────────────────────────────────────── */

function Sidebar({ view, setView, cartCount }) {
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 72,
      background: "rgba(8,12,28,0.96)", borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 28, gap: 8, zIndex: 100,
      backdropFilter: "blur(24px)",
    }}>
      {/* Logo */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: "linear-gradient(135deg,#1e6eff,#0a3bcc)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 24,
        boxShadow: "0 0 18px rgba(30,110,255,0.5)",
      }}>B</div>

      {NAV_ITEMS.map(item => {
        const active = view === item.id;
        return (
          <button key={item.id} onClick={() => setView(item.id)}
            title={item.label}
            style={{
              position: "relative", width: 48, height: 48, borderRadius: 14, border: "none",
              background: active ? "rgba(30,110,255,0.18)" : "transparent",
              color: active ? "#4d9fff" : "rgba(255,255,255,0.38)",
              fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            {active && (
              <span style={{
                position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                width: 3, height: 24, background: "#1e6eff", borderRadius: "0 4px 4px 0",
              }} />
            )}
            {item.icon}
            {item.id === "cart" && cartCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6, background: "#1e6eff",
                color: "#fff", fontSize: 9, fontWeight: 900,
                borderRadius: 99, minWidth: 16, height: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px",
              }}>{cartCount}</span>
            )}
          </button>
        );
      })}
    </aside>
  );
}

function Topbar({ view, setView }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 90,
      background: "rgba(5,8,20,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: 60,
    }}>
      <nav style={{ display: "flex", gap: 6 }}>
        {["services","blog","about"].map(k => (
          <button key={k} onClick={() => setView(k)}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 14px",
              borderRadius: 8, textTransform: "capitalize", transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
          >{k}</button>
        ))}
      </nav>
      <button style={{
        background: "linear-gradient(135deg,#1e6eff,#0a3bcc)",
        color: "#fff", border: "none", borderRadius: 99, padding: "9px 22px",
        fontSize: 13, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 0 18px rgba(30,110,255,0.4)", transition: "transform 0.15s, box-shadow 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(30,110,255,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 18px rgba(30,110,255,0.4)"; }}
      >Get Started</button>
    </header>
  );
}

function ProfileCard({ cart, setView }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 24, padding: "24px 28px", marginBottom: 24,
      backdropFilter: "blur(20px)", display: "flex", gap: 24,
      alignItems: "center", flexWrap: "wrap",
    }}>
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg,#1e6eff,#7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 900, color: "#fff",
          boxShadow: "0 0 24px rgba(30,110,255,0.4)",
        }}>V</div>
        <span style={{
          position: "absolute", bottom: 2, right: 2, width: 14, height: 14,
          background: "#22c55e", borderRadius: "50%", border: "2px solid #080c1c",
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Welcome back</p>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "4px 0 6px", letterSpacing: "-0.02em" }}>Vishnu Nair</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          <span>📍</span><span>New Delhi, India</span>
        </div>
      </div>

      {/* Stats */}
      {[
        { label: "Orders", value: 12 },
        { label: "Cart", value: cart, action: () => setView("cart") },
        { label: "Saved", value: 5 },
      ].map(s => (
        <div key={s.label} onClick={s.action}
          style={{
            textAlign: "center", padding: "12px 20px", borderRadius: 16,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
            cursor: s.action ? "pointer" : "default", transition: "background 0.2s",
          }}
          onMouseEnter={e => { if (s.action) e.currentTarget.style.background = "rgba(30,110,255,0.12)"; }}
          onMouseLeave={e => { if (s.action) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        >
          <p style={{ color: "#4d9fff", fontSize: 22, fontWeight: 900, margin: 0 }}>{s.value}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
        </div>
      ))}

      {/* Edit */}
      <button style={{
        background: "rgba(30,110,255,0.14)", border: "1px solid rgba(30,110,255,0.3)",
        color: "#4d9fff", borderRadius: 12, padding: "10px 20px",
        fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(30,110,255,0.26)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(30,110,255,0.14)"}
      >Edit Profile</button>
    </div>
  );
}

function SearchFilterBar({ search, setSearch, category, setCategory, minRating, setMinRating }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: "18px 24px", marginBottom: 28,
      backdropFilter: "blur(16px)", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center",
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 240px" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.4 }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search for services…"
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "11px 14px 11px 42px", color: "#fff", fontSize: 14,
            outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(30,110,255,0.6)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Category */}
      <select value={category} onChange={e => setCategory(e.target.value)} style={{
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 600,
        cursor: "pointer", outline: "none",
      }}>
        {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "#0a0f24" }}>{c}</option>)}
      </select>

      {/* Rating filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Min ★</span>
        {[0, 4, 4.5, 4.8].map(r => (
          <button key={r} onClick={() => setMinRating(r)}
            style={{
              background: minRating === r ? "rgba(30,110,255,0.25)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${minRating === r ? "rgba(30,110,255,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: minRating === r ? "#4d9fff" : "rgba(255,255,255,0.5)",
              borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >{r === 0 ? "All" : r + "+"}</button>
        ))}
      </div>

      {/* Availability toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }}>Available now</span>
        <div style={{
          width: 40, height: 22, borderRadius: 11, background: "rgba(30,110,255,0.6)",
          cursor: "pointer", position: "relative",
        }}>
          <div style={{
            position: "absolute", right: 2, top: 2, width: 18, height: 18,
            borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ svc, onAddToCart, inCart }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(svc);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.04)", border: `1px solid ${hovered ? "rgba(30,110,255,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 20, overflow: "hidden", transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-4px) scale(1.018)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(30,110,255,0.18), 0 0 0 1px rgba(30,110,255,0.2)" : "none",
        display: "flex", flexDirection: "column",
      }}>

      {/* Image / visual header */}
      <div style={{
        height: 120, background: `linear-gradient(135deg, rgba(30,110,255,0.15), rgba(124,58,237,0.12))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 52, position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {svc.emoji}
        {svc.badge && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(30,110,255,0.85)", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 99,
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>{svc.badge}</span>
        )}
      </div>

      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Title + desc */}
        <div>
          <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>{svc.title}</h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "5px 0 0", lineHeight: 1.5 }}>{svc.desc}</p>
        </div>

        {/* Pricing */}
        <div style={{
          background: "rgba(30,110,255,0.08)", border: "1px solid rgba(30,110,255,0.18)",
          borderRadius: 12, padding: "10px 14px",
        }}>
          <p style={{ color: "#4d9fff", fontSize: 18, fontWeight: 900, margin: 0 }}>
            Starting from <span style={{ color: "#fff" }}>₹{svc.basePrice}</span>
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Inspection ₹{svc.tiers.inspection}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Full Service ₹{svc.tiers.full}</span>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: "#facc15", fontSize: 12, fontWeight: 700 }}>
            ★ {svc.rating}
            <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}> ({svc.reviews.toLocaleString()})</span>
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>⏱ {svc.duration}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>📍 {svc.distance}</span>
        </div>

        {/* Trust signal */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#22c55e", fontSize: 11 }}>✔ Verified Pro</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>1000+ completed</span>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
          <button style={{
            flex: 1, background: "linear-gradient(135deg,#1e6eff,#0a3bcc)",
            color: "#fff", border: "none", borderRadius: 10, padding: "10px 0",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            boxShadow: hovered ? "0 4px 20px rgba(30,110,255,0.5)" : "none",
            transition: "all 0.18s",
          }}>Book Now</button>
          <button onClick={handleAdd} style={{
            flex: 1,
            background: added ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${added ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: added ? "#22c55e" : "rgba(255,255,255,0.7)",
            borderRadius: 10, padding: "10px 0",
            fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.18s",
          }}>{added ? "✔ Added" : inCart ? "In Cart" : "Add to Cart"}</button>
        </div>
      </div>
    </div>
  );
}

function FloatingCart({ count, onClick }) {
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <button onClick={onClick} style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 200,
      width: 60, height: 60, borderRadius: "50%",
      background: "linear-gradient(135deg,#1e6eff,#0a3bcc)",
      border: "none", color: "#fff", fontSize: 24, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 32px rgba(30,110,255,0.5)",
      transform: bump ? "scale(1.22)" : "scale(1)",
      transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(30,110,255,0.7)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(30,110,255,0.5)"}
    >
      🛒
      {count > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 900,
          borderRadius: 99, minWidth: 20, height: 20, padding: "0 5px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #080c1c",
        }}>{count}</span>
      )}
    </button>
  );
}

function StatusBanner({ onDismiss }) {
  return (
    <div style={{
      background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)",
      borderRadius: 12, padding: "10px 18px", marginBottom: 24,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ color: "rgba(234,179,8,0.85)", fontSize: 13 }}>
        ⚠ Showing offline services. Some updates may be delayed.
      </span>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 16, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

function CartView({ cart, onRemove }) {
  const total = cart.reduce((s, i) => s + i.basePrice, 0);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 24 }}>Your Cart</h2>
      {cart.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.35)",
        }}>Your cart is empty. Browse services to add something!</div>
      ) : (
        <>
          {cart.map(svc => (
            <div key={svc.id} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "16px 20px", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ fontSize: 32 }}>{svc.emoji}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 800, margin: 0 }}>{svc.title}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "4px 0 0" }}>{svc.duration}</p>
              </div>
              <p style={{ color: "#4d9fff", fontWeight: 900, fontSize: 18 }}>₹{svc.basePrice}</p>
              <button onClick={() => onRemove(svc.id)} style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#ef4444", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
              }}>Remove</button>
            </div>
          ))}
          <div style={{
            background: "rgba(30,110,255,0.1)", border: "1px solid rgba(30,110,255,0.25)",
            borderRadius: 16, padding: "20px 24px", marginTop: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Total</span>
            <span style={{ color: "#4d9fff", fontSize: 24, fontWeight: 900 }}>₹{total}</span>
          </div>
          <button style={{
            width: "100%", marginTop: 16,
            background: "linear-gradient(135deg,#1e6eff,#0a3bcc)",
            color: "#fff", border: "none", borderRadius: 14, padding: "16px",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(30,110,255,0.4)",
          }}>Confirm Booking →</button>
        </>
      )}
    </div>
  );
}

/* ─── MAIN DASHBOARD ────────────────────────────────────────── */
export default function MarketplaceDashboard() {
  const [view, setView]           = useState("home");
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [cart, setCart]           = useState([]);
  const [banner, setBanner]       = useState(true);

  const addToCart = (svc) => {
    setCart(prev => prev.find(i => i.id === svc.id) ? prev : [...prev, svc]);
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const filtered = SERVICES.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = category === "All" || s.category === category;
    const matchRating = s.rating >= minRating;
    return matchSearch && matchCat && matchRating;
  });

  const recommended = SERVICES.filter(s => s.rating >= 4.7).slice(0, 3);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050814 0%, #080c1c 60%, #060a19 100%)",
      color: "#fff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: "fixed", top: -200, left: "25%", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,110,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: -100, right: "10%", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <Sidebar view={view} setView={setView} cartCount={cart.length} />

      <div style={{ marginLeft: 72, position: "relative", zIndex: 1 }}>
        <Topbar view={view} setView={setView} />

        <main style={{ padding: "32px 40px", maxWidth: 1280, margin: "0 auto" }}>

          {/* ── HOME / SERVICES VIEW ── */}
          {(view === "home" || view === "services") && (
            <>
              {/* Profile Card */}
              <ProfileCard cart={cart.length} setView={setView} />

              {/* Status Banner */}
              {banner && <StatusBanner onDismiss={() => setBanner(false)} />}

              {/* Search & Filters */}
              <SearchFilterBar
                search={search} setSearch={setSearch}
                category={category} setCategory={setCategory}
                minRating={minRating} setMinRating={setMinRating}
              />

              {/* Recommended */}
              {view === "home" && (
                <section style={{ marginBottom: 48 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
                    <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>
                      ✨ Recommended for You
                    </h2>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Based on your area</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                    {recommended.map(svc => (
                      <ServiceCard key={svc.id} svc={svc} onAddToCart={addToCart} inCart={cart.some(i => i.id === svc.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Trust signals strip */}
              <div style={{
                display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36,
                background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "16px 20px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { icon: "✅", text: "1000+ services completed" },
                  { icon: "🛡️", text: "Verified professionals" },
                  { icon: "⭐", text: "4.8 average rating" },
                  { icon: "⚡", text: "Same-day booking" },
                  { icon: "💬", text: "24/7 support" },
                ].map(t => (
                  <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600 }}>
                    <span>{t.icon}</span><span>{t.text}</span>
                  </div>
                ))}
              </div>

              {/* All Services */}
              <section>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>
                    🔧 Available Services
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 500, marginLeft: 10 }}>({filtered.length})</span>
                  </h2>
                </div>

                {filtered.length === 0 ? (
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.3)",
                  }}>No services match your filters. Try adjusting the search or category.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                    {filtered.map(svc => (
                      <ServiceCard key={svc.id} svc={svc} onAddToCart={addToCart} inCart={cart.some(i => i.id === svc.id)} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ── CART VIEW ── */}
          {view === "cart" && (
            <CartView cart={cart} onRemove={removeFromCart} />
          )}

          {/* ── BLOG / ABOUT ── */}
          {(view === "blog" || view === "about") && (
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: "48px", textAlign: "center",
            }}>
              <h2 style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}>
                {view === "blog" ? "📝 Blog" : "ℹ️ About"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 12, fontSize: 16 }}>
                {view === "blog" ? "Service tips, home maintenance guides & expert advice coming soon." : "Boys@Work — Delhi's most trusted home services platform."}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Floating Cart */}
      <FloatingCart count={cart.length} onClick={() => setView("cart")} />
    </div>
  );
}
