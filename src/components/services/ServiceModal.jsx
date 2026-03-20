export default function ServiceModal({ selectedService, setSelectedService, addToCart, isInCart, theme }) {
    if (!selectedService) return null;

    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        cardText: theme === 'dark' ? 'text-white/60' : 'text-[#1d1d1f]/80',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500 text-left">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={() => setSelectedService(null)} />
            <div className={`glass w-full max-w-5xl p-8 md:p-16 rounded-[64px] border relative z-10 max-h-[92vh] overflow-y-auto flex flex-col md:flex-row gap-12 lg:gap-16 animate-in zoom-in-95 duration-500 ${colors.glass} ${isInCart(selectedService.id) ? 'in-cart-highlight' : ''}`}>
                <button onClick={() => setSelectedService(null)} className="absolute top-10 right-10 w-12 h-12 rounded-full glass border flex items-center justify-center text-xl hover:scale-110 active:scale-90 transition-all shadow-sm">✕</button>
                <div className="w-full md:w-[45%] rounded-[48px] overflow-hidden bg-black h-[400px] md:h-auto shrink-0">
                    <img src={selectedService.img} className="w-full h-full object-cover opacity-90" alt={selectedService.title} />
                </div>
                <div className="w-full md:w-[55%] flex flex-col justify-between overflow-visible text-left text-left">
                    <div className="overflow-y-auto custom-scroll pr-4 pb-4 overflow-visible text-left text-left">
                        <span className={`text-[12px] uppercase tracking-[0.6em] font-black ${isInCart(selectedService.id) ? 'text-blue-500' : colors.subtext} block mb-6 text-left`}>Technical deep-dive</span>
                        <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight mb-8 py-4 overflow-visible text-left text-left text-left text-left">{selectedService.title}</h2>
                        <p className={`text-sm font-black uppercase tracking-[0.4em] mb-4 ${colors.subtext}`}>Starting at ₹{Number(selectedService.price || 0).toLocaleString('en-IN')}</p>
                        <p className={`text-xl leading-relaxed mb-10 font-medium ${colors.cardText} text-left text-left text-left text-left`}>{selectedService.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left text-left text-left text-left">
                            {selectedService.subServices.map((sub, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-4 text-left text-left text-left text-left text-left">
                                    <div className="w-2 h-2 rounded-full border border-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                    <span className="text-sm font-bold opacity-80 text-left text-left text-left text-left text-left">{sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => { addToCart(selectedService); setSelectedService(null); }} className={`w-full py-6 mt-10 rounded-[32px] text-[14px] font-black uppercase tracking-[0.5em] transition-all shadow-xl ${isInCart(selectedService.id) ? 'bg-blue-600 text-white shadow-blue-500/20' : (theme === 'dark' ? 'bg-white text-black' : 'bg-[#1d1d1f] text-white')} text-center`}>
                        {isInCart(selectedService.id) ? 'Modify Portfolio' : 'Add to Selection'}
                    </button>
                </div>
            </div>
        </div>
    );
}
