import { useState } from 'react';

export default function ReviewModal({ isOpen, onClose, onSubmit, theme }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reviewText.trim()) {
      onSubmit({ rating, text: reviewText });
      setReviewText('');
      setRating(5);
    }
  };

  const colors = {
    overlay: 'bg-black/60 backdrop-blur-sm',
    modalBg: theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white',
    border: theme === 'dark' ? 'border-white/10' : 'border-black/10',
    text: theme === 'dark' ? 'text-white' : 'text-black',
    subtext: theme === 'dark' ? 'text-white/40' : 'text-black/40',
    inputBg: theme === 'dark' ? 'bg-white/5' : 'bg-black/5',
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${colors.overlay}`}>
      <div className={`w-full max-w-lg ${colors.modalBg} ${colors.border} border rounded-[20px] p-6 lg:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 flex flex-col items-center justify-center rounded-full ${colors.inputBg} ${colors.text} hover:opacity-80 transition-opacity`}>
          <span className="text-sm font-bold leading-none">×</span>
        </button>
        
        <h2 className={`text-2xl font-black ${colors.text} mb-2`}>Write a Review</h2>
        <p className={`text-sm ${colors.subtext} mb-6`}>Share your experience with our home services.</p>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
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
          className={`w-full h-32 p-4 rounded-xl resize-none outline-none border ${colors.border} ${colors.inputBg} ${colors.text} mb-6 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
        />

        <div className="flex gap-4">
          <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold transition-all hover:opacity-80 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!reviewText.trim()} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-blue-500/20">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
