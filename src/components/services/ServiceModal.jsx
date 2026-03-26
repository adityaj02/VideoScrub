import { getThemeTokens } from "../../styles/theme";

export default function ServiceModal({ selectedService, setSelectedService, addToCart, isInCart, theme }) {
    if (!selectedService) return null;

    const colors = getThemeTokens(theme);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500 text-left">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={() => setSelectedService(null)} />
            <div className={`glass w-full max-w-5xl p-8 md:p-16 rounded-[64px] border relative z-10 max-h-[92vh] overflow-y-auto flex flex-col md:flex-row gap-12 lg:gap-16 animate-in zoom-in-95 duration-500 ${colors.glass} ${colors.border} ${isInCart(selectedService.id) ? "in-cart-highlight" : ""}`}>
                <button onClick={() => setSelectedService(null)} className={`absolute top-10 right-10 w-12 h-12 rounded-full glass border flex items-center justify-center text-xl hover:scale-110 active:scale-90 shadow-sm theme-button-motion ${colors.secondaryButton}`}>x</button>
                <div className={`w-full md:w-[45%] rounded-[48px] overflow-hidden h-[400px] md:h-auto shrink-0 ${theme === "dark" ? "bg-black" : "bg-[#f0ebe2]"}`}>
                    <img src={selectedService.img} className="w-full h-full object-cover opacity-90" alt={selectedService.title} />
                </div>
                <div className="w-full md:w-[55%] flex flex-col justify-between overflow-visible text-left">
                    <div className="overflow-y-auto custom-scroll pr-4 pb-4 overflow-visible text-left">
                        <span className={`text-[12px] uppercase tracking-[0.6em] font-black ${isInCart(selectedService.id) ? "text-blue-500" : colors.subtext} block mb-6`}>Technical deep-dive</span>
                        <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight mb-8 py-4 overflow-visible">{selectedService.title}</h2>
                        <p className={`text-sm font-black uppercase tracking-[0.4em] mb-4 ${colors.subtext}`}>Starting at Rs {Number(selectedService.price || 0).toLocaleString("en-IN")}</p>
                        <p className={`text-xl leading-relaxed mb-10 font-medium ${colors.cardText}`}>{selectedService.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                            {selectedService.subServices.map((sub, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full border border-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                    <span className={`text-sm font-bold ${colors.text}`}>{sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => { addToCart(selectedService); setSelectedService(null); }} className={`w-full py-6 mt-10 rounded-[32px] text-[14px] font-black uppercase tracking-[0.5em] shadow-xl text-center theme-button-motion ${isInCart(selectedService.id) ? colors.activeChip : colors.primaryButton}`}>
                        {isInCart(selectedService.id) ? "Modify Portfolio" : "Add to Selection"}
                    </button>
                </div>
            </div>
        </div>
    );
}
