import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Smile,
  Meh,
  Frown,
  Heart,
  TrendingUp,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  Coffee,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { User } from '../../types/workhub';

interface TeamMoodWidgetProps {
  currentUser: User;
}

interface SentimentOption {
  id: string;
  emoji: string;
  label: string;
  score: number;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SENTIMENT_OPTIONS: SentimentOption[] = [
  {
    id: 'energized',
    emoji: '🤩',
    label: 'Energized',
    score: 5,
    description: 'Highly motivated & high bandwidth',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  {
    id: 'good',
    emoji: '😊',
    label: 'Good & Focused',
    score: 4,
    description: 'Productive, clear priorities',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    score: 3,
    description: 'Steady, pacing evenly',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  {
    id: 'tired',
    emoji: '🥱',
    label: 'Tired',
    score: 2,
    description: 'Low battery, needing recovery',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
  },
  {
    id: 'stressed',
    emoji: '😫',
    label: 'Stressed',
    score: 1,
    description: 'Overwhelmed or facing blockers',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
  },
];

// Baseline weekly trend data for team managers
const INITIAL_WEEKLY_DATA = [
  { day: 'Mon', teamScore: 3.8, benchmark: 3.6, checkIns: 14, dominantMood: 'Focused' },
  { day: 'Tue', teamScore: 4.1, benchmark: 3.7, checkIns: 15, dominantMood: 'Energized' },
  { day: 'Wed', teamScore: 4.3, benchmark: 3.9, checkIns: 16, dominantMood: 'Good' },
  { day: 'Thu', teamScore: 4.0, benchmark: 3.8, checkIns: 14, dominantMood: 'Neutral' },
  { day: 'Fri', teamScore: 4.4, benchmark: 4.1, checkIns: 15, dominantMood: 'Energized' },
  { day: 'Sat', teamScore: 4.2, benchmark: 3.9, checkIns: 8, dominantMood: 'Relaxed' },
  { day: 'Sun (Today)', teamScore: 4.2, benchmark: 4.0, checkIns: 12, dominantMood: 'Good' },
];

export const TeamMoodWidget: React.FC<TeamMoodWidgetProps> = ({ currentUser }) => {
  const storageKey = `workhub_team_mood_${currentUser.id || 'default'}`;

  // User's logged mood for today
  const [selectedSentimentId, setSelectedSentimentId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });

  const [optionalNote, setOptionalNote] = useState('');
  const [hasSubmittedToday, setHasSubmittedToday] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(storageKey));
    } catch {
      return false;
    }
  });

  const [viewTab, setViewTab] = useState<'checkin' | 'trends'>('trends');
  const [selectedSubteam, setSelectedSubteam] = useState('All Engineering');
  const [weeklyData, setWeeklyData] = useState(INITIAL_WEEKLY_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  const handleSelectSentiment = (sentiment: SentimentOption) => {
    setSelectedSentimentId(sentiment.id);
    setHasSubmittedToday(true);

    try {
      localStorage.setItem(storageKey, sentiment.id);
    } catch (e) {
      console.warn('Failed to save mood check-in:', e);
    }

    // Update today's score in weekly data reactively
    setWeeklyData((prev) =>
      prev.map((item, idx) => {
        if (idx === prev.length - 1) {
          const updatedScore = Number(((item.teamScore * item.checkIns + sentiment.score) / (item.checkIns + 1)).toFixed(1));
          return {
            ...item,
            teamScore: updatedScore,
            checkIns: item.checkIns + 1,
            dominantMood: sentiment.label,
          };
        }
        return item;
      })
    );

    setToastMessage(`Your check-in (${sentiment.emoji} ${sentiment.label}) has been logged for today!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentSelection = SENTIMENT_OPTIONS.find((s) => s.id === selectedSentimentId);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-700 backdrop-blur-xs min-w-[170px] space-y-1">
          <div className="font-bold text-slate-100 border-b border-slate-700 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-emerald-400 font-extrabold">{data.teamScore} / 5.0</span>
          </div>
          <div className="text-[11px] space-y-0.5 pt-1 text-slate-300">
            <p>
              <strong className="text-emerald-300">Team Score:</strong> {data.teamScore}
            </p>
            <p>
              <strong className="text-indigo-300">Benchmark:</strong> {data.benchmark}
            </p>
            <p>
              <strong className="text-slate-400">Dominant Mood:</strong> {data.dominantMood}
            </p>
            <p className="text-[10px] text-slate-400 pt-0.5">
              {data.checkIns} team members participated
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-col lg:flex-col xl:flex-row xl:items-center justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900 truncate">
                Team Mood & Sentiment Pulse
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                Weekly Health: 4.2 / 5.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Daily sentiment check-ins & weekly leadership trends across your engineering group
            </p>
          </div>
        </div>

        {/* View Switcher: Check-in vs Weekly Trends */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold self-start xl:self-auto shrink-0">
          <button
            onClick={() => setViewTab('checkin')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              viewTab === 'checkin'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Check-in</span>
            {hasSubmittedToday && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setViewTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              viewTab === 'trends'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Weekly Trends</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
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

      {/* ================= TAB 1: DAILY CHECK-IN ================= */}
      {viewTab === 'checkin' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              How are you feeling about work today, {currentUser.name.split(' ')[0]}?
            </h3>
            <p className="text-[11px] text-slate-500">
              Your feedback is aggregated into the weekly team average to help leadership monitor workload and burnout.
            </p>
          </div>

          {/* Sentiment Selection Grid - adapts cleanly across mobile, tablet, and desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-5 gap-2 sm:gap-2.5">
            {SENTIMENT_OPTIONS.map((opt, idx) => {
              const isSelected = selectedSentimentId === opt.id;
              const isLastItemOnTwoCol = idx === SENTIMENT_OPTIONS.length - 1;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectSentiment(opt)}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-between gap-1.5 cursor-pointer min-w-0 ${
                    isLastItemOnTwoCol ? 'col-span-2 sm:col-span-1 md:col-span-2 xl:col-span-1' : ''
                  } ${
                    isSelected
                      ? `${opt.bgColor} ${opt.borderColor} ring-2 ring-emerald-500/20 shadow-xs scale-[1.01]`
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <span className="text-2xl transform hover:scale-110 transition">{opt.emoji}</span>
                  <div className="w-full text-center min-w-0">
                    <span className={`text-xs font-bold leading-tight block truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">{opt.description}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-600 text-white mt-0.5">
                      Logged
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Optional Reflection Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {currentSelection
                  ? `Logged today as: ${currentSelection.emoji} ${currentSelection.label}. Tap another mood to update.`
                  : 'Select your mood above to log today’s sentiment.'}
              </span>
            </div>

            <button
              onClick={() => setViewTab('trends')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Team Weekly Line Chart</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WEEKLY RECHARTS TRENDS ================= */}
      {viewTab === 'trends' && (
        <div className="space-y-4">
          {/* Quick Metrics KPI row: 2x2 grid on mobile/tablet, 4 columns on large screens */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block truncate">
                Avg Sentiment
              </span>
              <div className="flex flex-wrap items-baseline gap-1 mt-1">
                <span className="text-lg sm:text-xl font-black text-emerald-950">4.2</span>
                <span className="text-[10px] font-semibold text-emerald-700">/ 5.0 (Good)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block truncate">
                Check-in Rate
              </span>
              <div className="flex flex-wrap items-baseline gap-1 mt-1">
                <span className="text-lg sm:text-xl font-black text-blue-950">92%</span>
                <span className="text-[10px] font-semibold text-blue-700 truncate">14/15 logged</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block truncate">
                Dominant Emotion
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base sm:text-lg">😊</span>
                <span className="text-xs sm:text-sm font-black text-indigo-950 truncate">Focused</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block truncate">
                Burnout Risk
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs sm:text-sm font-bold text-amber-950 truncate">✓ Optimal Band</span>
              </div>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="space-y-1 pt-1">
            <div className="flex flex-col gap-2 pb-1 sm:flex-row sm:items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 min-w-0">
                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Weekly Trajectory (7-Day)</span>
              </div>

              {/* Department subteam selector */}
              <div className="flex items-center gap-1 text-[11px] text-slate-500 self-start sm:self-auto shrink-0">
                <span>Scope:</span>
                <select
                  value={selectedSubteam}
                  onChange={(e) => setSelectedSubteam(e.target.value)}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="All Engineering">All Engineering</option>
                  <option value="Backend Team">Backend Team</option>
                  <option value="Frontend Team">Frontend Team</option>
                  <option value="DevOps Team">DevOps Team</option>
                </select>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-1">
              <div className="min-w-[280px] sm:min-w-0 h-52 pt-2 bg-slate-50/50 p-2 sm:p-3 rounded-xl border border-slate-200/80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    width={22}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: 8, fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="teamScore"
                    name="Team Average Mood"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    name="Company Benchmark"
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

          {/* Quick Check-in CTA row if not logged today */}
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
            <span className="text-slate-500 text-[11px]">
              {selectedSentimentId ? (
                <>Your check-in is logged: <strong className="text-slate-800">{currentSelection?.emoji} {currentSelection?.label}</strong></>
              ) : (
                <>You haven't logged your sentiment yet today.</>
              )}
            </span>

            <button
              onClick={() => setViewTab('checkin')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              {selectedSentimentId ? 'Change My Sentiment' : 'Log Today’s Check-in'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
