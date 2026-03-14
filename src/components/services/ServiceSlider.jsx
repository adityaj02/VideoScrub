export default function ServiceSlider({ SERVICES, activeIdx, setActiveIdx, addToCart, isInCart, theme }) {
    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        cardText: theme === 'dark' ? 'text-white/60' : 'text-[#1d1d1f]/80',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    return (
        <>
            <main className="relative flex items-center justify-center px-4 lg:px-16 mt-16 mb-8 min-h-[500px] lg:h-[650px]">
                <div className="w-full max-w-7xl relative h-full">
                    {SERVICES.map((service, idx) => (
                        <div key={service.id} className={`absolute inset-0 flex items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${idx === activeIdx ? 'service-card-active' : 'service-card-hidden'}`}>
                            <div className={`glass reflect-card w-full h-[550px] md:h-[600px] rounded-[64px] overflow-hidden flex flex-col md:flex-row border transition-all duration-700 ${colors.glass} ${isInCart?.(service.id) ? 'in-cart-highlight' : ''}`}>
                                <div className="w-full md:w-[50%] h-48 md:h-full relative overflow-hidden shrink-0">
                                    <img src={service.img} className="w-full h-full object-cover opacity-90 transition-transform duration-[8000ms] scale-105" alt="Service" />
                                    <div className={`absolute inset-0 bg-gradient-to-r ${theme === 'dark' ? 'from-black/80' : 'from-white/10'} via-transparent to-transparent hidden md:block`} />
                                    <div className={`absolute top-10 left-10 glass ${isInCart?.(service.id) ? 'bg-blue-600/60' : 'bg-black/40'} backdrop-blur-xl px-6 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-[0.3em]`}>{isInCart?.(service.id) ? 'Selected' : 'Featured'}</div>
                                </div>
                                <div className="w-full md:w-[50%] flex flex-col h-full bg-transparent p-10 lg:p-14 text-left">
                                    <div className="flex-grow overflow-y-auto custom-scroll pr-2 text-left">
                                        <div className="space-y-6">
                                            <span className={`text-[10px] md:text-[11px] uppercase tracking-[0.5em] ${isInCart?.(service.id) ? 'text-blue-500' : colors.subtext} font-black block`}>Technical Excellence</span>
                                            <h3 className="text-6xl lg:text-8xl font-black premium-text tracking-tighter leading-none py-2 overflow-visible text-left">{service.title}</h3>
                                            <p className={`text-lg leading-relaxed max-sm font-medium tracking-tight ${colors.cardText}`}>{service.desc}</p>
                                        </div>
                                    </div>
                                    <div className="pt-8">
                                        <button onClick={(e) => { e.stopPropagation(); addToCart?.(service); }} className={`w-full py-6 rounded-[32px] text-[13px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-md ${isInCart?.(service.id) ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white')}`}>
                                            {isInCart?.(service.id) ? 'View in Summary' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="w-full py-2 flex flex-col items-center">
                <div className="flex gap-3 items-center glass px-5 py-2 rounded-full border border-white/5">
                    {SERVICES.map((_, idx) => (
                        <button key={idx} onClick={() => setActiveIdx(idx)} className={`h-1 rounded-full transition-all duration-700 ${idx === activeIdx ? `w-10 ${theme === 'dark' ? 'bg-white' : 'bg-black'}` : 'w-2.5 opacity-20 bg-current'}`} />
                    ))}
                </div>
            </div>
        </>
    );
}