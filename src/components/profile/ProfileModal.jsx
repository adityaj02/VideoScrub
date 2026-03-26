import React from "react";
import { getThemeTokens } from "../../styles/theme";

export default function ProfileModal({ isOpen, onClose, profile, theme }) {
    if (!isOpen) return null;

    const colors = getThemeTokens(theme);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-lg rounded-[32px] border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 ${colors.border} ${colors.modalBg}`}>
                <div className={`px-8 py-6 border-b ${colors.border} flex items-center justify-between`}>
                    <div>
                        <h2 className={`text-2xl font-black premium-text ${colors.text}`} style={{ paddingBottom: "0.15em", marginBottom: "-0.15em", lineHeight: "normal" }}>Account Profile</h2>
                        <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${colors.subtext}`}>Verified User Credentials</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 theme-button-motion ${colors.secondaryButton}`}
                    >
                        x
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/20">
                            {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "H"}
                        </div>
                        <div>
                            <h3 className={`text-xl font-black ${colors.text}`}>{profile?.name || "User"}</h3>
                            <p className="text-sm font-bold text-blue-500">Premium Member</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: "Full Name", value: profile?.name, icon: "ID" },
                            { label: "Email Address", value: profile?.email, icon: "EM" },
                            { label: "Phone Number", value: profile?.phone || "Not provided", icon: "PH" },
                            { label: "Service Address", value: profile?.location || "Not set", icon: "AD", full: true },
                        ].map((item) => (
                            <div key={item.label} className={`p-5 rounded-2xl border ${colors.border} ${colors.panel} ${item.full ? "col-span-1" : ""}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`inline-flex h-7 min-w-7 px-2 rounded-full items-center justify-center text-[10px] font-black ${colors.secondaryButton}`}>{item.icon}</span>
                                    <p className={`text-[10px] uppercase tracking-widest font-black ${colors.subtext}`}>{item.label}</p>
                                </div>
                                <p className={`text-sm font-bold leading-relaxed ${colors.text}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`px-8 py-6 border-t ${colors.border} ${colors.panel} flex justify-center text-center`}>
                    <p className={`text-[10px] ${colors.subtext} font-medium tracking-wide`}>
                        This information is used for service delivery and history tracking.<br />
                        For changes, please contact support at <span className="text-blue-500">shivskukreja@gmail.com</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
