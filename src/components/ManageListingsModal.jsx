import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ManageListingsModal({ onClose, onPropertyDeleted, onOpenLogin }) {
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;

  const [loading, setLoading] = useState(false);
  const [myProperties, setMyProperties] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Auto-fetch listings using logged in user's email
  const fetchMyProperties = async (emailToFetch) => {
    const targetEmail = emailToFetch || user?.email;
    if (!targetEmail) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/properties/my-listings?email=${encodeURIComponent(targetEmail.trim())}`);

      if (!res.ok) {
        throw new Error("Failed to fetch property listings.");
      }

      const data = await res.json();
      setMyProperties(data || []);
    } catch (err) {
      setErrorMsg(err.message || "Unable to fetch listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchMyProperties(user.email);
    }
  }, [user?.email]);

  const handleDelete = async (propId, propTitle, propEmail) => {
    const ownerEmail = propEmail || user?.email;
    if (!window.confirm(`Are you sure you want to permanently delete "${propTitle}"?`)) {
      return;
    }

    setDeletingId(propId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/properties/by-id/${propId}?ownerEmail=${encodeURIComponent(ownerEmail)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ownerEmail })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete listing.");
      }

      setMyProperties((prev) => prev.filter((p) => p._id !== propId));
      setSuccessMsg(`Listing "${propTitle}" has been deleted.`);
      if (onPropertyDeleted) onPropertyDeleted(propId);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete property listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-wider font-semibold mb-2">
              <span>Owner Dashboard</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Manage & Delete My Listings
            </h2>
            {user?.email && (
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Logged in as: <strong className="text-white font-bold">{user.email}</strong></span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Unauthenticated View */}
          {!isAuthenticated || !user?.email ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Log in to Manage Your Properties
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Log in with Google or email to automatically view and delete all your active property listings without typing your email.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Log In / Get Started</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* Authenticated View */
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-slate-500 font-medium text-xs animate-pulse">
                  Fetching active property listings for {user.email}...
                </div>
              ) : myProperties.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
                  <span className="material-symbols-outlined text-slate-400 text-[32px]">home_work</span>
                  <p className="text-xs font-semibold text-slate-900">
                    No active property listings found for {user.email}.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Properties posted under your logged-in email will automatically appear here for quick management.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1">
                    Your Active Property Listings ({myProperties.length})
                  </h3>

                  {myProperties.map((item) => {
                    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
                    const expireDate = item.expiresAt
                      ? new Date(item.expiresAt)
                      : new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((expireDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    );

                    return (
                      <div
                        key={item._id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-950">{item.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">timer</span>
                              <span>Auto-Deletes in {daysLeft} days</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.location?.address || item.location?.city} · {item.price ? `₹${item.price.toLocaleString("en-IN")}` : ""}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Expires on {expireDate.toLocaleDateString("en-IN")} · Owner: {item.seller?.email || user.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id, item.title, item.seller?.email || user.email)}
                          disabled={deletingId === item._id}
                          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>{deletingId === item._id ? "Deleting..." : "Delete Listing"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
