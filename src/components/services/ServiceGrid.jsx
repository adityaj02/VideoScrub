export default function ServiceGrid({ SERVICES, addToCart, isInCart, setSelectedService, theme, onViewSummary }) {
    const colors = {
        cardText: theme === 'dark' ? 'text-white/60' : 'text-[#1d1d1f]/80',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    const pastelColors = ['bg-blue-100', 'bg-amber-100', 'bg-green-100', 'bg-cyan-100', 'bg-purple-100'];

    return (
        <section className="px-6 lg:px-24 py-8 lg:py-12 relative z-20 text-left">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 text-left">
                {SERVICES.slice(0, 5).map((service, idx) => (
                    <div 
                        key={service.id} 
                        onClick={() => setSelectedService?.(service)} 
                        className={`p-5 lg:p-6 rounded-[24px] flex flex-col justify-between border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 ${theme === 'dark' ? 'bg-[#292929] border-[#333]' : 'bg-[#ffffff] border-[#e5e5ea]'} shadow-sm`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-12 h-12 rounded-[14px] ${pastelColors[idx % pastelColors.length]} flex items-center justify-center overflow-hidden p-2`}>
                                <img src={service.img} className="w-full h-full object-contain filter drop-shadow-sm" alt="" />
                            </div>
                            <div className={`text-[11px] font-medium ${colors.subtext}`}>{Math.floor((idx + 1) * 7.5 + 12)} pros</div>
                        </div>
                        <div>
                            <h4 className={`text-[16px] font-bold tracking-tight ${colors.text}`}>{service.title}</h4>
                            <p className={`text-[12px] mt-1 ${colors.subtext}`}>from ₹{Number(service.price || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                ))}
                
                <div 
                    onClick={() => onViewSummary?.()} 
                    className={`p-5 lg:p-6 rounded-[24px] border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${theme === 'dark' ? 'hover:bg-white/5 border-white/20 text-white/50 hover:text-white/80' : 'hover:bg-black/5 border-black/20 text-black/50 hover:text-black/80'} active:scale-95`}
                >
                    <span className="text-[20px] mb-2 font-light">+</span>
                    <span className="text-[13px] font-medium tracking-tight">Browse all services</span>
                </div>
            </div>
        </section>
    );
}
