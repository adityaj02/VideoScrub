import { useState } from "react";
import { getThemeTokens } from "../../styles/theme";

export default function SearchBar({ searchQuery, setSearchQuery, location, setLocation, theme, onLocationClick, isLocating }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const cities = ["Gharuan", "Ludhiana", "Delhi", "Chandigarh"];
  const colors = getThemeTokens(theme);
  const safeLocation = location || "Choose area";

  return (
    <div className={`relative w-full max-w-4xl mx-auto flex items-center gap-2 p-1.5 lg:p-2 rounded-2xl lg:rounded-full border shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 backdrop-blur-xl mb-4 lg:mb-8 theme-panel-motion ${colors.glass} ${colors.border}`}>
      <div className="pl-3 lg:pl-5 pr-2 text-lg lg:text-xl opacity-50 shrink-0" aria-hidden="true">
        <svg viewBox="0 0 24 24" className={`w-5 h-5 ${colors.subtext}`} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search plumbing, carpentry, cleaning..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`flex-1 bg-transparent border-none outline-none text-[13px] lg:text-[15px] font-medium h-10 lg:h-12 px-2 w-full min-w-0 ${colors.text} ${theme === "dark" ? "placeholder-white/40" : "placeholder-black/40"}`}
      />

      <div className="relative shrink-0 flex items-center gap-2 pr-2 lg:pr-4">
        <button
          type="button"
          onClick={onLocationClick}
          className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest theme-button-motion ${colors.secondaryButton}`}
        >
          <span>{isLocating ? "..." : "Locate"}</span>
        </button>
        <button
          type="button"
          className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-full border whitespace-nowrap theme-button-motion ${colors.secondaryButton}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500"></span>
          <span className={`text-[10px] lg:text-[12px] font-bold ${colors.text}`}>{safeLocation}</span>
        </button>

        {showDropdown && (
          <div className={`absolute top-full mt-2 w-40 right-0 z-50 rounded-xl shadow-2xl border py-2 ${colors.modalBg} ${colors.border}`}>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  if (setLocation) setLocation(city);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-[12px] lg:text-sm font-bold transition-colors ${colors.text} ${colors.hoverSurface}`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
