import { getThemeTokens } from "../../styles/theme";

export default function ServiceGrid({ SERVICES, setSelectedService, theme, onViewSummary }) {
    const colors = getThemeTokens(theme);

    return (
        <section className="px-4 lg:px-24 py-6 lg:py-12 relative z-20 text-left">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className={`text-xl lg:text-3xl font-black ${colors.text}`}>Services</h3>
                <button onClick={() => onViewSummary?.()} className="text-blue-500 text-sm font-bold theme-button-motion">View all</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 text-left">
                {SERVICES.slice(0, 6).map((service, idx) => {
                    const isAvailable = idx % 3 !== 2;
                    const prosCount = Math.floor((idx + 1) * 7.5 + 12);

                    return (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService?.(service)}
                            className={`relative p-3 lg:p-5 rounded-[24px] lg:rounded-[32px] flex flex-col border cursor-pointer active:scale-95 shadow-lg group theme-card-motion ${theme === "dark" ? "border-white/5" : "bg-white border-black/5"}`}
                            style={theme === "dark" ? { backgroundColor: `${service.themeColor}10`, borderColor: `${service.themeColor}20` } : {}}
                        >
                            <div className="relative w-full aspect-square rounded-2xl lg:rounded-3xl mb-3 overflow-hidden flex items-center justify-center p-4 lg:p-6" style={{ backgroundColor: theme === "dark" ? `${service.themeColor}20` : service.lightColor }}>
                                <img src={service.img} className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" alt="" />

                                <div className="absolute bottom-2 left-2">
                                    <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md ${isAvailable ? "bg-green-500 text-white" : "bg-gray-500/80 text-white/90"}`}>
                                        <span className={`w-1 h-1 rounded-full ${isAvailable ? "bg-white animate-pulse" : "bg-white/50"}`}></span>
                                        <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-tighter">
                                            {isAvailable ? "Available" : "Tomorrow"}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2">
                                    <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                        <span className="text-white text-[7px] lg:text-[9px] font-black uppercase tracking-tighter">{prosCount} pros</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-[13px] lg:text-[16px] font-black tracking-tight ${colors.text} line-clamp-1`}>{service.title}</h4>
                                    <div className="flex items-center gap-1">
                                        <span className="text-amber-400 text-[10px]">*</span>
                                        <span className={`text-[10px] font-bold ${colors.text}`}>{service.rating || "4.8"}</span>
                                    </div>
                                </div>
                                <p className={`text-[11px] lg:text-[13px] font-bold ${colors.subtext} mb-2`}>from Rs {service.price}</p>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className={`text-[9px] lg:text-[11px] font-black uppercase tracking-widest ${colors.subtext}`}>Book Now</span>
                                    </div>
                                    <span className="text-blue-500 text-sm">-&gt;</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div onClick={() => onViewSummary?.()} className={`flex p-5 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-dashed flex-col items-center justify-center cursor-pointer active:scale-95 theme-card-motion ${theme === "dark" ? "hover:bg-white/5 border-white/20 text-white/50 hover:text-white/80" : "hover:bg-black/5 border-black/20 text-black/50 hover:text-black/80"}`}>
                    <span className="text-[20px] mb-2 font-light">+</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">View All</span>
                </div>
            </div>
        </section>
    );
}
