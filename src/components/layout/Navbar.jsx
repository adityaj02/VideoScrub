import { DASHBOARD_FILTERS, getThemeTokens } from "../../styles/theme";

export default function Navbar({ location, toggleTheme, theme, setCurrentView, userInitials = "B", activeFilter, setActiveFilter, onLogout, onViewProfile }) {
    const colors = getThemeTokens(theme);

    return (
        <nav className={`w-full px-4 lg:px-12 py-3 lg:py-6 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto] items-center gap-3 lg:gap-6 z-[120] shrink-0 sticky top-0 glass border-b min-h-[64px] lg:min-h-20 shadow-2xl theme-panel-motion ${colors.glass} ${colors.softBorder}`}>
            <div className="flex items-center gap-3 text-left min-w-0">
                <div className="flex flex-col min-w-0">
                    <h2 className="text-xl lg:text-3xl font-black premium-text tracking-tighter uppercase leading-none truncate">Houserve</h2>
                    <div className="hidden lg:flex items-center gap-2 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${location === 'Detecting...' ? 'bg-zinc-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className={`text-[9px] uppercase tracking-[0.2em] ${colors.subtext} font-bold italic truncate`}>{location}</span>
                    </div>
                </div>
            </div>

            <div className="hidden xl:flex justify-center">
                <div className={`flex items-center gap-2 lg:gap-3 p-1 rounded-full border ${colors.softBorder} backdrop-blur-xl bg-transparent`}>
                    {DASHBOARD_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter && setActiveFilter(filter.value)}
                            className={`px-4 lg:px-5 py-2.5 rounded-full border text-[10px] font-bold tracking-wide whitespace-nowrap active:scale-95 theme-button-motion ${activeFilter === filter.value ? colors.activeChip : colors.inactiveChip}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-4 relative text-right">
                <button
                    onClick={() => setCurrentView('home')}
                    className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-full text-[9px] lg:text-[11px] font-black uppercase tracking-wider lg:tracking-[0.2em] hover:scale-110 active:scale-95 theme-button-motion ${colors.primaryButton}`}
                >
                    <span className="lg:hidden">Join</span>
                    <span className="hidden lg:inline">Get Started</span>
                </button>
                <button onClick={toggleTheme} className={`glass px-3 lg:px-5 py-1.5 lg:py-2 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest hover:scale-110 active:scale-90 theme-button-motion ${colors.secondaryButton}`}>
                    {theme === 'dark' ? 'Reflective' : 'Ivory'}
                </button>
                <div className="relative group">
                    <div onClick={onViewProfile} className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full glass border flex items-center justify-center cursor-pointer theme-button-motion ${colors.glass} ${colors.border}`} aria-label="User initials">
                        <span className={`text-[11px] lg:text-[13px] font-black tracking-tight ${colors.text}`}>{userInitials}</span>
                        <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 shadow-sm lg:hidden ${theme === "dark" ? "border-[#101215]" : "border-[#fffaf1]"}`}></div>
                    </div>
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible duration-200 z-[100] hidden lg:block theme-panel-motion ${colors.modalBg} ${colors.border}`}>
                        <button onClick={onViewProfile} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${colors.text} ${colors.hoverSurface}`}>Account Profile</button>
                        <button onClick={() => setCurrentView('bookings')} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${colors.text} ${colors.hoverSurface}`}>My Bookings</button>
                        <hr className={`my-1 border-t ${colors.border}`} />
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">Log out</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
