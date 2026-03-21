import { useMemo, useState } from "react";

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 20;
const SLOT_STEP_MINUTES = 30;
const MIN_NOTICE_HOURS = 2;

const formatSlotValue = (date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const formatSlotLabel = (date) =>
    date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

function ceilToNextInterval(date, intervalMinutes = 30) {
    const next = new Date(date);
    const minutes = next.getMinutes();
    const remainder = minutes % intervalMinutes;
    if (remainder !== 0) {
        next.setMinutes(minutes + (intervalMinutes - remainder));
    }
    next.setSeconds(0, 0);
    return next;
}

function buildTimeSlots(selectedDate) {
    if (!selectedDate) return [];

    const now = new Date();
    // Always parse as local time by appending T00:00:00 (without Z)
    const selectedStart = new Date(`${selectedDate}T00:00:00`);
    const selectedEnd = new Date(`${selectedDate}T23:59:59`);

    if (Number.isNaN(selectedStart.getTime())) return [];

    // Use local midnight by constructing from the parsed local date
    const dayStart = new Date(selectedStart);
    dayStart.setHours(SLOT_START_HOUR, 0, 0, 0);

    const dayEnd = new Date(selectedStart);
    dayEnd.setHours(SLOT_END_HOUR, 0, 0, 0);

    const earliestBooking = ceilToNextInterval(addMinutes(now, MIN_NOTICE_HOURS * 60), SLOT_STEP_MINUTES);

    const isToday = now >= selectedStart && now <= selectedEnd;
    let cursor = isToday ? new Date(Math.max(dayStart.getTime(), earliestBooking.getTime())) : new Date(dayStart);

    const slots = [];
    while (cursor <= dayEnd) {
        slots.push({ value: formatSlotValue(cursor), label: formatSlotLabel(cursor) });
        cursor = addMinutes(cursor, SLOT_STEP_MINUTES);
    }

    return slots;
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
    submitting,
    bookingSuccess,
    bookingMetadata,
}) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
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

    const dateOptions = useMemo(() => {
        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + index);
            // Use local date parts to avoid UTC offset shifting the day (e.g. IST = UTC+5:30)
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return {
                value: `${yyyy}-${mm}-${dd}`,
                label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
            };
        });
    }, []);

    const timeSlots = useMemo(() => buildTimeSlots(selectedDate), [selectedDate]);

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

        if (!selectedAddress.trim()) {
            setLocalError("Please enter your complete service address.");
            return;
        }

        setLocalError("");
        await onConfirmBooking?.({ date: selectedDate, time: selectedTime, address: selectedAddress.trim() });
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-24 animate-in fade-in zoom-in-95 duration-500 overflow-visible text-left">
            <div className={`glass w-full max-w-4xl p-6 sm:p-8 lg:p-16 rounded-[40px] lg:rounded-[64px] border ${colors.glass} shadow-xl relative overflow-visible text-left`}>
                <div className="mb-10">
                    <span className={`text-[11px] uppercase tracking-[0.6em] font-black ${colors.subtext} block mb-4`}>
                        Order Summary
                    </span>
                    <h2 className="text-4xl lg:text-7xl font-black premium-text tracking-tighter leading-tight">
                        Your Selections
                    </h2>
                </div>

                {!!checkoutMessage && (
                    <p className={`mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                        {checkoutMessage}
                    </p>
                )}

                {/* NCR info note */}
                <p className={`mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3 text-sm ${theme === 'dark' ? 'text-blue-300/80' : 'text-blue-800/90'}`}>
                    ℹ️ Services are currently available in the <strong>Delhi NCR</strong> region only. We're expanding soon!
                </p>

                {bookingSuccess && (
                    <p className={`mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-800'}`}>
                        Booking confirmed for {bookingMetadata?.date} at {bookingMetadata?.time}.
                    </p>
                )}

                <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scroll pr-1 sm:pr-4">
                    {cartItems.length === 0 ? (
                        <div className="py-14 text-center opacity-60 flex flex-col items-center gap-4">
                            <span className="text-4xl">🛒</span>
                            <h3 className="text-lg font-black uppercase tracking-widest">Cart is empty</h3>
                            <button
                                onClick={() => setCurrentView('home')}
                                className="mt-2 px-8 py-3 rounded-full border border-current text-[10px] font-black uppercase tracking-widest hover:bg-current transition-all"
                            >
                                Explore Services
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.service_id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-[24px] border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'} shadow-md`}>
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black shrink-0">
                                    <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                </div>

                                <div className="flex-grow">
                                    <h4 className={`text-lg font-black ${colors.text}`}>{item.name}</h4>
                                    <p className={`text-[11px] uppercase tracking-widest font-bold mt-1 ${colors.subtext}`}>
                                        {formatCurrency(item.price)} per service
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity?.(item.service_id, -1)} className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white' : 'border-black/20 text-black'}`}>−</button>
                                    <span className="min-w-5 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity?.(item.service_id, 1)} className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white' : 'border-black/20 text-black'}`}>+</button>
                                </div>

                                <div className="text-right sm:min-w-[120px]">
                                    <div className="font-black">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.service_id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-70 hover:opacity-100"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext}`}>
                                Total
                            </span>
                            <h4 className={`text-2xl font-black ${colors.text}`}>
                                {formatCurrency(totalPrice)}
                            </h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {dateOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(option.value);
                                            setSelectedTime("");
                                        }}
                                        className={`rounded-full border px-4 py-2 text-xs font-bold tracking-wide transition-all ${selectedDate === option.value ? 'border-blue-500 bg-blue-500/20 text-blue-100' : theme === 'dark' ? 'border-white/20 hover:border-white/40 text-white' : 'border-black/20 hover:border-black/40 text-black'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    min={dateOptions[0]?.value}
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime("");
                                    }}
                                    className={`w-full rounded-2xl border bg-transparent px-4 py-3 text-sm flex-shrink-0 ${theme === 'dark' ? 'border-white/20 text-white [color-scheme:dark]' : 'border-black/20 text-black [color-scheme:light]'}`}
                                />

                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className={`w-full rounded-2xl border bg-transparent px-4 py-3 text-sm flex-shrink-0 ${theme === 'dark' ? 'border-white/20 text-white' : 'border-black/20 text-black'}`}
                                >
                                    <option value="">Select time slot</option>
                                    {timeSlots.map((slot) => (
                                        <option key={slot.value} value={slot.value} className="text-black">
                                            {slot.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <textarea
                                value={selectedAddress}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                                placeholder="Enter complete service address (House No, Building, Street, Area...)"
                                rows={3}
                                className={`w-full rounded-2xl border bg-transparent px-4 py-3 text-sm resize-none ${theme === 'dark' ? 'border-white/20 text-white placeholder-white/40' : 'border-black/20 text-black placeholder-black/40'}`}
                            />
                        </div>

                        {selectedDate && timeSlots.length === 0 && (
                            <p className="text-xs text-amber-300">No slots left for this date. Please choose another date.</p>
                        )}

                        {localError && <p className="text-sm text-red-400">{localError}</p>}

                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className={`w-full md:w-auto px-10 py-4 rounded-[20px] text-[12px] font-black uppercase tracking-[0.35em] transition-all active:scale-95 ${theme === 'dark' ? 'bg-white text-black' : 'bg-blue-600 text-white'} disabled:opacity-60`}
                        >
                            {submitting ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
