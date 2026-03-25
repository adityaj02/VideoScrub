import { useMemo, useState, useEffect, useCallback } from "react";
import useLocation from "../../hooks/useLocation";

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
        const timeValue = formatSlotValue(cursor);
        // Mocking 2 slots as unavailable
        const isFull = timeValue === "10:00" || timeValue === "14:00";
        slots.push({ value: timeValue, label: formatSlotLabel(cursor), isFull });
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
    onClearAll,
    profile,
}) {
    const [checkoutStep, setCheckoutStep] = useState(() => Number(localStorage.getItem("checkout_step") || 0));
    const [selectedDate, setSelectedDate] = useState(() => localStorage.getItem("checkout_date") || "");
    const [selectedTime, setSelectedTime] = useState(() => localStorage.getItem("checkout_time") || "");
    const [selectedAddress, setSelectedAddress] = useState(() => localStorage.getItem("checkout_address") || "");
    const [localError, setLocalError] = useState("");
    
    const { location: detectedLocation, isLoading: isLocating, refreshLocation } = useLocation();

    const handleAutoDetect = useCallback(() => {
        refreshLocation();
    }, [refreshLocation]);

    useEffect(() => {
        if (detectedLocation && detectedLocation !== "Detecting..." && detectedLocation !== "Location unavailable" && !detectedLocation.includes("denied")) {
            setSelectedAddress(prev => {
                // Only overwrite if current is empty or just a city name
                if (!prev || prev === profile?.location) return detectedLocation;
                return prev;
            });
        }
    }, [detectedLocation, profile?.location]);

    useEffect(() => {
        if (profile?.location && !selectedAddress) {
            setSelectedAddress(profile.location);
        }
    }, [profile?.location, selectedAddress]); // Pre-fill when profile loads

    useEffect(() => {
        localStorage.setItem("checkout_step", checkoutStep);
    }, [checkoutStep]);

    useEffect(() => {
        localStorage.setItem("checkout_date", selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        localStorage.setItem("checkout_time", selectedTime);
    }, [selectedTime]);

    useEffect(() => {
        localStorage.setItem("checkout_address", selectedAddress);
    }, [selectedAddress]);

    const colors = {
        subtext: theme === 'dark' ? 'text-white/40' : 'text-[#6e6e73]',
        text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
        glass: theme === 'dark' ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-white/90 border-black/5 shadow-md',
        inputBg: theme === 'dark' ? 'bg-transparent border-white/20' : 'bg-transparent border-black/20',
    };

    const PLATFORM_FEE_PER_ITEM = 29;

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0),
        [cartItems]
    );

    const platformFees = useMemo(
        () => cartItems.length * PLATFORM_FEE_PER_ITEM,
        [cartItems.length]
    );

    const totalPrice = useMemo(
        () => subtotal + platformFees,
        [subtotal, platformFees]
    );

    const dateOptions = useMemo(() => {
        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + index);
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

    const handleNext = () => {
        setLocalError("");
        if (checkoutStep === 0) {
            if (cartItems.length === 0) return setLocalError("Your cart is empty.");
            if (!isCheckoutAvailable && checkoutMessage) return setLocalError(checkoutMessage);
            setCheckoutStep(1);
        } else if (checkoutStep === 1) {
            if (!selectedDate || !selectedTime) return setLocalError("Please select both date and time.");
            setCheckoutStep(2);
        } else if (checkoutStep === 2) {
            if (!selectedAddress.trim()) return setLocalError("Please enter your complete service address.");
            setCheckoutStep(3);
        }
    };

    const onSubmit = async () => {
        setLocalError("");
        if (cartItems.length === 0) return setLocalError("Your cart is empty.");
        if (!selectedDate || !selectedTime || !selectedAddress) return setLocalError("Missing booking details.");
        
        await onConfirmBooking?.({ date: selectedDate, time: selectedTime, address: selectedAddress.trim() });
    };

    const openWhatsApp = () => {
        const bookingId = bookingMetadata?.order_id || bookingMetadata?.id || 'N/A';
        const serviceName = cartItems[0]?.name || bookingMetadata?.cart_items?.[0]?.name || 'Service';
        const date = bookingMetadata?.date || selectedDate;
        const time = bookingMetadata?.time || selectedTime;
        
        const message = `Hi, I'm interested in booking a service. 
Booking ID: #${bookingId.slice(0, 8).toUpperCase()}
Service: ${serviceName}
Date: ${date}
Time: ${time}`;

        const url = `https://wa.me/919811797407?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-24 animate-in fade-in zoom-in-95 duration-500 overflow-visible text-left ${colors.text}`}>
            <div className={`glass w-full max-w-4xl p-6 sm:p-8 lg:p-14 rounded-[32px] border ${colors.glass} shadow-xl relative overflow-visible text-left`}>
                
                {checkoutStep > 0 && !bookingSuccess && (
                    <div className="mb-10 flex items-center justify-between w-full max-w-md mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${checkoutStep >= 1 ? 'bg-blue-600 text-white' : `border ${theme === 'dark' ? 'border-cardText/30 text-white/30' : 'border-black/20 text-black/30'}`}`}>{checkoutStep > 1 ? '✓' : '1'}</div>
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${colors.subtext}`}>Schedule</span>
                        </div>
                        <div className={`flex-grow h-px mx-2 ${checkoutStep >= 2 ? 'bg-blue-600' : theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${checkoutStep >= 2 ? 'bg-blue-600 text-white' : `border ${theme === 'dark' ? 'border-cardText/30 text-white/30' : 'border-black/20 text-black/30'}`}`}>{checkoutStep > 2 ? '✓' : '2'}</div>
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${colors.subtext}`}>Address</span>
                        </div>
                        <div className={`flex-grow h-px mx-2 ${checkoutStep >= 3 ? 'bg-blue-600' : theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${checkoutStep >= 3 ? 'bg-blue-600 text-white' : `border ${theme === 'dark' ? 'border-cardText/30 text-white/30' : 'border-black/20 text-black/30'}`}`}>3</div>
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${colors.subtext}`}>Review</span>
                        </div>
                    </div>
                )}

                <div className="mb-8 flex items-center gap-4">
                    {checkoutStep > 0 && !bookingSuccess && (
                        <button onClick={() => setCheckoutStep(checkoutStep - 1)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${theme === 'dark' ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'} transition-colors`}>
                            ←
                        </button>
                    )}
                    <div>
                        <span className={`text-[11px] uppercase tracking-[0.4em] font-black ${colors.subtext} block mb-2`}>
                            {checkoutStep === 0 ? 'Your Cart' : checkoutStep === 1 ? 'Step 1 of 3' : checkoutStep === 2 ? 'Step 2 of 3' : 'Step 3 of 3'}
                        </span>
                        <h2 className={`text-3xl lg:text-5xl font-black premium-text tracking-tighter leading-tight ${theme === 'dark' ? '' : 'text-[#1d1d1f]'}`}>
                            {checkoutStep === 0 ? 'Order Summary' : checkoutStep === 1 ? 'Pick a Time' : checkoutStep === 2 ? 'Service Address' : 'Final Review'}
                        </h2>
                    </div>
                </div>

                {!!checkoutMessage && checkoutStep === 0 && (
                    <p className={`mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
                        {checkoutMessage}
                    </p>
                )}

                {bookingSuccess && (
                    <div className={`mb-8 p-8 text-center rounded-3xl border border-emerald-500/40 bg-emerald-500/10 ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-800'}`}>
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                        <p className="mb-2">Your service is scheduled for <strong>{bookingMetadata?.date}</strong> at <strong>{bookingMetadata?.time}</strong>.</p>
                        <p className="text-xs opacity-70 mb-6">Booking ID: #{String(bookingMetadata?.order_id || 'PENDING').slice(0,8).toUpperCase()}</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={openWhatsApp} className="w-full sm:w-auto px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2">
                                <span>WhatsApp Support</span>
                            </button>
                            <button onClick={() => { setCheckoutStep(0); setCurrentView('bookings'); }} className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors">
                                View History
                            </button>
                        </div>
                    </div>
                )}

                {!bookingSuccess && checkoutStep === 0 && (
                    <>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                            {cartItems.length === 0 ? (
                                <div className="py-14 text-center opacity-60 flex flex-col items-center gap-4">
                                    <span className="text-4xl">🛒</span>
                                    <h3 className="text-lg font-black uppercase tracking-widest">Cart is empty</h3>
                                    <p className="text-xs opacity-50 mb-4">Add some services to get started</p>
                                    <button onClick={() => {
                                        if (window.location.pathname === '/' || window.location.pathname.includes('Dashboard')) {
                                            setCurrentView('home');
                                        } else {
                                            window.location.href = '/';
                                        }
                                    }} className="px-8 py-3 rounded-full border border-current text-[10px] font-black uppercase tracking-widest hover:bg-current transition-all">Explore Services</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className={`text-xs font-bold uppercase tracking-widest ${colors.subtext}`}>{cartItems.length} items in cart</p>
                                        <button onClick={onClearAll} className="text-[10px] uppercase font-bold text-red-500 hover:underline">Clear all</button>
                                    </div>
                                    {cartItems.map((item) => (
                                    <div key={item.service_id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[20px] border ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'} shadow-sm`}>
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                                            <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className={`text-lg font-bold ${colors.text}`}>{item.name}</h4>
                                            <p className={`text-sm ${colors.subtext}`}>{formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity?.(item.service_id, -1)} className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'} flex items-center justify-center`}>−</button>
                                            <span className="min-w-[1.5rem] text-center font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity?.(item.service_id, 1)} className={`w-8 h-8 rounded-full border ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'} flex items-center justify-center`}>+</button>
                                        </div>
                                        <div className="text-right sm:min-w-[100px]">
                                            <div className="font-black text-lg">{formatCurrency(item.price)}</div>
                                            <div className={`text-[10px] ${colors.subtext}`}>+ {formatCurrency(PLATFORM_FEE_PER_ITEM)} fee</div>
                                            <button onClick={() => removeFromCart(item.service_id)} className="text-xs text-red-500 hover:text-red-400 font-bold mt-1">Remove</button>
                                        </div>
                                    </div>
                                    ))}
                                </>
                            )}
                        </div>
                        {cartItems.length > 0 && (
                            <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} flex items-center justify-between`}>
                                <div>
                                    <p className={`text-sm ${colors.subtext}`}>Total Amount</p>
                                    <h4 className={`text-3xl font-black ${colors.text}`}>{formatCurrency(totalPrice)}</h4>
                                </div>
                                <button onClick={handleNext} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95">
                                    Proceed to Checkout →
                                </button>
                            </div>
                        )}
                        {localError && <p className="text-sm text-red-500 mt-4 text-right">{localError}</p>}
                    </>
                )}

                {!bookingSuccess && checkoutStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className={`block text-sm font-bold mb-3 ${colors.text}`}>Select Date</label>
                            <div className="flex flex-wrap gap-3">
                                {dateOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => { setSelectedDate(option.value); setSelectedTime(""); }}
                                        className={`rounded-xl border px-5 py-3 text-sm font-bold transition-all ${selectedDate === option.value ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-white/50' : 'border-black/10 hover:bg-black/5 text-black/60'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <label className={`block text-sm font-bold mb-3 ${colors.text}`}>Select Time Slot</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.value}
                                            type="button"
                                            disabled={slot.isFull}
                                            onClick={() => setSelectedTime(slot.value)}
                                            className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all relative ${slot.isFull ? 'opacity-40 cursor-not-allowed bg-black/10' : selectedTime === slot.value ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-white/50' : 'border-black/10 hover:bg-black/5 text-black/60'}`}
                                        >
                                            {slot.label}
                                            {slot.isFull && <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase">Full</span>}
                                        </button>
                                    ))}
                                </div>
                                {timeSlots.length === 0 && <p className="text-sm text-amber-500">No time slots available for this date.</p>}
                            </div>
                        )}

                        {localError && <p className="text-sm text-red-500">{localError}</p>}

                        <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} flex justify-end`}>
                            <button onClick={handleNext} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95">
                                Next: Address →
                            </button>
                        </div>
                    </div>
                )}

                {!bookingSuccess && checkoutStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className={`block text-sm font-bold ${colors.text}`}>Service Address</label>
                                <button 
                                    type="button"
                                    onClick={handleAutoDetect}
                                    disabled={isLocating}
                                    className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg border ${theme === 'dark' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-600'} hover:scale-105 transition-all active:scale-95 disabled:opacity-50`}
                                >
                                    <span>{isLocating ? 'Locating...' : '📍 Detect My Location'}</span>
                                </button>
                            </div>
                            <textarea
                                value={selectedAddress}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                                placeholder="Enter your full address (Flat/House No, Building, Area, LandMark...)"
                                rows={4}
                                className={`w-full rounded-2xl border ${colors.inputBg} px-5 py-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner ${colors.text} placeholder:${colors.subtext}`}
                            />
                            <p className={`mt-2 text-[10px] ${colors.subtext} font-medium`}>Please ensure you add your specific flat number and landmark for the provider.</p>
                        </div>

                        {localError && <p className="text-sm text-red-500">{localError}</p>}

                        <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} flex justify-end`}>
                            <button onClick={handleNext} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 active:scale-95">
                                Next: Payment →
                            </button>
                        </div>
                    </div>
                )}

                {!bookingSuccess && checkoutStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} mb-8 flex items-center justify-between`}>
                                <div>
                                    <p className={`text-sm ${colors.subtext}`}>Subtotal</p>
                                    <p className="text-xl font-bold">{formatCurrency(subtotal)}</p>
                                    <p className={`text-xs ${colors.subtext} mt-1`}>+ Platform Fees: {formatCurrency(platformFees)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm ${colors.subtext}`}>Total Pay</p>
                                    <p className="text-3xl font-black text-blue-500">{formatCurrency(totalPrice)}</p>
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                                <h4 className={`text-sm font-bold mb-4 ${colors.text}`}>Booking Details</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span className={colors.subtext}>Date:</span>
                                        <span className="font-bold">{selectedDate}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className={colors.subtext}>Time:</span>
                                        <span className="font-bold">{selectedTime}</span>
                                    </p>
                                    <p className="flex flex-col gap-1">
                                        <span className={colors.subtext}>Address:</span>
                                        <span className="font-medium opacity-80">{selectedAddress}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {localError && <p className="text-sm text-red-500 text-center">{localError}</p>}

                        <div className={`mt-10 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                            <button
                                onClick={onSubmit}
                                disabled={submitting}
                                className={`w-full px-8 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all text-white font-black tracking-widest uppercase shadow-xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2`}
                            >
                                {submitting ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
