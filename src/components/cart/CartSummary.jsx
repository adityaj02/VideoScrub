import { useMemo, useState } from "react";

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function CartSummary({
    cartItems,
    removeFromCart,
    updateQuantity,
    theme,
    setCurrentView,
    onConfirmBooking,
    isCheckoutAvailable,
    checkoutMessage,
    locationWarning,
    submitting,
    bookingSuccess,
    bookingMetadata,
}) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [localError, setLocalError] = useState("");

    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
    };

    const totalPrice = useMemo(
        () => cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0),
        [cartItems]
    );

    const timeSlots = useMemo(() => {
        if (!selectedDate) return [];

        const now = new Date();
        const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const start = new Date(`${selectedDate}T09:00:00`);
        const end = new Date(`${selectedDate}T20:00:00`);
        const selected = new Date(`${selectedDate}T00:00:00`);
        const isToday = selected.toDateString() === now.toDateString();

        const slots = [];
        let cursor = new Date(start);

        while (cursor <= end) {
            if (!isToday || cursor >= minBookingTime) {
                slots.push(cursor.toTimeString().slice(0, 5));
            }
            cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
        }

        return slots;
    }, [selectedDate]);

    const onSubmit = async () => {
        if (cartItems.length === 0) {
            setLocalError("Your cart is empty.");
            return;
        }

        if (!isCheckoutAvailable) {
            setLocalError(checkoutMessage || "Checkout unavailable.");
            return;
        }

        if (!selectedDate || !selectedTime) {
            setLocalError("Please select both date and time slot.");
            return;
        }

        setLocalError("");
        await onConfirmBooking?.({ date: selectedDate, time: selectedTime });
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-24 animate-in fade-in zoom-in-95 duration-500 overflow-visible text-left">
            <div className={`glass w-full max-w-4xl p-6 sm:p-8 lg:p-16 rounded-[40px] lg:rounded-[64px] border ${colors.glass} shadow-xl relative overflow-visible text-left`}>
                <div className="mb-10 overflow-visible text-left">
                    <span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-4 text-left`}>Order Summary</span>
                    <h2 className="text-4xl lg:text-7xl font-black premium-text tracking-tighter leading-tight py-2 overflow-visible text-left">Your Selections</h2>
                </div>

                {!!checkoutMessage && (
                    <p className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {checkoutMessage}
                    </p>
                )}

                {!!locationWarning && (
                    <p className="mb-6 rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                        {locationWarning}
                    </p>
                )}

                {bookingSuccess && (
                    <p className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        Booking confirmed for {bookingMetadata?.date} at {bookingMetadata?.time}. Our team will contact you soon.
                    </p>
                )}

                <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scroll pr-1 sm:pr-4 text-left">
                    {cartItems.length === 0 ? (
                        <div className="py-14 text-center opacity-60 flex flex-col items-center gap-4">
                            <span className="text-4xl">🛒</span>
                            <h3 className="text-lg font-black uppercase tracking-widest text-center">Cart is empty</h3>
                            <button onClick={() => setCurrentView('home')} className="mt-2 px-8 py-3 rounded-full border border-current text-[10px] font-black uppercase tracking-widest hover:bg-current transition-all text-center">Explore Services</button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.service_id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-[24px] border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'} group transition-all shadow-md text-left`}>
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black shrink-0">
                                    <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex-grow text-left">
                                    <h4 className={`text-lg font-black tracking-tight ${colors.text}`}>{item.name}</h4>
                                    <p className={`text-[11px] uppercase tracking-widest font-bold mt-1 ${colors.subtext}`}>{formatCurrency(item.price)} per service</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity?.(item.service_id, -1)} className="w-8 h-8 rounded-full border border-white/20">−</button>
                                    <span className="min-w-5 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity?.(item.service_id, 1)} className="w-8 h-8 rounded-full border border-white/20">+</button>
                                </div>
                                <div className="text-right sm:min-w-[120px]">
                                    <div className="font-black">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</div>
                                    <button onClick={() => removeFromCart(item.service_id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-70 hover:opacity-100 transition-all">Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-white/5 space-y-6 text-left">
                        <div className="flex justify-between items-center">
                            <span className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext}`}>Total</span>
                            <h4 className={`text-2xl font-black ${colors.text}`}>{formatCurrency(totalPrice)}</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime("");
                                }}
                                className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm"
                            />
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm"
                            >
                                <option value="">Select time slot</option>
                                {timeSlots.map((slot) => (
                                    <option key={slot} value={slot} className="text-black">
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {localError && <p className="text-sm text-red-400">{localError}</p>}

                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className={`w-full md:w-auto px-10 py-4 rounded-[20px] text-[12px] font-black uppercase tracking-[0.35em] transition-all active:scale-95 shadow-xl ${theme === 'dark' ? 'bg-white text-black shadow-white/5' : 'bg-blue-600 text-white shadow-blue-500/20'} disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
