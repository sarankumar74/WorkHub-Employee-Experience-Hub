import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import {
  Vote,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  RotateCcw,
  Sparkles,
  Send,
  CalendarDays
} from 'lucide-react';
import { User } from '../../types/workhub';

interface CompanyPollWidgetProps {
  currentUser: User;
}

interface PollOption {
  id: string;
  text: string;
  shortLabel: string;
  votes: number;
  color?: string;
}

interface WeeklyPoll {
  id: string;
  weekLabel: string;
  question: string;
  category: string;
  endDate: string;
  totalVotes: number;
  options: PollOption[];
  isActive: boolean;
}

const WEEKLY_POLLS: WeeklyPoll[] = [
  {
    id: 'wp-42',
    weekLabel: 'Week 42 · Current',
    question: 'Hybrid Collaboration: Which anchor day brings the highest value for in-person sprint planning & whiteboarding?',
    category: 'Workplace',
    endDate: 'Friday, 5:00 PM',
    totalVotes: 146,
    isActive: true,
    options: [
      { id: 'opt-42-wed', text: 'Wednesday (Mid-week focus)', shortLabel: 'Wednesday', votes: 54, color: '#10B981' },
      { id: 'opt-42-tue', text: 'Tuesday (Sprint kickoffs)', shortLabel: 'Tuesday', votes: 46, color: '#3B82F6' },
      { id: 'opt-42-thu', text: 'Thursday (Demos & reviews)', shortLabel: 'Thursday', votes: 32, color: '#6366F1' },
      { id: 'opt-42-fri', text: 'Friday (Team retros & socials)', shortLabel: 'Friday', votes: 14, color: '#F59E0B' },
    ],
  },
  {
    id: 'wp-41',
    weekLabel: 'Week 41',
    question: 'Learning & Dev: Which skill area should we prioritize for company-sponsored workshops next quarter?',
    category: 'Professional Growth',
    endDate: 'Completed',
    totalVotes: 162,
    isActive: false,
    options: [
      { id: 'opt-41-ai', text: 'GenAI & Autonomous Agent Workflows', shortLabel: 'GenAI & Agents', votes: 68, color: '#6366F1' },
      { id: 'opt-41-arch', text: 'Distributed Systems & Cloud Architecture', shortLabel: 'System Design', votes: 44, color: '#3B82F6' },
      { id: 'opt-41-prod', text: 'Product Strategy & Data Metrics', shortLabel: 'Product & Metrics', votes: 31, color: '#10B981' },
      { id: 'opt-41-lead', text: 'Engineering Leadership & Mentorship', shortLabel: 'Leadership', votes: 19, color: '#EC4899' },
    ],
  },
  {
    id: 'wp-40',
    weekLabel: 'Week 40',
    question: 'All-Hands Format: What is your preferred duration and cadence for company town halls?',
    category: 'Company Culture',
    endDate: 'Completed',
    totalVotes: 139,
    isActive: false,
    options: [
      { id: 'opt-40-bi', text: 'Monthly (45 mins with product deep-dives)', shortLabel: 'Monthly (45m)', votes: 62, color: '#3B82F6' },
      { id: 'opt-40-mo', text: 'Bi-weekly (30 mins concise roadmap sync)', shortLabel: 'Bi-weekly (30m)', votes: 55, color: '#10B981' },
      { id: 'opt-40-qt', text: 'Quarterly (60 mins with open leadership AMA)', shortLabel: 'Quarterly (60m)', votes: 22, color: '#8B5CF6' },
    ],
  },
];

