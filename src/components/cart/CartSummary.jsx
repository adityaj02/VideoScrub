import { useMemo, useState, useEffect, useCallback } from "react";
import useLocation from "../../hooks/useLocation";
import { getThemeTokens } from "../../styles/theme";

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function buildTimeSlots(selectedDate) {
    if (!selectedDate) return [];

    const now = new Date();
    const selectedStart = new Date(`${selectedDate}T00:00:00`);
    const selectedEnd = new Date(`${selectedDate}T23:59:59`);

    if (Number.isNaN(selectedStart.getTime())) return [];

    const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const isToday = now >= selectedStart && now <= selectedEnd;
    const currentHour = now.getHours();

    return slots.map((time) => {
        const [hour, min] = time.split(':').map(Number);
        const isPast = isToday && hour < currentHour + 2;
        const isUnavailable = time === "12:00" || time === "15:00";
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';

        return {
            value: time,
            label: `${hour12}:${min === 0 ? '00' : min} ${ampm}`,
            isFull: isUnavailable || isPast,
        };
    });
}

function isResolvedLocation(value) {
    return Boolean(
        value &&
        value !== "Detecting..." &&
        value !== "Location unavailable" &&
        value !== "Unable to detect location" &&
        !String(value).toLowerCase().includes("denied")
    );
}

