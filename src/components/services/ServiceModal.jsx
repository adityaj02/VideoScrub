import { getThemeTokens } from "../../styles/theme";

export default function ServiceModal({ selectedService, setSelectedService, addToCart, isInCart, theme }) {
    if (!selectedService) return null;

    const colors = getThemeTokens(theme);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 text-left">
            <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-md" onClick={() => setSelectedService(null)} />
            
            <div className={`w-full max-w-4xl p-6 sm:p-10 lg:p-12 rounded-3xl lg:rounded-[40px] border relative z-10 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-8 lg:gap-12 shadow-xl transition-all duration-300 ${
                theme === "dark" 
                    ? "bg-[#1c1917] border-[#292524] text-stone-100" 
                    : "bg-[#f7f9fb] border-[#e2e8f0] text-slate-900"
            }`}>
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedService(null)} 
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0f172a] text-white hover:bg-black flex items-center justify-center transition-colors z-20 shadow-md"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                {/* Service Image */}
                <div className="w-full md:w-[45%] rounded-2xl lg:rounded-3xl overflow-hidden h-64 md:h-auto shrink-0 relative bg-[#f2f4f6] flex items-center justify-center">
                    <img 
                        src={selectedService.img} 
                        className="w-full h-full object-cover filter" 
                        alt={selectedService.title} 
                    />
                    <div className="absolute top-4 left-4 bg-[#0f172a] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
                        Verified Partner
                    </div>
                </div>

                {/* Service Details */}
                <div className="w-full md:w-[55%] flex flex-col justify-between text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-[#0f172a]"></span>
                            <span className="text-xs uppercase tracking-widest text-slate-900 font-bold">
                                {isInCart(selectedService.id) ? "Added to Selection" : "Home Service Category"}
                            </span>
                        </div>

                        <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-950 mb-3">
                            {selectedService.title}
                        </h2>

                        <p className="text-base font-bold text-slate-900 mb-4">
                            Starts at ₹{Number(selectedService.price || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-sm leading-relaxed mb-6 text-slate-600 font-medium">
                            {selectedService.desc}
                        </p>

                        <div className="mb-6">
                            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                                Included Services & Scope
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedService.subServices?.map((sub, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-2.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                                        <span className="material-symbols-outlined text-base text-slate-900">check_circle</span>
                                        <span className="text-xs font-semibold text-slate-900">{sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => { addToCart(selectedService); setSelectedService(null); }} 
                        className={`w-full py-4 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            isInCart(selectedService.id) 
                                ? "bg-slate-900 text-white" 
                                : "bg-[#0f172a] hover:bg-[#1e293b] text-white"
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {isInCart(selectedService.id) ? "shopping_bag" : "add_task"}
                        </span>
                        <span>{isInCart(selectedService.id) ? "Update Selection" : "Book Service Now"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
