import React, { useState, useEffect, useMemo } from 'react';
import {
  Vote,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Shield,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { EmployeePoll, User } from '../../types/workhub';
import { INITIAL_POLLS } from '../../data/mockData';
import { D3PollBarChart } from './D3PollBarChart';

interface EmployeePulseCardProps {
  currentUser: User;
  onNavigate?: (tab: string) => void;
}

export const EmployeePulseCard: React.FC<EmployeePulseCardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const storageVotesKey = `workhub_pulse_votes_${currentUser.id || 'default'}`;
  const storagePollsKey = `workhub_pulse_polls_data`;

  // Initialize polls state with local overrides if available
  const [polls, setPolls] = useState<EmployeePoll[]>(() => {
    try {
      const saved = localStorage.getItem(storagePollsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_POLLS;
  });

  // Track which option the current user has voted on for each poll: { [pollId]: optionId }
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageVotesKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [activePollIndex, setActivePollIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'vote' | 'results'>('vote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPoll = polls[activePollIndex] || polls[0];
  const userVotedOptionId = userVotes[currentPoll.id];

  // Auto-switch to 'results' if user has already voted on this poll
  useEffect(() => {
    if (userVotedOptionId) {
      setViewMode('results');
      setSelectedOptionId(userVotedOptionId);
    } else {
      setViewMode('vote');
      setSelectedOptionId(null);
    }
  }, [currentPoll.id, userVotedOptionId]);

  // Persist user votes
  useEffect(() => {
    try {
      localStorage.setItem(storageVotesKey, JSON.stringify(userVotes));
    } catch (err) {
      console.warn('Failed to save pulse votes:', err);
    }
  }, [userVotes, storageVotesKey]);

  // Persist updated polls
  useEffect(() => {
    try {
      localStorage.setItem(storagePollsKey, JSON.stringify(polls));
    } catch (err) {
      console.warn('Failed to save polls data:', err);
    }
  }, [polls, storagePollsKey]);

  // Handle voting
  const handleVoteSubmit = () => {
    if (!selectedOptionId) return;

    setIsSubmitting(true);

    const prevOptionId = userVotes[currentPoll.id];

    // Update poll counts
    const updatedPolls = polls.map((p) => {
      if (p.id !== currentPoll.id) return p;

      const newOptions = p.options.map((opt) => {
        let count = opt.votes;
        // If changing vote from an existing option, decrement previous
        if (prevOptionId && opt.id === prevOptionId) {
          count = Math.max(0, count - 1);
        }
        // Increment new option
        if (opt.id === selectedOptionId) {
          count += 1;
        }
        return { ...opt, votes: count };
      });

      const total = newOptions.reduce((acc, o) => acc + o.votes, 0);

      return {
        ...p,
        options: newOptions,
        totalVotes: total,
      };
    });

    setPolls(updatedPolls);
    setUserVotes((prev) => ({
      ...prev,
      [currentPoll.id]: selectedOptionId,
    }));

    setTimeout(() => {
      setIsSubmitting(false);
      setViewMode('results');
      setToastMessage('Vote recorded anonymously! Results updated.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 250);
  };

  // Allow user to reset or change their vote
  const handleChangeVote = () => {
    setViewMode('vote');
    setSelectedOptionId(userVotes[currentPoll.id] || null);
  };

  // Next/prev poll controls
  const handlePrevPoll = () => {
    setActivePollIndex((prev) => (prev > 0 ? prev - 1 : polls.length - 1));
  };

  const handleNextPoll = () => {
    setActivePollIndex((prev) => (prev < polls.length - 1 ? prev + 1 : 0));
  };

  // Calculate leading option
  const leadingOption = useMemo(() => {
    if (!currentPoll || !currentPoll.options.length) return null;
    return [...currentPoll.options].sort((a, b) => b.votes - a.votes)[0];
  }, [currentPoll]);

  const leadingPercent = useMemo(() => {
    if (!leadingOption || currentPoll.totalVotes === 0) return 0;
    return Math.round((leadingOption.votes / currentPoll.totalVotes) * 100);
  }, [leadingOption, currentPoll]);

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900">
                Employee Pulse & Polls
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Live Feedback
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active company-wide surveys shaping workplace decisions and culture
            </p>
          </div>
        </div>

        {/* Poll Switcher & Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mr-1">
            <span>Poll {activePollIndex + 1} of {polls.length}</span>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={handlePrevPoll}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Previous Poll"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPoll}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Next Poll"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View toggle (Vote vs Results) */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('vote')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'vote'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vote
            </button>
            <button
              onClick={() => setViewMode('results')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'results'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast confirmation */}
      {toastMessage && (
        <div className="p-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Poll Card Content */}
      <div className="space-y-4">
        {/* Question & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">{currentPoll.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Closes {currentPoll.endDate}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {currentPoll.totalVotes} votes cast
            </span>
            {currentPoll.anonymous && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Anonymous
                </span>
              </>
            )}
          </div>

          <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
            {currentPoll.question}
          </h3>

          {currentPoll.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentPoll.description}
            </p>
          )}
        </div>

        {/* Voting View */}
        {viewMode === 'vote' ? (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              {currentPoll.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isSavedUserVote = userVotedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-xs md:text-sm font-medium leading-tight ${
                          isSelected ? 'font-bold text-indigo-950' : 'text-slate-800'
                        }`}
                      >
                        {option.text}
                      </span>
                    </div>

                    {isSavedUserVote && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        Current Pick
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Voting Footer Action */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400">
                {userVotedOptionId ? (
                  <span>You have already voted on this poll. Submitting will update your choice.</span>
                ) : (
                  <span>Select an option to record your perspective.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('results')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  View Current Standings
                </button>
                <button
                  type="button"
                  disabled={!selectedOptionId || isSubmitting}
                  onClick={handleVoteSubmit}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{userVotedOptionId ? 'Update Vote' : 'Submit Vote'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results View with D3 Bar Chart */
          <div className="space-y-4 pt-1">
            {/* D3 Bar Chart Component */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
              <D3PollBarChart
                options={currentPoll.options}
                totalVotes={currentPoll.totalVotes}
                userVotedOptionId={userVotedOptionId}
              />
            </div>

            {/* Results Bottom Summary & Change Vote */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Top Choice:</strong> {leadingOption?.text} ({leadingPercent}%)
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleChangeVote}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold transition text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>{userVotedOptionId ? 'Change My Vote' : 'Cast My Vote'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
