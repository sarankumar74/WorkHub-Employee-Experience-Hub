import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Flame,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { DailyGoal, User } from '../../types/workhub';

interface DailyGoalsWidgetProps {
  currentUser: User;
}

const DEFAULT_SAMPLE_GOALS: DailyGoal[] = [
  {
    id: 'goal-1',
    title: 'Review & approve Payment Platform idempotency PR #245',
    completed: true,
    priority: 'high',
    createdAt: 'Today, 9:00 AM',
  },
  {
    id: 'goal-2',
    title: 'Prepare transition & handover notes for 1:1 sync with John Smith',
    completed: false,
    priority: 'high',
    createdAt: 'Today, 9:15 AM',
  },
  {
    id: 'goal-3',
    title: 'Publish updated Loom walkthrough in team documentation RFC',
    completed: false,
    priority: 'medium',
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'goal-4',
    title: 'Vote on Q4 Hybrid Work Rhythm in Employee Pulse',
    completed: false,
    priority: 'low',
    createdAt: 'Today, 11:00 AM',
  },
];

export const DailyGoalsWidget: React.FC<DailyGoalsWidgetProps> = ({ currentUser }) => {
  const storageKey = `workhub_daily_goals_${currentUser.id || 'default'}`;

  // Load goals from localStorage or fallback to sample
  const [goals, setGoals] = useState<DailyGoal[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved daily goals:', e);
    }
    return DEFAULT_SAMPLE_GOALS;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<DailyGoal['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to save daily goals:', e);
    }
  }, [goals, storageKey]);

  // Handle adding goal
  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const newGoal: DailyGoal = {
      id: `goal-${Date.now()}`,
      title: trimmed,
      completed: false,
      priority: newPriority,
      createdAt: 'Just now',
    };

    setGoals((prev) => [newGoal, ...prev]);
    setNewTitle('');
    inputRef.current?.focus();
  };

  // Handle toggling goal completion
  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  // Handle deleting goal
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Clear completed goals
  const handleClearCompleted = () => {
    setGoals((prev) => prev.filter((g) => !g.completed));
  };

  // Reset to default sample goals
  const handleResetSample = () => {
    setGoals(DEFAULT_SAMPLE_GOALS);
  };

  // Computed metrics
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.completed).length;
  const activeCount = totalCount - completedCount;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Filtered goals list
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (filter === 'active') return !g.completed;
      if (filter === 'completed') return g.completed;
      return true;
    });
  }, [goals, filter]);

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900">
                Daily Goals & Focus Items
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {completedCount}/{totalCount} Done
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personal daily milestones stored locally in your browser
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'active'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Today's Goal Progress</span>
          <span className="text-emerald-700 font-bold">{percentCompleted}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Celebration Banner when 100% complete */}
      {allCompleted && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              All daily goals completed! Outstanding execution today. 🎉
            </span>
          </div>
          <button
            onClick={() => inputRef.current?.focus()}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
          >
            Add Another Goal
          </button>
        </div>
      )}

      {/* Inline Goal Creation Input - spacious layout on tablet & mobile, row on large screens */}
      <form
        onSubmit={handleAddGoal}
        className={`p-2.5 rounded-xl border transition-all flex flex-col xl:flex-row items-stretch xl:items-center gap-2 bg-slate-50/70 ${
          isInputFocused ? 'border-emerald-500 ring-2 ring-emerald-500/15 bg-white' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Plus className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Add a new daily goal or action item... (Press Enter)"
            className="w-full bg-transparent text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between xl:justify-end gap-2 border-t xl:border-t-0 pt-2 xl:pt-0 border-slate-200/80">
          {/* Priority Selection */}
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            <span className="text-slate-400 text-[10px] hidden sm:inline">Priority:</span>
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setNewPriority(p)}
                className={`px-2 py-0.5 rounded-md capitalize transition cursor-pointer ${
                  newPriority === p
                    ? p === 'high'
                      ? 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                      : p === 'medium'
                      ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                      : 'bg-blue-100 text-blue-800 font-bold border border-blue-300'
                    : 'text-slate-500 hover:text-slate-800 bg-white border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition shadow-2xs shrink-0 cursor-pointer"
          >
            Add Goal
          </button>
        </div>
      </form>

      {/* Goal Items List */}
      <div className="space-y-2">
        {filteredGoals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            {filter === 'completed'
              ? 'No completed goals yet. Check off an active goal above!'
              : filter === 'active'
              ? 'No active goals remaining. You are all caught up!'
              : 'No goals found. Add your first daily goal above!'}
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isHigh = goal.priority === 'high';
            const isMedium = goal.priority === 'medium';

            return (
              <div
                key={goal.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                  goal.completed
                    ? 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-50'
                    : isHigh
                    ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300 hover:bg-rose-50/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Checkbox & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleGoal(goal.id)}
                    className="shrink-0 transition-transform active:scale-95 cursor-pointer"
                    title={goal.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500 stroke-[2]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs md:text-sm leading-snug truncate transition-all ${
                        goal.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {goal.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{goal.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Tag & Delete Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize flex items-center gap-1 ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isHigh && <Flame className="w-2.5 h-2.5 fill-current" />}
                    {goal.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Widget Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            {activeCount === 0
              ? 'No pending items'
              : `${activeCount} item${activeCount > 1 ? 's' : ''} left for today`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear Done ({completedCount})</span>
            </button>
          )}

          <button
            onClick={handleResetSample}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 hover:underline cursor-pointer flex items-center gap-1"
            title="Reset to default sample goals"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
