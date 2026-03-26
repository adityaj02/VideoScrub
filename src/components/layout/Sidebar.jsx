import { getThemeTokens } from "../../styles/theme";

export default function Sidebar({ currentView, setCurrentView, theme, onLogout, bookingsCount }) {
    const colors = getThemeTokens(theme);

    const items = [
        { icon: "HM", label: "Home", view: "home" },
        { icon: "SV", label: "Services", view: "services" },
        { icon: "BK", label: "My Bookings", view: "bookings", badge: bookingsCount },
        { icon: "BL", label: "Blog", view: "blog" },
        { icon: "AB", label: "About", view: "about" },
        { icon: "CT", label: "Contact", view: "contact" },
    ];

    return (
        <aside className={`hidden md:flex w-20 lg:w-64 h-screen glass border-r z-[100] flex flex-col justify-between py-10 px-4 shrink-0 fixed left-0 top-0 shadow-lg theme-panel-motion ${colors.glass} ${colors.border}`}>
            <div className="flex flex-col gap-12">
                <div className="flex flex-col items-center lg:items-start lg:px-4 cursor-pointer" onClick={() => setCurrentView("home")}>
                    <div className="text-xl font-black premium-text uppercase tracking-tighter hidden lg:block">
                        <span className="brand-mark" style={theme === "dark" ? undefined : { color: "black", textShadow: "none" }}>H</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full lg:hidden flex items-center justify-center font-bold text-[10px] ${theme === "dark" ? "bg-white/10 text-white" : "bg-black/10 text-black"}`}>
                        <span className="font-black text-[12px] leading-none">H</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {items.map((item, i) => {
                        const isActive = currentView === item.view;

                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    setCurrentView(item.view);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className={`flex items-center gap-4 lg:px-4 py-4 rounded-2xl group ${colors.text} relative active:scale-95 theme-button-motion ${isActive ? "" : colors.hoverSurface}`}
                            >
                                <div className={`w-10 h-10 rounded-xl glass border flex items-center justify-center theme-button-motion ${isActive ? colors.activeChip : `${colors.panel} ${colors.softBorder}`}`}>
                                    <span className={`font-black ${isActive ? "text-white text-[10px]" : "text-[10px]"}`}>{item.icon}</span>
                                </div>
                                <div className="flex flex-col items-start hidden lg:block text-left text-xs font-black uppercase tracking-widest flex-grow">
                                    <div className="flex items-center justify-between w-full">
                                        <span>{item.label}</span>
                                        {item.badge ? <span className="ml-3 bg-red-400 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.badge}</span> : null}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col w-full">
                <div className={`h-px w-full my-4 ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}></div>
                <button onClick={onLogout} className={`flex items-center gap-4 lg:px-4 py-3 rounded-2xl hover:bg-red-500/10 group hover:text-red-500 theme-button-motion ${colors.subtext}`}>
                    <div className="w-10 h-10 rounded-xl glass border border-transparent flex items-center justify-center font-bold text-[10px] text-red-400/70 group-hover:text-red-500 group-hover:bg-red-500/20 transition-all">
                        OUT
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold hidden lg:block text-left">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
