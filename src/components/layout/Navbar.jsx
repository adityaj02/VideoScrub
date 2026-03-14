export default function Navbar({ location, toggleTheme, theme, setCurrentView }) {
    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else {
            setCurrentView('home');
            setTimeout(() => {
                const target = document.getElementById(id);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <nav className="w-full px-6 lg:px-12 py-6 grid grid-cols-3 items-center z-[95] shrink-0 sticky top-0 glass border-b border-white/5 h-24 shadow-2xl">
            <div className="flex flex-col text-left">
                <h2 className="text-xl font-bold premium-text tracking-tighter uppercase leading-none">Hub Stage</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${location === 'Detecting...' ? 'bg-zinc-500' : 'bg-green-500'} animate-pulse`}></div>
                    <span className={`text-[9px] uppercase tracking-[0.2em] ${colors.subtext} font-bold italic`}>{location}</span>
                </div>
            </div>

            {/* CENTERED BUTTONS */}
            <div className="flex justify-center">
                <div className="flex items-center gap-3 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    {[
                        { label: 'Services', action: () => setCurrentView('services') },
                        { label: 'Blog', action: () => setCurrentView('blog') },
                        { label: 'About', action: () => scrollToSection('about-experience') },
                        { label: 'Contact', action: () => scrollToSection('footer-main') }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={btn.action}
                            className="px-6 py-2.5 rounded-full bg-blue-600/30 border border-blue-500/60 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-blue-500/10 active:scale-95 whitespace-nowrap"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <button onClick={toggleTheme} className={`glass px-4 lg:px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-110 active:scale-90 ${colors.text} ${colors.glass}`}>
                    {theme === 'dark' ? 'Ivory' : 'Reflective'}
                </button>
                <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full glass border flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${colors.glass}`}>
                    <span className={`text-[11px] font-bold tracking-tighter ${colors.text}`}>BW</span>
                </div>
            </div>
        </nav>
    );
}