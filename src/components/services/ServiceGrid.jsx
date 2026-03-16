export default function ServiceGrid({ SERVICES, addToCart, isInCart, setSelectedService, theme }) {
    const colors = {
        cardText: theme === 'dark' ? 'text-white/60' : 'text-[#1d1d1f]/80',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    return (
        <section className="px-6 lg:px-24 py-20 relative z-20 mt-16 text-left border-t border-white/5">
            <div className="max-w-7xl mx-auto mb-16 text-left">
                <span className="glass px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold border border-white/10 mb-6 inline-block">Popular Connect</span>
                <h2 className="text-4xl lg:text-6xl font-black premium-text tracking-tighter leading-tight py-4 overflow-visible">Technical Hub</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-left">
                {SERVICES.slice(0, 4).map((service) => (
                    <div key={service.id} className={`glass reflect-card p-8 rounded-[48px] flex flex-col justify-between border transition-all duration-500 hover:scale-[1.02] ${colors.glass} ${isInCart?.(service.id) ? 'in-cart-highlight' : ''}`}>
                        <div className="text-left">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-black shrink-0 shadow-lg border border-white/5 text-left">
                                    <img src={service.img} className="w-full h-full object-cover opacity-90" alt={service.title} />
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black tracking-tighter ${colors.text}`}>{service.rating} ★</div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black premium-text tracking-tighter mb-2 py-1 overflow-visible text-left">{service.title}</h3>
                            <p className={`text-[11px] uppercase tracking-[0.25em] font-black mb-4 ${colors.cardText}`}>₹{Number(service.price || 0).toLocaleString('en-IN')}</p>
                            <p className={`text-xs leading-relaxed mb-6 font-medium line-clamp-2 ${colors.cardText} text-left`}>{service.desc}</p>
                            <button onClick={() => setSelectedService?.(service)} className={`text-[9px] uppercase tracking-[0.3em] font-black underline underline-offset-8 mb-8 transition-colors ${colors.text} hover:text-blue-500 block`}>Service Detail</button>
                        </div>
                        <button onClick={() => addToCart?.(service)} className={`w-full py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 ${isInCart?.(service.id) ? 'bg-blue-600 text-white shadow-blue-500/20' : (theme === 'dark' ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white shadow-sm')}`}>
                            {isInCart?.(service.id) ? 'View in Summary' : 'Add to Cart'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
