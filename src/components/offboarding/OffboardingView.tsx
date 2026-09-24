import React, { useState, useMemo } from 'react';
import {
  LogOut,
  CheckCircle2,
  Circle,
  Clock,
  UserCheck,
  Mail,
  HelpCircle,
  FileCheck,
  ChevronRight,
  AlertTriangle,
  Calendar,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { OffboardingRecord, OffboardingTask, User } from '../../types/workhub';

interface OffboardingViewProps {
  offboarding: OffboardingRecord;
  currentUser: User;
  onUpdateTask: (taskId: string, status: 'completed' | 'pending' | 'in_progress', handoverDetails?: string) => void;
  onOpenArticleByTitle: (title: string) => void;
}

export const OffboardingView: React.FC<OffboardingViewProps> = ({
  offboarding,
  currentUser,
  onUpdateTask,
  onOpenArticleByTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'manager_review' | 'hr_clearance'>('checklist');
  const [handoverNote, setHandoverNote] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);
  const [sortByDueDate, setSortByDueDate] = useState(true);

  // Baseline reference date for 2026 employee context
  const today = useMemo(() => new Date(), []);

  const completedCount = offboarding.tasks.filter((t) => t.status === 'completed').length;
  const totalCount = offboarding.tasks.length;
  const calculatedPercent = Math.round((completedCount / totalCount) * 100);

  // Helper to check if task is overdue
  const isTaskOverdue = (task: OffboardingTask): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.getTime() < today.getTime();
  };

  // Helper to calculate days overdue or days remaining
  const getDueStatus = (task: OffboardingTask) => {
    if (!task.dueDate) return null;
    const taskDate = new Date(task.dueDate);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = taskDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (task.status === 'completed') {
      return {
        label: `Due ${formattedDate}`,
        isOverdue: false,
        daysText: 'Completed on time',
        formattedDate,
      };
    }

    if (diffDays < 0) {
      return {
        label: `Overdue (${Math.abs(diffDays)}d ago - ${formattedDate})`,
        isOverdue: true,
        daysText: `${Math.abs(diffDays)} days overdue`,
        formattedDate,
      };
    }

    if (diffDays === 0) {
      return {
        label: `Due Today (${formattedDate})`,
        isOverdue: false,
        daysText: 'Due today',
        formattedDate,
      };
    }

    return {
      label: `Due in ${diffDays}d (${formattedDate})`,
      isOverdue: false,
      daysText: `Due in ${diffDays} days`,
      formattedDate,
    };
  };

  // Sort tasks by proximity to due date
  const sortedTasks = useMemo(() => {
    const tasksCopy = [...offboarding.tasks];
    if (!sortByDueDate) return tasksCopy;

    return tasksCopy.sort((a, b) => {
      // 1. Uncompleted overdue tasks come first (sorted by oldest due date)
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // 2. Uncompleted upcoming tasks come next (sorted by nearest due date)
      const aCompleted = a.status === 'completed';
      const bCompleted = b.status === 'completed';
      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && !bCompleted) return 1;

      // 3. Compare due dates directly
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return 0;
    });
  }, [offboarding.tasks, sortByDueDate, today]);

  const overdueCount = offboarding.tasks.filter(isTaskOverdue).length;

  const handleToggleTask = (task: OffboardingTask) => {
    if (task.status === 'completed') {
      onUpdateTask(task.id, 'pending');
    } else {
      onUpdateTask(task.id, 'completed');
    }
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverNote.trim()) return;

    onUpdateTask('task-4', 'completed', handoverNote);
    setSubmittingHandover(false);
    setHandoverNote('');
    alert('Project Handover information submitted to your manager (John Smith) for review.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Employee Exit & Offboarding
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Complete your exit process smoothly with all required steps.
            </p>
          </div>
        </div>

        {/* Role-based view switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'checklist' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Checklist
          </button>
          <button
            onClick={() => setActiveTab('manager_review')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'manager_review' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manager Handover
          </button>
          <button
            onClick={() => setActiveTab('hr_clearance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'hr_clearance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HR Clearance
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exit Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          {/* Top Progress & Status Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Exit Checklist</span>
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    {overdueCount} Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSortByDueDate(!sortByDueDate)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                    sortByDueDate
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Toggle sorting by due date proximity"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortByDueDate ? 'Sorted by Due Date' : 'Original Order'}</span>
                </button>
                <span className="text-xs font-bold text-emerald-600">
                  {calculatedPercent}% ({completedCount}/{totalCount} completed)
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${calculatedPercent}%` }}
              />
            </div>
          </div>

          {/* Overdue Alert Banner if tasks are overdue */}
          {overdueCount > 0 && (
            <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">
                  {overdueCount} offboarding {overdueCount === 1 ? 'task is' : 'tasks are'} past due date!
                </p>
                <p className="text-rose-700 text-[11px] mt-0.5">
                  Please complete overdue action items immediately to prevent delays in final HR clearance and asset handover.
                </p>
              </div>
            </div>
          )}

          {/* Checklist Items list */}
          <div className="space-y-2.5">
            {sortedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isOverdue = isTaskOverdue(task);
              const dueInfo = getDueStatus(task);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-50/60 border-rose-300 hover:bg-rose-50/90 shadow-2xs'
                      : isCompleted
                      ? 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 shrink-0 transition"
                      aria-label={`Mark task ${task.title}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 hover:text-slate-400" />
                      ) : isOverdue ? (
                        <Circle className="w-5 h-5 text-rose-400 hover:text-emerald-600 stroke-[2.2]" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-600" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-xs md:text-sm font-bold ${
                            isOverdue
                              ? 'text-rose-950'
                              : isCompleted
                              ? 'text-slate-500 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>

                        {/* Overdue Badge */}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Overdue
                          </span>
                        )}

                        {/* Assigned Role Pill */}
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                          {task.assignedRole}
                        </span>
                      </div>

                      <p
                        className={`text-[11px] mt-0.5 ${
                          isOverdue ? 'text-rose-800/80' : 'text-slate-500'
                        }`}
                      >
                        {task.description}
                      </p>

                      {task.handoverDetails && (
                        <p className="text-[11px] text-blue-700 bg-blue-50/80 p-2 rounded-lg mt-1.5 border border-blue-100">
                          <strong>Handover Notes:</strong> {task.handoverDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Due Date & Action */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    {/* Due Date Indicator */}
                    {dueInfo && (
                      <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isOverdue
                            ? 'text-rose-700 bg-rose-100 font-bold border border-rose-200'
                            : isCompleted
                            ? 'text-slate-400 bg-slate-100'
                            : 'text-slate-700 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <Calendar className={`w-3 h-3 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span>{dueInfo.label}</span>
                      </div>
                    )}

                    {/* Status Pill */}
                    {isCompleted ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {task.completedDate || 'Completed'}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isOverdue
                              ? 'text-rose-700 bg-rose-200/60 border border-rose-300'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {isOverdue ? 'Action Required' : 'Pending'}
                        </span>
                        {task.id === 'task-4' && (
                          <button
                            onClick={() => setSubmittingHandover(true)}
                            className="text-[11px] font-bold text-blue-600 hover:underline ml-1"
                          >
                            Submit details
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Handover Submission Modal/Drawer */}
          {submittingHandover && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900">
                  Submit Project Handover Information
                </span>
                <button
                  onClick={() => setSubmittingHandover(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <textarea
                rows={3}
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="List repository permissions transferred, documentation links, and designated successor..."
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <button
                onClick={handleHandoverSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Send to Manager for Sign-Off
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Important Information (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Important Information</h3>

            <div className="space-y-3 text-xs">
              {/* Last Working Day */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Last Working Day
                  </span>
                  <span className="font-bold text-slate-900">{offboarding.lastWorkingDay}</span>
                </div>
              </div>

              {/* Manager */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Manager
                  </span>
                  <span className="font-bold text-slate-900">{offboarding.managerName}</span>
                </div>
              </div>

              {/* HR Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <Mail className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    HR Contact
                  </span>
                  <a
                    href={`mailto:${offboarding.hrContact}`}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    {offboarding.hrContact}
                  </a>
                </div>
              </div>
            </div>

            {/* Help Links */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => alert('HR support request triggered. Sarah Jenkins has been notified.')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Need Help: Ask our HR</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onOpenArticleByTitle('Employee Handbook')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Need Help: View Policy</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
