import React from "react";
import { getThemeTokens } from "../../styles/theme";

export default function MobileBottomNav({ currentView, setCurrentView, theme, bookingsCount }) {
    const items = [
        { id: "home", label: "Home", icon: "HM" },
        { id: "services", label: "Services", icon: "SV" },
        { id: "bookings", label: "Bookings", icon: "BK", badge: bookingsCount },
        { id: "blog", label: "Blog", icon: "BL" },
        { id: "profile", label: "Profile", icon: "ME" },
    ];
    const colors = getThemeTokens(theme);

    return (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[110] backdrop-blur-xl border-t px-5 pb-5 pt-3 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.08)] ${colors.navBg} ${colors.border}`}>
            {items.map((item) => {
                const isActive = currentView === item.id || (item.id === "profile" && currentView === "account");
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex flex-col items-center gap-1 relative flex-1 theme-button-motion"
                    >
                        <span className={`text-[10px] font-black transition-all duration-300 ${isActive ? "scale-110" : "scale-100 opacity-70"}`}>
                            {item.icon}
                        </span>
                        <span className={`text-[9px] lg:text-[11px] font-black uppercase tracking-widest ${isActive ? "text-blue-500" : colors.subtext}`}>
                            {item.label}
                        </span>
                        {isActive ? <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full" /> : null}
                        {item.badge > 0 ? (
                            <div className={`absolute -top-1 right-[20%] bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 ${theme === "dark" ? "border-[#0a0a0b]" : "border-[#fffaf1]"}`}>
                                {item.badge}
                            </div>
                        ) : null}
                    </button>
                );
            })}
        </nav>
    );
}
