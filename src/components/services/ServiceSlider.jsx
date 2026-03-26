import { getThemeTokens } from "../../styles/theme";

export default function ServiceSlider({ SERVICES, activeIdx, setActiveIdx, addToCart, isInCart, theme, onViewSummary, onSeeDetails }) {
    const colors = getThemeTokens(theme);

    return (
        <>
            <main className="relative flex items-center justify-center px-4 lg:px-16 mt-8 mb-4 min-h-[400px] lg:h-[450px]">
                <div className="w-full max-w-7xl relative h-full">
                    {SERVICES.map((service, idx) => (
                        <div key={service.id} className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${idx === activeIdx ? "opacity-100 translate-y-0 pointer-events-auto z-10" : "opacity-0 translate-y-8 pointer-events-none z-0"}`}>
                            <div className={`w-full h-[400px] md:h-[450px] rounded-[24px] overflow-hidden flex flex-col md:flex-row border duration-700 group theme-card-motion ${theme === "dark" ? "bg-[#161a21] border-white/10" : "bg-[#fff8ef] border-black/10"} ${isInCart?.(service.id) ? "ring-2 ring-blue-500" : ""}`}>
                                <div className="w-full md:w-1/2 h-56 md:h-full relative overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#0f172a]">
                                    <div className={`absolute top-4 left-4 border px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md z-10 ${isInCart?.(service.id) ? colors.activeChip : colors.badge}`}>
                                        {isInCart?.(service.id) ? "Selected" : "Featured"}
                                    </div>
                                    <img
                                        src={service.img}
                                        className="w-[85%] h-[85%] md:w-[95%] md:h-[95%] object-contain filter brightness-110 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                                        alt={service.title}
                                    />
                                </div>

                                <div className={`w-full md:w-1/2 flex flex-col justify-center h-full p-6 md:p-10 text-left ${theme === "dark" ? "bg-[#11151b]" : "bg-[#fffaf1]"}`}>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <span className={`text-[10px] md:text-[11px] uppercase tracking-[0.2em] ${isInCart?.(service.id) ? "text-blue-500" : colors.subtext} font-black block mb-2`}>Technical Excellence</span>
                                        <h3 className={`text-3xl md:text-5xl font-black py-1 ${colors.text}`}>{service.title}</h3>

                                        <div className="flex items-center gap-2 mt-2">
                                            <p className={`text-[14px] font-semibold ${colors.text}`}>Starting Rs {Number(service.price || 0).toLocaleString("en-IN")}</p>
                                        </div>

                                        <p className={`text-sm md:text-[15px] leading-relaxed mt-4 mb-4 font-medium ${colors.cardText}`}>
                                            {service.desc}
                                        </p>

                                        <div className="flex items-center gap-2 mb-8">
                                            <span className="text-amber-500 text-[12px]">5-star</span>
                                            <span className={`text-[12px] font-medium ${colors.subtext}`}>4.9 | 128 bookings</span>
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
                                                className={`px-6 py-3 rounded-xl border text-[12px] font-bold active:scale-95 flex items-center gap-2 theme-button-motion ${isInCart?.(service.id) ? colors.activeChip : colors.primaryButton}`}
                                            >
                                                {isInCart?.(service.id) ? "VIEW IN CART" : "BOOK NOW"}
                                            </button>
                                            <button
                                                onClick={() => onSeeDetails?.(service)}
                                                className={`px-6 py-3 rounded-xl border text-[12px] font-bold active:scale-95 theme-button-motion ${colors.secondaryButton}`}
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
                <div className={`flex gap-3 items-center glass px-5 py-2 rounded-full border ${colors.softBorder}`}>
                    {SERVICES.map((_, idx) => (
                        <button key={idx} onClick={() => setActiveIdx(idx)} className={`h-1 rounded-full transition-all duration-700 ${idx === activeIdx ? `w-10 ${theme === "dark" ? "bg-white" : "bg-black"}` : "w-2.5 opacity-20 bg-current"}`} />
                    ))}
                </div>
            </div>
        </>
    );
}
