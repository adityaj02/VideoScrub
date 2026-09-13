const DARK_MODE = "dark";
const LIGHT_MODE = "light";

export const DASHBOARD_FILTERS = [
  { value: "All services", label: "All services" },
  { value: "Nearby", label: "Nearby" },
  { value: "Top rated", label: "Top rated" },
  { value: "Available today", label: "Available today" },
  { value: "Under 500", label: "Under Rs 500" },
];

const FILTER_ALIASES = new Map([
  ["all", "All services"],
  ["all services", "All services"],
  ["nearby", "Nearby"],
  ["top", "Top rated"],
  ["top rated", "Top rated"],
  ["available", "Available today"],
  ["available today", "Available today"],
  ["today only", "Available today"],
  ["under", "Under 500"],
  ["under 500", "Under 500"],
  ["under rs 500", "Under 500"],
  ["budget", "Under 500"],
]);

export function resolveThemeMode(theme) {
  return theme === DARK_MODE ? DARK_MODE : LIGHT_MODE;
}

export function normalizeDashboardFilter(value) {
  const normalizedKey = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return FILTER_ALIASES.get(normalizedKey) || "All services";
}

export function getThemeTokens(theme) {
  const mode = resolveThemeMode(theme);
  const isDark = mode === DARK_MODE;

  return {
    mode,
    isDark,

    // ── Backgrounds ──
    bg: isDark ? "bg-warm-950" : "bg-[#f7f9fb]",
    navBg: isDark ? "bg-warm-950/85" : "bg-[#f7f9fb]/90 backdrop-blur-xl",
    modalBg: isDark ? "bg-warm-950" : "bg-white",

    // ── Text ──
    text: isDark ? "text-warm-200" : "text-[#191c1e]",
    subtext: isDark ? "text-warm-500" : "text-[#45464d]",
    cardText: isDark ? "text-warm-300" : "text-[#45464d]",
    faintText: isDark ? "text-warm-600" : "text-[#76777d]",

    // ── Glass & Cards ──
    glass: isDark
      ? "bg-white/[0.06] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      : "bg-white border-[#f1f5f9] shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_10px_24px_-6px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.06)] transition-all",
    panel: isDark
      ? "bg-white/[0.04] border-white/8"
      : "bg-[#f2f4f6] border-[#e2e8f0]",
    panelStrong: isDark
      ? "bg-white/[0.06] border-white/10"
      : "bg-white border-[#e2e8f0]",

    // ── Borders ──
    border: isDark ? "border-white/10" : "border-[#e2e8f0]",
    softBorder: isDark ? "border-white/5" : "border-[#f1f5f9]",

    // ── Hover ──
    hoverSurface: isDark ? "hover:bg-white/[0.06]" : "hover:bg-[#f2f4f6]",

    // ── Inputs ──
    inputBg: isDark
      ? "bg-white/[0.06] border-white/12 text-warm-200 placeholder-warm-600"
      : "bg-white border-[#e2e8f0] text-[#191c1e] placeholder-[#76777d]",
    inputSurface: isDark
      ? "bg-white/[0.06] border-white/12"
      : "bg-white border-[#e2e8f0]",

    // ── Buttons ──
    primaryButton: isDark
      ? "bg-amber-600 text-white border border-amber-500/30 hover:bg-amber-500 shadow-lg shadow-amber-600/20"
      : "bg-[#0f172a] text-white border border-[#0f172a] hover:bg-[#1e293b] shadow-sm rounded-lg font-medium",
    secondaryButton: isDark
      ? "bg-white/[0.08] text-warm-200 border border-white/12 hover:bg-white/[0.12]"
      : "bg-white text-[#0f172a] border border-[#e2e8f0] hover:bg-[#f8fafc] rounded-lg font-medium",
    contrastButton: isDark
      ? "bg-amber-600/20 text-amber-200 border border-amber-500/30 hover:bg-amber-600/30"
      : "bg-[#0f172a]/10 text-[#0f172a] border border-[#0f172a]/20 hover:bg-[#0f172a]/20 rounded-lg",

    // ── Chips ──
    activeChip: isDark
      ? "bg-amber-600 text-white border border-amber-500/30 shadow-lg shadow-amber-600/20"
      : "bg-[#0f172a] text-white border border-[#0f172a] shadow-sm rounded-full",
    inactiveChip: isDark
      ? "bg-transparent text-warm-400 border-white/10 hover:bg-white/[0.06]"
      : "bg-[#f3f4f6] text-[#475569] border border-[#e5e7eb] hover:bg-white rounded-full",

    // ── Tabs ──
    activeTab: isDark
      ? "bg-amber-600/20 text-amber-200 border border-amber-500/30"
      : "bg-[#0f172a] text-white border border-[#0f172a] rounded-full",
    inactiveTab: isDark
      ? "text-warm-500 hover:bg-white/[0.06]"
      : "text-[#64748b] hover:bg-[#f2f4f6] rounded-full",

    // ── Badges ──
    badge: isDark
      ? "bg-amber-500/15 text-amber-200 border border-amber-500/30"
      : "bg-[#f3f4f6] text-[#0f172a] border border-[#e5e7eb] rounded-full",
    footerBadge: isDark
      ? "border-white/10 text-warm-400 hover:bg-white/5"
      : "border-[#e2e8f0] text-[#64748b] hover:bg-[#f2f4f6] rounded-full",

    // ── Steps ──
    stepActive: isDark
      ? "bg-amber-600 text-white border border-amber-500/30"
      : "bg-[#0f172a] text-white border border-[#0f172a]",
    stepInactive: isDark
      ? "bg-white/[0.04] border border-white/14 text-warm-600"
      : "bg-[#f2f4f6] border border-[#e2e8f0] text-[#76777d]",
    stepLineActive: isDark ? "bg-amber-500/70" : "bg-[#0f172a]",
    stepLineInactive: isDark ? "bg-white/10" : "bg-[#e2e8f0]",

    // ── Disabled ──
    disabledButton: isDark
      ? "bg-white/[0.04] text-warm-700 border border-white/10 cursor-not-allowed"
      : "bg-[#f2f4f6] text-[#76777d] border border-[#e2e8f0] cursor-not-allowed",
  };
}
