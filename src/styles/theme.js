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
    bg: isDark ? "bg-[#03060d]" : "bg-[#f7f3eb]",
    navBg: isDark ? "bg-[#0c1016]/78" : "bg-[#fffaf1]/88",
    modalBg: isDark ? "bg-[#101215]" : "bg-[#fffaf1]",
    text: isDark ? "text-white" : "text-[#111113]",
    subtext: isDark ? "text-white/60" : "text-[#5c5c63]",
    cardText: isDark ? "text-white/85" : "text-[#2f2f35]",
    faintText: isDark ? "text-white/32" : "text-black/45",
    glass: isDark
      ? "bg-white/[0.08] border-white/14 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      : "bg-[#fffaf1]/88 border-black/10 shadow-[0_18px_55px_rgba(15,23,42,0.08)]",
    panel: isDark ? "bg-white/[0.05] border-white/10" : "bg-black/[0.03] border-black/10",
    panelStrong: isDark ? "bg-white/[0.08] border-white/12" : "bg-[#fff8ef] border-black/10",
    border: isDark ? "border-white/10" : "border-black/10",
    softBorder: isDark ? "border-white/5" : "border-black/5",
    hoverSurface: isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]",
    inputBg: isDark
      ? "bg-white/[0.06] border-white/12 text-white placeholder-white/40"
      : "bg-black/[0.04] border-black/12 text-[#111113] placeholder-black/45",
    inputSurface: isDark ? "bg-white/[0.06] border-white/12" : "bg-black/[0.04] border-black/12",
    primaryButton: isDark
      ? "bg-blue-600 text-white border border-blue-500/25 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
      : "bg-[#dbe7ff] text-[#111113] border border-blue-500/25 hover:bg-[#cfe0ff] shadow-[0_12px_30px_rgba(37,99,235,0.12)]",
    secondaryButton: isDark
      ? "bg-white/[0.08] text-white border border-white/12 hover:bg-white/[0.12]"
      : "bg-black/[0.04] text-[#111113] border border-black/10 hover:bg-black/[0.08]",
    contrastButton: isDark
      ? "bg-white/[0.12] text-white border border-white/18 hover:bg-white/[0.18]"
      : "bg-[#f2e3c8] text-[#111113] border border-black/10 hover:bg-[#ead9b8]",
    activeChip: isDark
      ? "bg-blue-600 text-white border border-blue-500/25 shadow-lg shadow-blue-500/20"
      : "bg-[#dbe7ff] text-[#111113] border border-blue-500/25",
    inactiveChip: isDark
      ? "bg-transparent text-white/60 border-white/10 hover:bg-white/[0.06]"
      : "bg-transparent text-black/60 border-black/10 hover:bg-black/[0.04]",
    activeTab: isDark
      ? "bg-white/[0.12] text-white border border-white/18"
      : "bg-[#e8ddcb] text-[#111113] border border-black/12",
    inactiveTab: isDark ? "text-white/60 hover:bg-white/[0.06]" : "text-black/60 hover:bg-black/[0.04]",
    badge: isDark ? "bg-white/[0.08] text-white border border-white/12" : "bg-black/[0.04] text-[#111113] border border-black/10",
    footerBadge: isDark ? "border-white/10 text-white/70 hover:bg-white/5" : "border-black/10 text-black/70 hover:bg-black/5",
    stepActive: isDark
      ? "bg-blue-600 text-white border border-blue-500/25"
      : "bg-[#dbe7ff] text-[#111113] border border-blue-500/25",
    stepInactive: isDark
      ? "bg-white/[0.04] border border-white/14 text-white/40"
      : "bg-black/[0.04] border border-black/10 text-black/40",
    stepLineActive: isDark ? "bg-blue-500/70" : "bg-blue-500/35",
    stepLineInactive: isDark ? "bg-white/10" : "bg-black/10",
    disabledButton: isDark
      ? "bg-white/[0.04] text-white/25 border border-white/10 cursor-not-allowed"
      : "bg-black/[0.04] text-black/25 border border-black/10 cursor-not-allowed",
  };
}
