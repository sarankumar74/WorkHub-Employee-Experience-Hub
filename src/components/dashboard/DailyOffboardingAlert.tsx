import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  BellRing,
  Sparkles,
  ShieldAlert,
  ListTodo,
  ArrowUpDown,
  Filter,
  Flame
} from 'lucide-react';
import { OffboardingRecord, OffboardingTask, User } from '../../types/workhub';

interface DailyOffboardingAlertProps {
  offboarding?: OffboardingRecord;
  currentUser: User;
  onNavigate: (tab: string) => void;
}

interface ProcessedTask extends OffboardingTask {
  daysDiff: number;
  urgency: 'overdue' | 'today' | 'upcoming' | 'normal';
  formattedDueDate: string;
}

type SortOption = 'urgency' | 'priority' | 'role';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

const PRIORITY_ORDER: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

export const DailyOffboardingAlert: React.FC<DailyOffboardingAlertProps> = ({
  offboarding,
  currentUser,
  onNavigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `workhub_dismissed_alert_${todayStr}_${currentUser.id || 'default'}`;

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterPriority, setFilterPriority] = useState<PriorityFilter>('all');

  // Sync dismissal state with localStorage
  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  // Analyze pending and in-progress tasks
  const { processedTasks, overdueCount, dueTodayCount, dueSoonCount, highPriorityCount } = useMemo(() => {
    const tasks = offboarding?.tasks || [];
    const pendingOrInProgress = tasks.filter((t) => t.status !== 'completed');
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const processed: ProcessedTask[] = pendingOrInProgress.map((t) => {
      let daysDiff = 999;
      let formatted = 'No deadline';

      if (t.dueDate) {
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - now.getTime();
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        formatted = due.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        });
      }

      let urgency: ProcessedTask['urgency'] = 'normal';
      if (daysDiff < 0) {
        urgency = 'overdue';
      } else if (daysDiff === 0) {
        urgency = 'today';
      } else if (daysDiff <= 7) {
        urgency = 'upcoming';
      }

      return {
        ...t,
        priority: t.priority || (daysDiff <= 0 ? 'high' : daysDiff <= 7 ? 'medium' : 'low'),
        daysDiff,
        urgency,
        formattedDueDate: formatted,
      };
    });

    const overdue = processed.filter((t) => t.urgency === 'overdue').length;
    const today = processed.filter((t) => t.urgency === 'today').length;
    const soon = processed.filter((t) => t.urgency === 'upcoming').length;
    const high = processed.filter((t) => t.priority === 'high').length;

    return {
      processedTasks: processed,
      overdueCount: overdue,
      dueTodayCount: today,
      dueSoonCount: soon,
      highPriorityCount: high,
    };
  }, [offboarding]);

  // Filter & Sort tasks
  const displayedTasks = useMemo(() => {
    let filtered = [...processedTasks];

    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const pA = PRIORITY_ORDER[a.priority || 'medium'] || 2;
        const pB = PRIORITY_ORDER[b.priority || 'medium'] || 2;
        if (pA !== pB) return pA - pB;
        return a.daysDiff - b.daysDiff;
      }
      if (sortBy === 'urgency') {
        return a.daysDiff - b.daysDiff;
      }
      if (sortBy === 'role') {
        return a.assignedRole.localeCompare(b.assignedRole);
      }
      return 0;
    });

    return filtered;
  }, [processedTasks, sortBy, filterPriority]);

  if (processedTasks.length === 0) {
    return null;
  }

  // If user dismissed the notification for today, show a subtle reminder chip that can be re-opened
  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 transition animate-in fade-in shadow-2xs">
        <div className="flex items-center gap-2">
          <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Daily reminder snoozed: <span className="font-semibold">{processedTasks.length} pending offboarding tasks</span> ({highPriorityCount} High Priority)
          </span>
        </div>
        <button
          onClick={handleRestore}
          className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
        >
          View Alert Details
        </button>
      </div>
    );
  }

  const hasHighPriority = overdueCount > 0 || dueTodayCount > 0 || highPriorityCount > 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
        hasHighPriority
          ? 'bg-gradient-to-r from-rose-50/95 via-amber-50/80 to-orange-50/80 border-rose-200/90'
          : 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-yellow-50/80 border-amber-200/80'
      }`}
    >
      {/* Alert Header */}
      <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              hasHighPriority
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}
          >
            {hasHighPriority ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <BellRing className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Offboarding Action Items & Priority Tracker</span>
              </h3>

              {overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                  {overdueCount} Overdue
                </span>
              )}

              {highPriorityCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-600" />
                  {highPriorityCount} High Priority
                </span>
              )}

              {dueTodayCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white uppercase tracking-wider">
                  {dueTodayCount} Due Today
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mt-0.5">
              {hasHighPriority
                ? `Prioritized transition tasks requiring your review, action, or manager handover.`
                : `You have ${processedTasks.length} pending offboarding tasks with upcoming milestones.`}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onNavigate('offboarding')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
              hasHighPriority
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Open Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition cursor-pointer"
            title="Dismiss for today"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Task Items List & Controls */}
      {isExpanded && (
        <div className="p-4 md:p-5 bg-white/70 backdrop-blur-xs space-y-4">
          {/* Sorting & Filter Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 text-xs">
            {/* Priority Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {(['all', 'high', 'medium', 'low'] as const).map((p) => {
                const count =
                  p === 'all'
                    ? processedTasks.length
                    : processedTasks.filter((t) => t.priority === p).length;

                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer capitalize flex items-center gap-1 shrink-0 ${
                      filterPriority === p
                        ? p === 'high'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : p === 'low'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{p === 'all' ? 'All' : p}</span>
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        filterPriority === p
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
              >
                <option value="priority">Priority (High → Low)</option>
                <option value="urgency">Urgency / Due Date</option>
                <option value="role">Assigned Role</option>
              </select>
            </div>
          </div>

          {/* Task Grid - 1 col on mobile, 2 on tablet, 3 on desktop */}
          {displayedTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No tasks found matching the selected priority filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedTasks.slice(0, 6).map((task) => {
                const isOverdue = task.urgency === 'overdue';
                const isToday = task.urgency === 'today';
                const isHigh = task.priority === 'high';
                const isMedium = task.priority === 'medium';

                return (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('offboarding')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isOverdue
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 shadow-2xs'
                        : isHigh
                        ? 'bg-rose-50/40 border-rose-100 hover:border-rose-300 shadow-2xs'
                        : isToday
                        ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                            isHigh
                              ? 'bg-rose-600 text-white'
                              : isMedium
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isHigh && <Flame className="w-2.5 h-2.5 fill-current" />}
                          {task.priority || 'medium'} Priority
                        </span>

                        {/* Due Date Indicator */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isOverdue
                              ? 'bg-rose-200 text-rose-800'
                              : isToday
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {isOverdue
                            ? `${Math.abs(task.daysDiff)}d overdue`
                            : isToday
                            ? 'Due today'
                            : `Due in ${task.daysDiff}d`}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-1">
                        {task.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-slate-600 capitalize">
                          {task.assignedRole}
                        </span>
                        <span>•</span>
                        <span>{task.formattedDueDate}</span>
                      </span>

                      <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                        Complete <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {displayedTasks.length > 6 && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => onNavigate('offboarding')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>View all {displayedTasks.length} pending offboarding tasks in full portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
