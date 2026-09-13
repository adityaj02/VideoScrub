import { useState } from 'react';
import { getThemeTokens } from '../../styles/theme';

export default function ReviewModal({ isOpen, onClose, onSubmit, theme }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen) return null;

  const colors = getThemeTokens(theme);

  const handleSubmit = () => {
    if (!reviewText.trim()) return;

    onSubmit({ rating, text: reviewText });
    setReviewText('');
    setRating(5);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
      <div className={`w-full max-w-lg border rounded-3xl p-6 lg:p-8 shadow-xl relative transition-all duration-300 animate-in zoom-in-95 ${
          theme === 'dark' 
              ? 'bg-[#1c1917] border-[#292524] text-stone-100' 
              : 'bg-[#f7f9fb] border-[#e2e8f0] text-slate-900'
      }`}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#0f172a] text-white hover:bg-black transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        
        <h2 className="text-2xl font-display font-bold text-slate-950 mb-1">
          Share Your Experience
        </h2>
        <p className="text-xs font-medium text-slate-500 mb-6">
          Your feedback helps us maintain top quality home service partners.
        </p>

        {/* Rating Stars */}
        <div className="mb-6 flex justify-center gap-2 p-3 bg-[#f2f4f6] rounded-2xl border border-[#e2e8f0]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-125 active:scale-95"
            >
              <span className={`material-symbols-outlined text-3xl transition-colors ${
                star <= rating ? 'text-[#0f172a]' : 'text-slate-300'
              }`} style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}>
                star
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="How was the service? Did the technician arrive on time?"
          className="w-full h-32 p-4 rounded-xl resize-none outline-none border border-[#e2e8f0] bg-white text-slate-900 placeholder-slate-400 text-sm mb-6 focus:ring-2 focus:ring-[#0f172a]/20 focus:border-[#0f172a] transition-all"
        />

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!reviewText.trim()} 
            className="flex-1 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
