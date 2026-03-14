export default function CartSummary({ cartItems, removeFromCart, theme, setCurrentView }) {
    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-start py-12 px-6 lg:px-24 animate-in fade-in zoom-in-95 duration-500 overflow-visible text-left text-left text-left">
            <div className={`glass w-full max-w-4xl p-10 lg:p-16 rounded-[64px] border ${colors.glass} shadow-xl relative overflow-visible text-left text-left`}>
                <div className="mb-12 overflow-visible text-left text-left text-left">
                    <span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-6 text-left`}>Order Summary</span>
                    <h2 className="text-5xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-6 overflow-visible text-left">Your Selections</h2>
                </div>
                <div className="space-y-5 max-h-[450px] overflow-y-auto custom-scroll pr-4 text-left">
                    {cartItems.length === 0 ? (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4 text-center">
                            <span className="text-5xl text-center">🛒</span>
                            <h3 className="text-xl font-black uppercase tracking-widest text-center text-center">Portfolio is empty</h3>
                            <button onClick={() => setCurrentView('home')} className="mt-4 px-10 py-4 rounded-full border border-current text-[10px] font-black uppercase tracking-widest hover:bg-current transition-all text-center">Explore Hub</button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.cartId} className={`flex items-center gap-6 p-6 rounded-[32px] border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'} group hover:scale-[1.01] transition-all shadow-md text-left`}>
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black shrink-0 text-left">
                                    <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                                </div>
                                <div className="flex-grow text-left">
                                    <h4 className={`text-xl font-black tracking-tight ${colors.text} text-left`}>{item.title}</h4>
                                    <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 text-blue-500 text-left`}>Verified Rank</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-3 text-right">
                                    <button onClick={() => removeFromCart(item.cartId)} className={`text-[10px] font-black uppercase tracking-widest text-red-500 opacity-40 hover:opacity-100 transition-all text-right`}>Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {cartItems.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 overflow-visible text-left">
                        <div className="text-left overflow-visible text-left">
                            <span className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext} text-left`}>Portfolio Total</span>
                            <h4 className={`text-3xl font-black ${colors.text} mt-2 text-left`}>{cartItems.length} Elite Items</h4>
                        </div>
                        <button className={`w-full md:w-auto px-14 py-6 rounded-[28px] text-[13px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.03] active:scale-95 shadow-xl ${theme === 'dark' ? 'bg-white text-black shadow-white/5' : 'bg-blue-600 text-white shadow-blue-500/20'} text-center`}>
                            Confirm Selections
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}