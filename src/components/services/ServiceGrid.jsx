import { getThemeTokens } from "../../styles/theme";

export default function ServiceGrid({ SERVICES, setSelectedService, theme, onViewSummary }) {
    const colors = getThemeTokens(theme);

    return (
        <section className="px-4 lg:px-24 py-8 lg:py-14 relative z-20 text-left">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h3 className="text-2xl lg:text-4xl font-display font-bold text-slate-950">
                        Popular Home Services
                    </h3>
                    <p className="text-xs lg:text-sm text-slate-600 font-medium">
                        Verified local professionals delivered to your doorstep
                    </p>
                </div>
                <button 
                    onClick={() => onViewSummary?.()} 
                    className="flex items-center gap-1 text-slate-900 font-semibold text-xs lg:text-sm hover:text-slate-950 transition-colors"
                >
                    <span>View all</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 text-left">
                {SERVICES.slice(0, 6).map((service, idx) => {
                    const prosCount = Math.floor((idx + 1) * 7.5 + 12);

                    return (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService?.(service)}
                            className={`group relative p-4 lg:p-6 rounded-3xl lg:rounded-[32px] flex flex-col border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                                theme === "dark" 
                                    ? "bg-[#1c1917]/80 border-[#292524] hover:border-slate-600" 
                                    : "bg-white border-[#e2e8f0] hover:border-slate-400"
                            }`}
                        >
                            <div 
                                className="relative w-full aspect-[4/3] rounded-2xl lg:rounded-3xl mb-4 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-[1.02]" 
                                style={{ backgroundColor: theme === "dark" ? `${service.themeColor || '#0f172a'}15` : service.lightColor || '#f2f4f6' }}
                            >
                                <img 
                                    src={service.img} 
                                    className="w-full h-full object-cover filter group-hover:scale-105 transition-transform duration-500" 
                                    alt={service.title} 
                                />

                                <div className="absolute top-3 right-3">
                                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white text-[10px] font-semibold">
                                        {prosCount} Pros Near You
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-base lg:text-lg font-bold tracking-tight text-slate-950 group-hover:text-[#0f172a] transition-colors line-clamp-1">
                                        {service.title}
                                    </h4>
                                    <div className="flex items-center gap-1 bg-[#f2f4f6] px-2.5 py-0.5 rounded-full border border-[#e2e8f0] shrink-0">
                                        <span className="material-symbols-outlined text-xs text-slate-900" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-xs font-bold text-slate-950">{service.rating || "4.8"}</span>
                                    </div>
                                </div>
                                <p className="text-xs lg:text-sm font-semibold text-slate-700 mb-4">
                                    Starts at ₹{service.price}
                                </p>

                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-950 transition-colors">
                                        Book Instant Service
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center group-hover:bg-black group-hover:scale-105 transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div 
                    onClick={() => onViewSummary?.()} 
                    className="flex p-6 rounded-3xl lg:rounded-[32px] border-2 border-dashed border-slate-300 flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-[#0f172a] hover:bg-slate-100/60 group min-h-[220px]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <span className="material-symbols-outlined text-2xl">grid_view</span>
                    </div>
                    <span className="text-sm font-bold text-slate-950 mb-1">Explore All 24+ Services</span>
                    <span className="text-xs text-slate-500">Plumbing, Cleaning, AC, Electrical & more</span>
                </div>
            </div>
        </section>
    );
}
