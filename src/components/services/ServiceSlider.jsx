import { getThemeTokens } from "../../styles/theme";

export default function ServiceSlider({ SERVICES, activeIdx, setActiveIdx, addToCart, isInCart, theme, onViewSummary, onSeeDetails }) {
    const colors = getThemeTokens(theme);

    return (
        <>
            <main className="relative flex items-center justify-center px-4 lg:px-16 mt-8 mb-4 min-h-[420px] lg:h-[480px]">
                <div className="w-full max-w-7xl relative h-full">
                    {SERVICES.map((service, idx) => (
                        <div 
                            key={service.id} 
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                                idx === activeIdx 
                                    ? "opacity-100 translate-y-0 pointer-events-auto z-10" 
                                    : "opacity-0 translate-y-8 pointer-events-none z-0"
                            }`}
                        >
                            <div className={`w-full h-[420px] md:h-[460px] rounded-3xl lg:rounded-[36px] overflow-hidden flex flex-col md:flex-row border shadow-xl transition-all duration-500 group ${
                                theme === "dark" 
                                    ? "bg-[#1c1917] border-[#292524]" 
                                    : "bg-[#f7f9fb] border-[#e2e8f0]"
                            } ${isInCart?.(service.id) ? "ring-2 ring-[#0f172a]" : ""}`}>
                                
                                {/* Image / Media side */}
                                <div className="w-full md:w-1/2 h-56 md:h-full relative overflow-hidden shrink-0 flex items-center justify-center bg-[#f2f4f6]">
                                    <div className={`absolute top-4 left-4 border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md z-10 ${
                                        isInCart?.(service.id) 
                                            ? "bg-[#0f172a] text-white border-[#0f172a]" 
                                            : "bg-[#0f172a]/90 text-white border-transparent"
                                    }`}>
                                        {isInCart?.(service.id) ? "Selected in Cart" : "Featured Service"}
                                    </div>
                                    <img
                                        src={service.img}
                                        className="w-full h-full object-cover filter transition-transform duration-700 group-hover:scale-105"
                                        alt={service.title}
                                    />
                                </div>

                                {/* Text side */}
                                <div className={`w-full md:w-1/2 flex flex-col justify-center h-full p-6 md:p-10 text-left ${
                                    theme === "dark" ? "bg-[#1c1917]" : "bg-[#f7f9fb]"
                                }`}>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-[#0f172a]"></span>
                                            <span className="text-xs uppercase tracking-widest text-slate-900 font-bold">
                                                Certified Professional
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-950 py-1">
                                            {service.title}
                                        </h3>

                                        <p className="text-sm md:text-base leading-relaxed mt-3 mb-4 font-medium text-slate-600">
                                            {service.desc}
                                        </p>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1 bg-[#f2f4f6] px-3 py-1 rounded-full border border-[#e2e8f0]">
                                                <span className="material-symbols-outlined text-sm text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="text-xs font-bold text-slate-950">4.9 (128+ reviews)</span>
                                            </div>
                                            <p className="text-base font-bold text-slate-950">
                                                Starts ₹{Number(service.price || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isInCart?.(service.id)) {
                                                        addToCart?.(service);
                                                    }
                                                    onViewSummary?.();
                                                }}
                                                className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                                                    isInCart?.(service.id) 
                                                        ? "bg-slate-900 text-white" 
                                                        : "bg-[#0f172a] hover:bg-[#1e293b] text-white"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {isInCart?.(service.id) ? "shopping_cart_checkout" : "add_task"}
                                                </span>
                                                <span>{isInCart?.(service.id) ? "VIEW IN CART" : "BOOK NOW"}</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => onSeeDetails?.(service)}
                                                className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a]"
                                            >
                                                See details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="w-full py-2 flex flex-col items-center">
                <div className="flex gap-2.5 items-center bg-slate-200/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300/40">
                    {SERVICES.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setActiveIdx(idx)} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                idx === activeIdx 
                                    ? "w-8 bg-[#0f172a]" 
                                    : "w-2 bg-slate-400 hover:bg-slate-500"
                            }`} 
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
