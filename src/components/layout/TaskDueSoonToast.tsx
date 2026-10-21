import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
  Calendar,
  CheckCircle2,
  Flame,
  BellRing
} from 'lucide-react';
import { OffboardingRecord, OffboardingTask, User } from '../../types/workhub';

interface TaskDueSoonToastProps {
  offboarding?: OffboardingRecord;
  currentUser: User;
  onNavigate: (tab: string) => void;
  autoCloseDuration?: number; // default 8000ms
}

interface UrgentToastTask extends OffboardingTask {
  hoursDiff: number;
  daysDiff: number;
  timeLabel: string;
  isOverdue: boolean;
}

export const TaskDueSoonToast: React.FC<TaskDueSoonToastProps> = ({
  offboarding,
  currentUser,
  onNavigate,
  autoCloseDuration = 8500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Compute tasks due within 48 hours (or overdue)
  const urgentTasks: UrgentToastTask[] = useMemo(() => {
    if (!offboarding?.tasks) return [];

    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const pending = offboarding.tasks.filter((t) => t.status !== 'completed');
    const dueSoonList: UrgentToastTask[] = [];

    for (const task of pending) {
      if (!task.dueDate) continue;

      const dueDate = new Date(task.dueDate);
      // Set to end of due date if no specific time
      if (!task.dueDate.includes('T')) {
        dueDate.setHours(23, 59, 59, 999);
      }

      const diffMs = dueDate.getTime() - now.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Check if task deadline is within 48 hours or overdue
      if (diffHours <= 48) {
        let timeLabel = '';
        let isOverdue = false;

        if (diffHours < 0) {
          isOverdue = true;
          const overdueDays = Math.abs(diffDays);
          timeLabel = overdueDays === 0 ? 'Overdue today' : `${overdueDays}d overdue`;
        } else if (diffHours <= 12) {
          timeLabel = `Due in ${Math.max(1, diffHours)}h today`;
        } else if (diffHours <= 24) {
          timeLabel = 'Due today';
        } else {
          timeLabel = 'Due tomorrow';
        }

        dueSoonList.push({
          ...task,
          hoursDiff: diffHours,
          daysDiff: diffDays,
          timeLabel,
          isOverdue,
        });
      }
    }

    // Sort: overdue first, then nearest hours remaining
    dueSoonList.sort((a, b) => a.hoursDiff - b.hoursDiff);
    return dueSoonList;
  }, [offboarding]);

  // Show toast on page load / mount if urgent tasks exist and not dismissed for this session
  useEffect(() => {
    if (urgentTasks.length === 0) return;

    const sessionKey = `workhub_seen_toast_${currentUser.id || 'default'}`;
    const alreadyShown = sessionStorage.getItem(sessionKey);

    if (!alreadyShown) {
      // Small 1.2s delay after page load for smooth natural appearance
      const appearTimer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem(sessionKey, 'true');
      }, 1200);

      return () => clearTimeout(appearTimer);
    }
  }, [urgentTasks, currentUser.id]);

  // Handle countdown timer & auto-dismiss
  useEffect(() => {
    if (!isVisible || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const decrement = (stepMs / autoCloseDuration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setIsVisible(false);
          return 0;
        }
        return prev - decrement;
      });
    }, stepMs);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, autoCloseDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isVisible, isPaused, autoCloseDuration]);

  if (!isVisible || urgentTasks.length === 0) {
    return null;
  }

  const primaryTask = urgentTasks[0];
  const additionalCount = urgentTasks.length - 1;
  const isHighPriority = primaryTask.isOverdue || primaryTask.hoursDiff <= 24;

  const handleActionClick = () => {
    setIsVisible(false);
    onNavigate('offboarding');
  };

  return (
    <aside
      aria-label="Task deadline notification"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 sm:max-w-sm w-auto bg-slate-900/95 text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all group"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isHighPriority
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}
          >
            {isHighPriority ? (
              <Flame className="w-4 h-4 fill-current" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                Task Due Soon
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  primaryTask.isOverdue
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {primaryTask.timeLabel}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white leading-tight mt-0.5 line-clamp-1">
              {primaryTask.title}
            </h4>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description & Metadata */}
      <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
        {primaryTask.description}
      </p>

      {/* Footer Action Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-400">
          {additionalCount > 0 ? (
            <span className="font-semibold text-amber-300">
              +{additionalCount} other task{additionalCount > 1 ? 's' : ''} due soon
            </span>
          ) : (
            <span className="capitalize">{primaryTask.assignedRole} Action</span>
          )}
        </div>

        <button
          onClick={handleActionClick}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer group-hover:scale-105"
        >
          <span>Complete Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 rounded-b-2xl overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className={`h-full transition-all duration-75 ${
            isHighPriority ? 'bg-rose-500' : 'bg-amber-400'
          }`}
        />
      </div>
    </aside>
  );
};
