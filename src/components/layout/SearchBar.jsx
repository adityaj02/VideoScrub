import { useState } from "react";
import { getThemeTokens } from "../../styles/theme";

export default function SearchBar({ location, setLocation, theme, onLocationClick, isLocating }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const cities = ["Delhi NCR", "Gurugram", "Noida", "South Delhi", "Chandigarh", "Ludhiana"];
  const colors = getThemeTokens(theme);
  const safeLocation = location || "Delhi NCR";

  return (
    <div className={`relative w-full max-w-xl mx-auto flex items-center justify-between gap-2 p-2 rounded-2xl lg:rounded-full border shadow-sm backdrop-blur-xl transition-all duration-300 ${
        theme === 'dark' 
            ? 'bg-[#1c1917]/80 border-[#292524]' 
            : 'bg-white border-[#e2e8f0]'
    }`}>
      <div className="px-4 flex items-center gap-2 text-slate-700 font-semibold text-xs">
        <span className="material-symbols-outlined text-base text-slate-500">location_on</span>
        <span>Service Location</span>
      </div>

      <div className="relative flex items-center gap-2 pr-1">
        <button
          type="button"
          onClick={onLocationClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-900 hover:bg-[#f8fafc] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-slate-700">my_location</span>
          <span>{isLocating ? "Locating..." : "Auto-Locate"}</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl lg:rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors whitespace-nowrap text-xs font-semibold text-slate-900 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{safeLocation}</span>
          <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
        </button>

        {showDropdown && (
          <div className="absolute top-full mt-2 w-48 right-0 z-50 rounded-2xl shadow-xl border border-slate-200 bg-white/95 backdrop-blur-xl py-2 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">Select City</div>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  if (setLocation) setLocation(city);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{city}</span>
                {safeLocation === city && (
                  <span className="material-symbols-outlined text-base text-slate-950">check</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
