export default function Navbar({ location, toggleTheme, theme, setCurrentView, userInitials = "B", activeFilter, setActiveFilter, onLogout, onViewProfile }) {
    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    const filters = ['All services', 'Nearby', 'Top rated ★', 'Available today', 'Under ₹500'];

    return (
        <nav className={`w-full px-4 lg:px-12 py-4 lg:py-6 grid grid-cols-[1fr_auto_auto] items-center gap-3 lg:gap-6 z-[95] shrink-0 sticky top-0 glass border-b ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} min-h-20 shadow-2xl transition-all`}>
            <div className="flex items-center gap-3 text-left min-w-0">
                <div className="flex flex-col min-w-0 pr-4">
                    <h2 className="text-xl lg:text-3xl font-black premium-text tracking-tighter uppercase leading-none truncate">Houserve</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${location === 'Detecting...' ? 'bg-zinc-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className={`text-[9px] uppercase tracking-[0.2em] ${colors.subtext} font-bold italic truncate`}>{location}</span>
                    </div>
                </div>
            </div>

            <div className="hidden xl:flex justify-center">
                <div className={`flex items-center gap-2 lg:gap-3 p-1 rounded-full border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} backdrop-blur-xl bg-transparent`}>
                    {filters.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveFilter && setActiveFilter(label)}
                            className={`px-4 lg:px-5 py-2.5 rounded-full border text-[10px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap active:scale-95 ${activeFilter === label 
                                ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-blue-600 text-white border-blue-500 shadow-md')
                                : (theme === 'dark' ? 'bg-transparent border-white/20 text-white hover:bg-white/5' : 'bg-transparent border-black/20 text-black hover:bg-black/5')}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 lg:gap-4 relative text-right">
                <button 
                  onClick={() => setCurrentView('home')} 
                  className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
                >
                  Get Started →
                </button>
                <button onClick={toggleTheme} className={`glass px-4 lg:px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-110 active:scale-90 ${colors.text} ${colors.glass}`}>
                    {theme === 'dark' ? 'Reflective' : 'Ivory'}
                </button>
                <div className="relative group">
                    <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full glass border flex items-center justify-center cursor-pointer ${colors.glass} ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`} aria-label="User initials">
                        <span className={`text-[12px] lg:text-[13px] font-black tracking-tight ${colors.text}`}>{userInitials}</span>
                    </div>
                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'}`}>
                        <button onClick={onViewProfile} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-black/80 hover:bg-black/5 hover:text-black'}`}>Account Profile</button>
                        <button onClick={() => setCurrentView('bookings')} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-black/80 hover:bg-black/5 hover:text-black'}`}>My Bookings</button>
                        <hr className={`my-1 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`} />
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">Log out</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