export default function CartSummary({
    cartItems,
    removeFromCart,
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
    const [addressDetails, setAddressDetails] = useState(() => {
        try {
            const stored = localStorage.getItem("checkout_address_details");
            return stored ? JSON.parse(stored) : {
                address: profile?.location || "",
                city: "New Delhi",
                pincode: ""
            };
        } catch {
            return { address: "", city: "New Delhi", pincode: "" };
        }
    });
    const [paymentMethod, setPaymentMethod] = useState("pay_on_service");
    const [localError, setLocalError] = useState("");
    const colors = getThemeTokens(theme);
    const { isLoading: isLocating, refreshLocation } = useLocation({ autoStart: false });

    const handleAutoDetect = useCallback(async () => {
        const nextLocation = await refreshLocation();
        if (isResolvedLocation(nextLocation)) {
            setAddressDetails((prev) => ({ ...prev, address: nextLocation }));
        }
    }, [refreshLocation]);

    useEffect(() => {
        localStorage.setItem("checkout_step", String(checkoutStep));
    }, [checkoutStep]);

    useEffect(() => {
        localStorage.setItem("checkout_date", selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        localStorage.setItem("checkout_time", selectedTime);
    }, [selectedTime]);

    const resolvedAddress = addressDetails.address || profile?.location || "";

    useEffect(() => {
        localStorage.setItem("checkout_address_details", JSON.stringify({ ...addressDetails, address: resolvedAddress }));
    }, [addressDetails, resolvedAddress]);

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
                label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
                fullDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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
            return;
        }

        if (checkoutStep === 1) {
            if (!selectedDate || !selectedTime) return setLocalError("Please select both date and time.");
            setCheckoutStep(2);
            return;
        }

        if (checkoutStep === 2) {
            if (!resolvedAddress.trim()) return setLocalError("Please enter your complete service address.");
            if (!addressDetails.pincode.trim()) return setLocalError("Pincode is required.");
            setCheckoutStep(3);
        }
    };

    const onSubmit = async () => {
        setLocalError("");

        if (cartItems.length === 0) return setLocalError("Your cart is empty.");
        if (!selectedDate || !selectedTime || !resolvedAddress) return setLocalError("Missing booking details.");

        const fullAddress = `${resolvedAddress}, ${addressDetails.city} - ${addressDetails.pincode}`;
        await onConfirmBooking?.({ date: selectedDate, time: selectedTime, address: fullAddress });
    };

    const openWhatsApp = () => {
        const bookingId = bookingMetadata?.order_id || bookingMetadata?.id || 'N/A';
        const serviceNames = cartItems.map((item) => item.name).join(', ') || bookingMetadata?.cart_items?.[0]?.name || 'Service';
        const date = bookingMetadata?.date || selectedDate;
        const message = `Hi Houserve, I have a booking!\nBooking ID: #${String(bookingId).slice(0, 8).toUpperCase()}\nServices: ${serviceNames}\nScheduled for: ${date} at ${bookingMetadata?.time || selectedTime}`;
        const url = `https://wa.me/919811797407?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (bookingSuccess) {
        return (
            <div className="flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-24">
                <div className={`glass w-full max-w-2xl p-8 lg:p-12 rounded-[40px] border ${colors.glass} ${colors.border} text-center shadow-2xl overflow-hidden relative`}>
                    <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
                    <h2 className="text-3xl sm:text-4xl font-black premium-text mb-4">Booking Confirmed!</h2>
                    <p className={`text-base sm:text-lg mb-2 ${colors.cardText}`}>Your service is scheduled for <span className="text-blue-500 font-bold">{bookingMetadata?.date}</span> at <span className="text-blue-500 font-bold">{bookingMetadata?.time}</span></p>
                    <p className={`text-xs font-black uppercase tracking-widest ${colors.subtext} mb-10`}>Booking ID: #{String(bookingMetadata?.order_id || 'PENDING').slice(0, 8).toUpperCase()}</p>
                    
                    <div className="flex flex-col gap-3">
                        <button onClick={openWhatsApp} className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#25D366]/20 theme-button-motion active:scale-95 flex items-center justify-center gap-3">
                            <span>Message on WhatsApp</span>
                        </button>
                        <button onClick={() => { setCheckoutStep(0); setCurrentView('bookings'); }} className={`w-full py-4 rounded-2xl border font-black uppercase tracking-widest active:scale-95 theme-button-motion ${colors.secondaryButton}`}>
                            View My Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-24 animate-in fade-in zoom-in-95 duration-500 text-left ${colors.text}`}>
            <div className={`glass w-full max-w-4xl p-6 sm:p-10 lg:p-14 rounded-[40px] border ${colors.glass} ${colors.border} shadow-2xl relative overflow-visible`}>
                {checkoutStep > 0 ? (
                    <div className="mb-10 w-full max-w-xs mx-auto flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs z-10 ${checkoutStep >= step ? colors.stepActive : colors.stepInactive}`}>
                                    {checkoutStep > step ? '✓' : step}
                                </div>
                                {step < 3 ? (
                                    <div className={`absolute left-1/2 top-4 w-full h-[2px] -z-0 ${checkoutStep > step ? colors.stepLineActive : colors.stepLineInactive}`} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="mb-10 flex items-center gap-5">
                    {checkoutStep > 0 ? (
                        <button onClick={() => setCheckoutStep(checkoutStep - 1)} className={`w-12 h-12 rounded-2xl border flex items-center justify-center active:scale-90 theme-button-motion ${colors.secondaryButton}`}>
                            ←
                        </button>
                    ) : null}
                    <div>
                        <span className={`text-[10px] uppercase tracking-[0.4em] font-black ${colors.subtext} block mb-1`}>
                            {checkoutStep === 0 ? 'Checkout' : `Step ${checkoutStep} of 3`}
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-black premium-text tracking-tighter leading-tight">
                            {checkoutStep === 0 ? 'Order Summary' : checkoutStep === 1 ? 'Pick a Slot' : checkoutStep === 2 ? 'Address' : 'Confirm'}
                        </h2>
                    </div>
                </div>

                {checkoutStep === 0 ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className={`text-xl font-black ${colors.text}`}>Your cart</h3>
                                {cartItems.length > 0 ? (
                                    <span className="px-3 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full">
                                        {cartItems.length}
                                    </span>
                                ) : null}
                            </div>
                            {cartItems.length > 0 && typeof onClearAll === "function" ? (
                                <button onClick={onClearAll} className={`px-4 py-2 rounded-xl border text-[10px] uppercase font-black tracking-widest theme-button-motion ${colors.secondaryButton}`}>
                                    Clear all
                                </button>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            {cartItems.length === 0 ? (
                                <div className={`py-20 text-center ${colors.subtext}`}>Your cart is empty</div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.service_id} className={`p-4 rounded-3xl border flex items-center gap-4 ${colors.panel} ${colors.softBorder}`}>
                                        <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-xl ${theme === 'dark' ? 'bg-black' : 'bg-blue-50'}`}>
                                            <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className={`font-black text-[15px] leading-tight ${colors.text}`}>{item.name}</h4>
                                            <p className={`text-[11px] font-bold ${colors.subtext}`}>₹{item.price} + ₹{PLATFORM_FEE_PER_ITEM} fee</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.service_id)} className={`w-10 h-10 rounded-xl border flex items-center justify-center theme-button-motion ${colors.secondaryButton}`}>
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 ? (
                            <div className="mt-8 space-y-4">
                                <div className="space-y-4 px-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={`font-bold uppercase tracking-widest text-[10px] ${colors.subtext}`}>Services</span>
                                        <span className={`font-black ${colors.text}`}>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={`font-bold uppercase tracking-widest text-[10px] ${colors.subtext}`}>Platform fee</span>
                                        <span className={`font-black ${colors.text}`}>{formatCurrency(platformFees)}</span>
                                    </div>
                                    <div className={`h-px w-full ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} my-2`} />
                                    <div className="flex justify-between items-end">
                                        <span className="font-black text-xl tracking-tighter">Total</span>
                                        <span className={`text-3xl font-black ${colors.text}`}>{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                                
                                <button onClick={handleNext} className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest active:scale-[0.98] mt-4 theme-button-motion ${colors.primaryButton}`}>
                                    Proceed to checkout
                                </button>
                            </div>
                        ) : null}
                        {localError ? <p className="text-center text-sm text-red-500 font-bold">{localError}</p> : null}
                    </div>
                ) : null}

                {checkoutStep === 1 ? (
                    <div className="space-y-10">
                        <div>
                            <label className={`block text-[11px] uppercase tracking-[0.2em] font-black mb-4 ${colors.subtext}`}>Availability</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {dateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSelectedDate(opt.value); setSelectedTime(""); }}
                                        className={`shrink-0 px-6 py-4 rounded-3xl border flex flex-col items-center gap-1 theme-button-motion ${selectedDate === opt.value ? `${colors.activeChip} scale-105` : colors.inactiveChip}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                        <span className="text-lg font-black">{opt.fullDate}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedDate ? (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <label className={`block text-[11px] uppercase tracking-[0.2em] font-black mb-4 ${colors.subtext}`}>Preferred Time</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.value}
                                            disabled={slot.isFull}
                                            onClick={() => setSelectedTime(slot.value)}
                                            className={`py-4 rounded-2xl border text-sm font-black theme-button-motion ${slot.isFull ? 'opacity-20 cursor-not-allowed grayscale' : selectedTime === slot.value ? colors.activeChip : colors.inactiveChip}`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="pt-6 border-t border-white/5">
                            <button onClick={handleNext} disabled={!selectedDate || !selectedTime} className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest theme-button-motion ${selectedDate && selectedTime ? colors.primaryButton : colors.disabledButton}`}>
                                Continue to Address
                            </button>
                            {localError ? <p className="text-center text-sm text-red-500 font-bold mt-4">{localError}</p> : null}
                        </div>
                    </div>
                ) : null}

                {checkoutStep === 2 ? (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <label className={`text-[11px] uppercase tracking-[0.3em] font-black ${colors.subtext}`}>Address Details</label>
                            <button onClick={handleAutoDetect} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 theme-button-motion">
                                {isLocating ? "Detecting..." : "📍 Auto-Detect"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={resolvedAddress}
                                onChange={(e) => setAddressDetails((prev) => ({ ...prev, address: e.target.value }))}
                                placeholder="House No, Building, Street..."
                                rows={4}
                                className={`w-full rounded-3xl p-6 text-base font-medium outline-none border transition-all resize-none ${colors.inputBg} focus:border-blue-500/50`}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`px-6 py-4 rounded-[24px] border ${colors.inputSurface} flex flex-col`}>
                                    <span className={`text-[9px] uppercase font-black tracking-widest mb-1 ${colors.subtext}`}>City</span>
                                    <input
                                        type="text"
                                        value={addressDetails.city}
                                        onChange={(e) => setAddressDetails((prev) => ({ ...prev, city: e.target.value }))}
                                        className={`bg-transparent outline-none font-black text-sm ${colors.text}`}
                                    />
                                </div>
                                <div className={`px-6 py-4 rounded-[24px] border ${colors.inputSurface} flex flex-col`}>
                                    <span className={`text-[9px] uppercase font-black tracking-widest mb-1 ${colors.subtext}`}>Pincode</span>
                                    <input
                                        type="text"
                                        placeholder="1100xx"
                                        value={addressDetails.pincode}
                                        onChange={(e) => setAddressDetails((prev) => ({ ...prev, pincode: e.target.value }))}
                                        className={`bg-transparent outline-none font-black text-sm ${colors.text}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNext} disabled={!resolvedAddress || !addressDetails.pincode} className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest theme-button-motion ${resolvedAddress && addressDetails.pincode ? colors.primaryButton : colors.disabledButton}`}>
                            Final Review
                        </button>
                        {localError ? <p className="text-center text-sm text-red-500 font-bold mt-2">{localError}</p> : null}
                    </div>
                ) : null}

                {checkoutStep === 3 ? (
                    <div className="space-y-8">
                        <div className={`p-8 rounded-[40px] border shadow-inner ${colors.panel} ${colors.softBorder}`}>
                            <h4 className={`text-[11px] uppercase font-black tracking-[0.3em] mb-6 ${colors.subtext}`}>Order Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${colors.subtext}`}>Services</span>
                                    <span className={`font-black ${colors.text}`}>{cartItems.length} items</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${colors.subtext}`}>Schedule</span>
                                    <span className={`font-black ${colors.text}`}>{selectedDate} at {selectedTime}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className={`text-sm font-bold ${colors.subtext}`}>Address</span>
                                    <span className={`font-bold text-xs line-clamp-1 ${colors.text}`}>{resolvedAddress}, {addressDetails.city}</span>
                                </div>
                                <div className={`h-px w-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'} my-4`} />
                                <div className="flex justify-between items-end">
                                    <span className={`font-black text-xl uppercase tracking-tighter ${colors.text}`}>Amount to pay</span>
                                    <span className="text-5xl font-black text-blue-500">₹{totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={`text-[11px] uppercase tracking-[0.3em] font-black mb-4 block ${colors.subtext}`}>Payment Method</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'upi', label: 'UPI / QR', icon: '📱' },
                                    { id: 'card', label: 'Card Payment', icon: '💳' },
                                    { id: 'pay_on_service', label: 'Pay on arrival', icon: '🏠' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPaymentMethod(option.id)}
                                        className={`p-4 rounded-[24px] border flex flex-col items-center gap-1 theme-button-motion ${paymentMethod === option.id ? `${colors.activeChip} scale-105` : colors.inactiveChip}`}
                                    >
                                        <span className="text-xl mb-1">{option.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={onSubmit} disabled={submitting} className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 theme-button-motion ${submitting ? colors.disabledButton : colors.primaryButton}`}>
                            {submitting ? 'Confirming...' : 'Place Booking Now'}
                        </button>
                        {localError ? <p className="text-center text-sm text-red-500 font-bold mt-2">{localError}</p> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
