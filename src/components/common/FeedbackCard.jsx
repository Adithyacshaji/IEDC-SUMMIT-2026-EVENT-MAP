import React, { useState } from 'react';
import { CheckCircle2, Star, X, Send, Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient';

// LinkedIn SVG icon (official brand shape)
function LinkedInIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452H16.89v-5.569c0-1.328-.024-3.037-1.852-3.037-1.854 0-2.137 1.448-2.137 2.943v5.663H9.344V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.369 4.267 5.455v6.286zM5.337 7.433a1.981 1.981 0 1 1 0-3.962 1.981 1.981 0 0 1 0 3.962zm1.706 13.019H3.63V9h3.413v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// Team members — update URLs when available
const TEAM_MEMBERS = [
  { name: 'Developer 1', url: 'https://www.linkedin.com/in/adithya-c-shaji' },
  { name: 'Developer 2', url: 'https://www.linkedin.com/in/gauri-rajesh-menon-9a8164380' },
  { name: 'Developer 3', url: 'https://www.linkedin.com/in/akansha-rose-jose-' },
  { name: 'Developer 4', url: 'https://www.linkedin.com/in/archa-s-kumar' },
];

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function FeedbackCard({ destination, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!destination) return null;

  const title = destination.event_name || destination.name || destination.id || 'Destination';

  const tagsList = [
    'Accurate Path',
    'Fast Route',
    'Easy to Find',
    'Clear Guidance',
    'Great App Experience',
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Submit to Supabase `feedback` table
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('feedback').insert([
          {
            destination_name: title,
            destination_type: destination.type || 'location',
            rating: rating || null,
            tags: selectedTags.length > 0 ? selectedTags.join(', ') : null,
            comment: comment.trim() || null,
            submitted_at: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.error('Feedback submit error:', error);
        }
      } catch (err) {
        console.error('Feedback submit exception:', err);
      }
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0F4C81] to-[#003DA5] p-6 text-white text-center relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
            <CheckCircle2 size={36} className="text-white animate-bounce" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">You've Arrived! 🎉</h2>
          <p className="text-xs text-white/90 font-medium mt-1 truncate max-w-xs mx-auto">{title}</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Heart size={28} className="fill-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Thank You! 🙏</h3>
            <p className="text-sm text-gray-500">
              Your feedback helps us improve Campus Compass for everyone at IEDC Summit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">

            {/* ── Star Rating ── */}
            <div className="text-center">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Rate your navigation experience
              </label>
              <div className="h-5 mb-2">
                {displayRating > 0 && (
                  <span className="text-sm font-bold text-[#0F4C81]">
                    {RATING_LABELS[displayRating]}
                  </span>
                )}
              </div>
              <div className="flex justify-center items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = displayRating >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onTouchStart={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none active:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm transition-colors'
                            : 'text-gray-300 transition-colors'
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Quick Tags ── */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Quick Feedback
              </label>
              <div className="flex flex-wrap gap-2">
                {tagsList.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F4C81] text-white border-[#0F4C81] shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Comment ── */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any additional thoughts or suggestions? (optional)"
                rows={2}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#0F4C81] focus:bg-white transition-all resize-none"
              />
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-sm transition-colors cursor-pointer"
              >
                Skip
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3 bg-gradient-to-r from-[#0F4C81] to-[#003DA5] hover:brightness-110 text-white font-bold rounded-2xl text-sm shadow-[0_4px_14px_rgba(15,76,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>{submitting ? 'Submitting…' : 'Submit Feedback'}</span>
              </button>
            </div>

            {/* ── Developed By ── */}
            <div className="border-t border-gray-100 pt-4 flex flex-col items-center gap-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest align-center text-center">
                Developed by Students of <br />
                Christ College of Engineering, Irinjalakuda (Autonomous) <br /> Connect with us on LinkedIn
              </p>
              <div className="flex items-center justify-center gap-4">
                {TEAM_MEMBERS.map((member) => (
                  <a
                    key={member.url}
                    href={member.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={member.name}
                    className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md hover:bg-[#004182] hover:scale-110 transition-all active:scale-95 cursor-pointer"
                  >
                    <LinkedInIcon size={18} />
                  </a>
                ))}
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