export const CompanyPollWidget: React.FC<CompanyPollWidgetProps> = ({ currentUser }) => {
  const votesStorageKey = `workhub_company_poll_user_votes_${currentUser.id || 'default'}`;
  const pollsDataStorageKey = `workhub_company_polls_data_v2`;

  // Stored polls data with reactive vote counts
  const [polls, setPolls] = useState<WeeklyPoll[]>(() => {
    try {
      const saved = localStorage.getItem(pollsDataStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved company polls:', e);
    }
    return WEEKLY_POLLS;
  });

  // Stored user votes: { [pollId]: optionId }
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(votesStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse user votes:', e);
    }
    return {};
  });

  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'vote' | 'results'>('vote');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPoll = polls[currentPollIndex] || polls[0];
  const userVotedOptionId = userVotes[currentPoll.id];

  // Auto-switch to results if user has already voted on this poll
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
      localStorage.setItem(votesStorageKey, JSON.stringify(userVotes));
    } catch (e) {
      console.warn('Failed to save company poll votes:', e);
    }
  }, [userVotes, votesStorageKey]);

  // Persist polls data
  useEffect(() => {
    try {
      localStorage.setItem(pollsDataStorageKey, JSON.stringify(polls));
    } catch (e) {
      console.warn('Failed to save company polls data:', e);
    }
  }, [polls, pollsDataStorageKey]);

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
        if (prevOptionId && opt.id === prevOptionId) {
          count = Math.max(0, count - 1);
        }
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
      setToastMessage('Vote recorded! Recharts results updated in real-time.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 250);
  };

  const handleChangeVote = () => {
    setViewMode('vote');
    setSelectedOptionId(userVotes[currentPoll.id] || null);
  };

  // Prepare chart data for Recharts
  const chartData = useMemo(() => {
    if (!currentPoll || !currentPoll.options) return [];
    return currentPoll.options.map((opt) => {
      const percentage = currentPoll.totalVotes > 0
        ? Math.round((opt.votes / currentPoll.totalVotes) * 100)
        : 0;
      const isUserChoice = opt.id === userVotedOptionId;

      return {
        id: opt.id,
        name: opt.shortLabel,
        fullText: opt.text,
        votes: opt.votes,
        totalVotes: currentPoll.totalVotes,
        percentage,
        isUserChoice,
        color: isUserChoice ? '#10B981' : (opt.color || '#3B82F6'),
      };
    });
  }, [currentPoll, userVotedOptionId]);

  // Leading option calculation
  const leadingOption = useMemo(() => {
    if (!currentPoll || !currentPoll.options.length) return null;
    return [...currentPoll.options].sort((a, b) => b.votes - a.votes)[0];
  }, [currentPoll]);

  const leadingPercentage = useMemo(() => {
    if (!leadingOption || currentPoll.totalVotes === 0) return 0;
    return Math.round((leadingOption.votes / currentPoll.totalVotes) * 100);
  }, [leadingOption, currentPoll]);

  // Enhanced Recharts Custom Tooltip showing precise vote count & details
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.totalVotes || currentPoll.totalVotes || 0;
      const precisePercent = total > 0 ? ((data.votes / total) * 100).toFixed(1) : '0.0';

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl text-xs shadow-2xl border border-slate-700/80 backdrop-blur-md min-w-[220px] max-w-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
          {/* Header with Option Name & Color Accent */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: data.color }}
              />
              <span className="font-bold text-slate-100 truncate text-xs">{data.name}</span>
            </div>
            <span className="text-emerald-400 font-black text-sm shrink-0">
              {data.percentage}%
            </span>
          </div>

          {/* Full Option Description */}
          <p className="text-[11px] text-slate-300 leading-snug font-normal">
            {data.fullText}
          </p>

          {/* Precise Vote Count Highlight Card */}
          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Precise Vote Count:</span>
              <span className="font-extrabold text-white text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/40">
                {data.votes} {data.votes === 1 ? 'vote' : 'votes'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Pool Share:</span>
              <span className="font-semibold text-slate-200">
                {data.votes} of {total} total votes ({precisePercent}%)
              </span>
            </div>

            {/* Mini Progress Bar inside Tooltip */}
            <div className="w-full bg-slate-700/70 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${data.percentage}%`,
                  backgroundColor: data.color,
                }}
              />
            </div>
          </div>

          {/* User Voted Badge */}
          {data.isUserChoice && (
            <div className="pt-1 border-t border-slate-800 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 -mx-1 px-2 py-1 rounded-lg border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Your active vote on this poll</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Header with Title and Week Controls */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-col lg:flex-col xl:flex-row xl:items-center justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
            <Vote className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900 truncate">
                Company Poll
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                Weekly Pulse
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vote on weekly team questions with live Recharts bar chart analytics
            </p>
          </div>
        </div>

        {/* Week Switcher & View Toggle - flex-wrap and full width on tablet so buttons never overflow */}
        <div className="flex flex-wrap items-center justify-between gap-2 w-full xl:w-auto xl:justify-end">
          {/* Week Selector buttons */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setCurrentPollIndex((prev) => (prev > 0 ? prev - 1 : polls.length - 1))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Previous Week Poll"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700 text-xs whitespace-nowrap">
              {currentPoll.weekLabel}
            </span>
            <button
              onClick={() => setCurrentPollIndex((prev) => (prev < polls.length - 1 ? prev + 1 : 0))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
              title="Next Week Poll"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle View: Vote vs Recharts Results */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setViewMode('vote')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'vote'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Vote
            </button>
            <button
              onClick={() => setViewMode('results')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'results'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {toastMessage && (
        <div className="p-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Poll Details */}
      <div className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">{currentPoll.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {currentPoll.isActive ? `Closes ${currentPoll.endDate}` : 'Voting Closed'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {currentPoll.totalVotes} total votes
            </span>
          </div>

          <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
            {currentPoll.question}
          </h3>
        </div>

        {/* ================= VIEW 1: VOTE INTERACTION ================= */}
        {viewMode === 'vote' ? (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              {currentPoll.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isUserChoice = userVotedOptionId === option.id;

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

                    {isUserChoice && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        Your Pick
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Voting Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {userVotedOptionId
                  ? 'You already voted on this question. You can change your choice anytime.'
                  : 'Select an option to participate in this week’s company poll.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('results')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  View Chart
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
          /* ================= VIEW 2: RECHARTS BAR CHART RESULTS ================= */
          <div className="space-y-4 pt-1">
            {/* Recharts Bar Chart Container */}
            <div className="bg-slate-50/60 p-3 sm:p-4 rounded-xl border border-slate-200/80">
              <div className="h-56 md:h-64 w-full">
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 8, right: 34, left: -10, bottom: 8 }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                        unit="%"
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        width={78}
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 6 }}
                        wrapperStyle={{ zIndex: 100 }}
                      />
                      <Bar
                        dataKey="percentage"
                        radius={[0, 6, 6, 0]}
                        isAnimationActive={true}
                        animationDuration={600}
                      >
                        <LabelList
                          dataKey="percentage"
                          position="right"
                          formatter={(val: any) => `${val}%`}
                          style={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                        />
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={entry.isUserChoice ? '#10B981' : entry.color}
                            opacity={entry.isUserChoice ? 1 : 0.88}
                            className="cursor-pointer transition-opacity hover:opacity-100"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

            {/* Results Bottom Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Top Choice:</strong> {leadingOption?.shortLabel} ({leadingPercentage}% with {leadingOption?.votes} votes)
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
