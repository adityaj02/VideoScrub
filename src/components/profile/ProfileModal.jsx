import React from "react";
import { getThemeTokens } from "../../styles/theme";

export default function ProfileModal({ isOpen, onClose, profile, theme }) {
    if (!isOpen) return null;

    const colors = getThemeTokens(theme);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-6">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
                theme === 'dark' 
                    ? 'bg-[#1c1917] border-[#292524] text-stone-100' 
                    : 'bg-[#f7f9fb] border-[#e2e8f0] text-slate-900'
            }`}>
                <div className="px-8 py-6 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-slate-950">
                            Account Profile
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5 text-slate-500">
                            Verified User Credentials
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-[#0f172a] text-white hover:bg-black flex items-center justify-center transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-[#0f172a] flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                            {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "H"}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-950 dark:text-stone-100">{profile?.name || "Verified Customer"}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <p className="text-xs font-semibold text-slate-700">Houserve Member</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                        {[
                            { label: "Full Name", value: profile?.name, icon: "badge" },
                            { label: "Email Address", value: profile?.email, icon: "mail" },
                            { label: "Phone Number", value: profile?.phone || "Not provided", icon: "call" },
                            { label: "Service Address", value: profile?.location || "Delhi NCR", icon: "location_on" },
                        ].map((item) => (
                            <div key={item.label} className="p-4 rounded-2xl border border-slate-200 bg-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-base text-slate-900">{item.icon}</span>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.label}</p>
                                </div>
                                <p className="text-sm font-semibold text-slate-950 pl-6">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-slate-200 bg-slate-100/60 text-center">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        For address updates or phone changes, contact support at <span className="text-slate-950 font-semibold">support@houserve.in</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
