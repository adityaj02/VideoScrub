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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg border rounded-[20px] p-6 lg:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 ${colors.modalBg} ${colors.border}`}>
        <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 flex flex-col items-center justify-center rounded-full hover:opacity-80 theme-button-motion ${colors.secondaryButton}`}>
          <span className="text-sm font-bold leading-none">×</span>
        </button>
        
        <h2 className={`text-2xl font-black ${colors.text} mb-2`}>Write a Review</h2>
        <p className={`text-sm ${colors.subtext} mb-6`}>Share your experience with our home services.</p>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-4xl transition-all hover:scale-110 active:scale-90 ${star <= rating ? 'text-yellow-400' : 'text-gray-400 opacity-30 grayscale'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="How was the service? Did the professional arrive on time?"
          className={`w-full h-32 p-4 rounded-xl resize-none outline-none border mb-6 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${colors.border} ${colors.inputBg} ${colors.text}`}
        />

        <div className="flex gap-4">
          <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold theme-button-motion ${colors.secondaryButton}`}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!reviewText.trim()} className={`flex-1 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 theme-button-motion ${colors.primaryButton}`}>
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
