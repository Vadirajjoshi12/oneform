import React, { useState } from 'react';
import { FeedbackComment } from '../types';
import { ThumbsUp, MessageSquare, Send, Sparkles, UserCheck, ShieldCheck, Heart, Award } from 'lucide-react';

interface CommunityFeedbackProps {
  comments: FeedbackComment[];
  onAddComment: (comment: Omit<FeedbackComment, 'id' | 'upvotes' | 'createdAt'>) => void;
  onUpvoteComment: (id: string) => void;
}

export const CommunityFeedback: React.FC<CommunityFeedbackProps> = ({
  comments,
  onAddComment,
  onUpvoteComment,
}) => {
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');

  // Poll state
  const [pollOptions, setPollOptions] = useState([
    { id: 1, label: 'Delivery fee is higher than item price (e.g. ₹49 fee on ₹20 item)', votes: 142 },
    { id: 2, label: 'Minimum cart threshold keep getting raised (e.g., ₹199 to ₹299)', votes: 98 },
    { id: 3, label: 'Too many delivery bikes crowding the hostel/PG gate', votes: 64 },
    { id: 4, label: 'Need quick-commerce order pooling for late-night exams', votes: 112 },
  ]);
  const [hasVoted, setHasVoted] = useState<number | null>(null);

  const handlePollVote = (id: number) => {
    if (hasVoted) return;
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt))
    );
    setHasVoted(id);
  };

 const handleSubmitComment = (e: React.FormEvent) => {
  e.preventDefault();

  setFeedbackError(null);

  if (!authorName.trim() || !commentText.trim()) {
    setFeedbackError('Please enter your name and comment.');
    return;
  }

  const avatarSeed = authorName.trim().replace(/\s+/g, '');

  onAddComment({
    authorName: authorName.trim(),
    authorRole: authorRole.trim() || 'Community Member',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
    comment: commentText.trim(),
    location: location.trim() || 'India',
  });

  setAuthorName('');
  setAuthorRole('');
  setCommentText('');
};
    const [feedbackError, setFeedbackError] = useState<string | null>(null);

    const avatarSeed = authorName.trim().replace(/\s+/g, '');

    onAddComment({
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || 'Community Member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
      comment: commentText.trim(),
      location: location.trim() || 'India',
    });

    setAuthorName('');
    setAuthorRole('');
    setCommentText('');
  };

  const totalPollVotes = pollOptions.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="space-y-10">
      
      {/* Founders & Building in Public Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Building in Public
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            We're validating 1FORM with real communities.
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            "In hostels, PGs, and residential communities, hundreds of residents order from the exact same quick-commerce platforms at the exact same time. Yet there is no simple way for them to combine orders and benefit together."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yashavant" alt="Yashavant CK" className="w-8 h-8 rounded-full border border-emerald-500 bg-white" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vadiraj" alt="Vadiraj Joshi" className="w-8 h-8 rounded-full border border-teal-500 bg-white" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Created By</span>
                <strong className="text-slate-900 font-extrabold">Yashavant CK & Vadiraj Joshi</strong>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gathering feedback towards MVP 1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Poll Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Community Pulse</span>
          <h3 className="text-xl font-extrabold text-slate-900">Which quick-commerce problem affects you most?</h3>
        </div>

        <div className="space-y-3">
          {pollOptions.map((opt) => {
            const pct = Math.round((opt.votes / totalPollVotes) * 100);
            return (
              <button
                key={opt.id}
                onClick={() => handlePollVote(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                  hasVoted === opt.id
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                {/* Background vote progress bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-200/50 transition-all duration-500 pointer-events-none"
                  style={{ width: `${pct}%` }}
                ></div>

                <div className="relative z-10 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <span className="font-semibold text-slate-800">{opt.label}</span>
                  <span className="font-mono font-extrabold text-emerald-800 shrink-0">
                    {opt.votes} votes ({pct}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Feedback Form & Comments List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Add Feedback Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Join the Public Discussion</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Do you face this problem in your hostel or PG? Tell us your story or request a feature directly!
          </p>

          <form onSubmit={handleSubmitComment} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            />

            <input
              type="text"
              placeholder="Your Role / Hostel (e.g., Hostel 4 Resident / PG Warden)"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            />

            <input
              type="text"
              placeholder="City / Campus Location (e.g. Koramangala / Powai)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            />

            <textarea
              required
              rows={3}
              placeholder="Share your delivery fee story or feedback for Yashavant & Vadiraj..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            ></textarea>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Community Comment</span>
            </button>
          </form>
        </div>

        {/* Right: Comments Thread */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Community Comments ({comments.length})
          </h3>

          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 transition-all hover:border-slate-300 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.authorName}
                      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        {c.authorName}
                        {c.authorName.includes('Yashavant') || c.authorName.includes('Vadiraj') ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-2 py-0.2 rounded-full">
                            Co-Founder
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {c.authorRole} • <span className="text-slate-400">{c.location}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">{c.createdAt}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{c.comment}"
                </p>

                {/* Founder Reply Callout */}
                {c.replyFromFounder && (
                  <div className="bg-emerald-50 border-l-2 border-emerald-500 p-3 rounded-r-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Reply from Yashavant & Vadiraj
                    </span>
                    <p className="text-slate-700 italic font-medium">{c.replyFromFounder}</p>
                  </div>
                )}

                {/* Upvote Button */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onUpvoteComment(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                      c.hasUpvoted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.upvotes} Upvotes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
