export default function Sidebar({ currentView, setCurrentView, cartItems, theme, onLogout }) {
    const colors = {
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        sidebarHover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5',
    };

    return (
        <aside className={`w-20 lg:w-64 h-screen glass border-r transition-all duration-700 z-[100] flex flex-col justify-between py-10 px-4 shrink-0 ${colors.glass} fixed left-0 top-0 shadow-lg`}>
            <div className="flex flex-col gap-12">
                <div className="flex flex-col items-center lg:items-start lg:px-4 cursor-pointer" onClick={() => setCurrentView('home')}>
                    <div className="text-xl font-black premium-text uppercase tracking-tighter hidden lg:block"><span className="brand-mark" style={theme === 'dark' ? undefined : { color: 'black', textShadow: 'none' }}>B</span></div>
                    <div className={`w-8 h-8 rounded-full lg:hidden flex items-center justify-center font-bold text-[10px] ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}><span className="font-black text-[12px] leading-none">B</span></div>
                </div>
                <div className="flex flex-col gap-2">
                    {[
                        { icon: '🏠', label: 'Home', view: 'home' },
                        { icon: '🛠️', label: 'Services', view: 'services' },
                        { icon: '📝', label: 'Blog', view: 'blog' },
                        { icon: 'ℹ️', label: 'About', view: 'about' },
                        { icon: '📞', label: 'Contact', view: 'contact' },
                        { icon: '🛒', label: 'Cart', view: 'cart' }
                    ].map((item, i) => (
                        <button key={i} onClick={() => { setCurrentView(item.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`flex items-center gap-4 lg:px-4 py-4 rounded-2xl transition-all ${currentView === item.view ? 'bg-blue-500/10' : colors.sidebarHover} group ${colors.text} relative active:scale-95`}>
                            <div className={`w-10 h-10 rounded-xl glass border flex items-center justify-center transition-all ${currentView === item.view ? 'border-blue-500 bg-blue-500/20' : 'border-white/5'}`}>
                                <span className="text-xs">{item.icon}</span>
                            </div>
                            <div className="flex flex-col items-start hidden lg:block text-left text-xs font-black uppercase tracking-widest">
                                <span className={currentView === item.view ? (theme === 'dark' ? 'text-blue-500' : 'text-blue-800') : ''}>{item.label}</span>
                                {item.view === 'cart' && cartItems.length > 0 && <span className={`text-[8px] font-bold tracking-tighter ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>{cartItems.length} ITEMS</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={onLogout} className={`flex items-center gap-4 lg:px-4 py-3 rounded-2xl transition-all hover:bg-red-500/10 group ${theme === 'dark' ? 'text-white/40' : 'text-black/40'} hover:text-red-500`}>
                <div className="w-10 h-10 rounded-xl glass border border-transparent flex items-center justify-center font-bold">⏻</div>
                <span className="text-[10px] uppercase tracking-widest font-bold hidden lg:block text-left">Log Out</span>
            </button>
        </aside>
    );
}
