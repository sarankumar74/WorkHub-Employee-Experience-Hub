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
  AlertCircle,
  Flame,
  Filter,
  CheckSquare,
  Square,
  MinusSquare,
  StickyNote,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { OffboardingRecord, OffboardingTask, User } from '../../types/workhub';
import { OffboardingTrendsChart } from './OffboardingTrendsChart';

interface OffboardingViewProps {
  offboarding: OffboardingRecord;
  currentUser: User;
  onUpdateTask: (
    taskId: string,
    status: 'completed' | 'pending' | 'in_progress',
    handoverDetails?: string,
    notes?: string
  ) => void;
  onBatchCompleteTasks?: (taskIds: string[]) => void;
  onUpdateTaskNotes?: (taskId: string, notes: string) => void;
  onOpenArticleByTitle: (title: string) => void;
}

const PRIORITY_SORT_MAP: Record<string, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

export const OffboardingView: React.FC<OffboardingViewProps> = ({
  offboarding,
  currentUser,
  onUpdateTask,
  onBatchCompleteTasks,
  onUpdateTaskNotes,
  onOpenArticleByTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'manager_review' | 'hr_clearance'>('checklist');
  const [handoverNote, setHandoverNote] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);
  const [sortOption, setSortOption] = useState<'due_date' | 'priority' | 'default'>('due_date');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-task selection state for 'Complete Selected'
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Individual task note editing state
  const [editingNoteTaskId, setEditingNoteTaskId] = useState<string | null>(null);
  const [noteDraftText, setNoteDraftText] = useState<string>('');

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

  // Sort & Filter tasks
  const sortedTasks = useMemo(() => {
    let tasksCopy = [...offboarding.tasks];

    // Filter by keyword search query across title, description, notes, role, and handover details
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      tasksCopy = tasksCopy.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.assignedRole && t.assignedRole.toLowerCase().includes(q)) ||
          (t.handoverDetails && t.handoverDetails.toLowerCase().includes(q)) ||
          (t.status && t.status.toLowerCase().includes(q)) ||
          (t.priority && t.priority.toLowerCase().includes(q))
      );
    }

    // Filter by task status (all | pending | completed)
    if (filterStatus === 'pending') {
      tasksCopy = tasksCopy.filter((t) => t.status !== 'completed');
    } else if (filterStatus === 'completed') {
      tasksCopy = tasksCopy.filter((t) => t.status === 'completed');
    }

    if (filterPriority !== 'all') {
      tasksCopy = tasksCopy.filter((t) => (t.priority || 'medium') === filterPriority);
    }

    if (sortOption === 'default') return tasksCopy;

    if (sortOption === 'priority') {
      return tasksCopy.sort((a, b) => {
        const aCompleted = a.status === 'completed';
        const bCompleted = b.status === 'completed';
        if (!aCompleted && bCompleted) return -1;
        if (aCompleted && !bCompleted) return 1;

        const pA = PRIORITY_SORT_MAP[a.priority || 'medium'] || 2;
        const pB = PRIORITY_SORT_MAP[b.priority || 'medium'] || 2;
        if (pA !== pB) return pA - pB;

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
    }

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
  }, [offboarding.tasks, sortOption, filterPriority, filterStatus, searchQuery, today]);

  // Tab-specific task list
  const displayedTasks = useMemo(() => {
    let list = sortedTasks;
    if (activeTab === 'manager_review') {
      list = list.filter((t) => t.assignedRole === 'manager');
    } else if (activeTab === 'hr_clearance') {
      list = list.filter((t) => t.assignedRole === 'hr');
    }
    return list;
  }, [sortedTasks, activeTab]);

  const overdueCount = offboarding.tasks.filter(isTaskOverdue).length;

  // Uncompleted tasks eligible for batch completion from the current view
  const selectableTasks = useMemo(() => {
    return displayedTasks.filter((t) => t.status !== 'completed');
  }, [displayedTasks]);

  const allSelectableSelected =
    selectableTasks.length > 0 && selectableTasks.every((t) => selectedTaskIds.has(t.id));

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (allSelectableSelected) {
      // Deselect all selectable in this view
      setSelectedTaskIds((prev) => {
        const next = new Set(prev);
        selectableTasks.forEach((t) => next.delete(t.id));
        return next;
      });
    } else {
      // Select all selectable in this view
      setSelectedTaskIds((prev) => {
        const next = new Set(prev);
        selectableTasks.forEach((t) => next.add(t.id));
        return next;
      });
    }
  };

  const handleCompleteSelected = () => {
    const idsToComplete = Array.from(selectedTaskIds);
    if (idsToComplete.length === 0) return;

    if (onBatchCompleteTasks) {
      onBatchCompleteTasks(idsToComplete);
    } else {
      idsToComplete.forEach((id) => onUpdateTask(id, 'completed'));
    }

    const count = idsToComplete.length;
    setSelectedTaskIds(new Set());
    setFeedbackToast({
      message: `Successfully marked ${count} ${count === 1 ? 'task' : 'tasks'} as completed!`,
      type: 'success',
    });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleStartEditNote = (task: OffboardingTask) => {
    setEditingNoteTaskId(task.id);
    setNoteDraftText(task.notes || '');
  };

  const handleSaveNote = (taskId: string) => {
    const trimmed = noteDraftText.trim();
    if (onUpdateTaskNotes) {
      onUpdateTaskNotes(taskId, trimmed);
    } else {
      const task = offboarding.tasks.find((t) => t.id === taskId);
      if (task) {
        onUpdateTask(taskId, task.status, task.handoverDetails, trimmed);
      }
    }
    setEditingNoteTaskId(null);
    setNoteDraftText('');
    setFeedbackToast({
      message: trimmed ? 'Internal reminder note saved!' : 'Reminder note cleared.',
      type: 'info',
    });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleClearNote = (taskId: string) => {
    if (onUpdateTaskNotes) {
      onUpdateTaskNotes(taskId, '');
    } else {
      const task = offboarding.tasks.find((t) => t.id === taskId);
      if (task) {
        onUpdateTask(taskId, task.status, task.handoverDetails, '');
      }
    }
    setFeedbackToast({
      message: 'Reminder note deleted.',
      type: 'info',
    });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

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
    setFeedbackToast({
      message: 'Project Handover information submitted to manager (John Smith) for review.',
      type: 'success',
    });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                feedbackToast.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
              }`}
            />
            <span>{feedbackToast.message}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* Visual Trends Chart using Recharts: Historical Progress Speed & Process Delay Diagnosis */}
      <OffboardingTrendsChart offboarding={offboarding} />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exit Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          {/* Top Progress & Status Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Exit Checklist</span>
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    {overdueCount} Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                {calculatedPercent}% ({completedCount}/{totalCount} completed)
              </div>
            </div>

            {/* Search Bar & Filter Controls */}
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              {/* Keyword Search Input */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks by keyword (e.g., handover, laptop, HR, interview, notes)..."
                  className="w-full pl-9 pr-9 py-2 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter, Priority Filter, and Sort */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Status Filter (All, Pending, Completed) */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                  {(['all', 'pending', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition cursor-pointer ${
                        filterStatus === s
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s === 'all' ? 'All Tasks' : s}
                    </button>
                  ))}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Priority:
                  </span>
                  {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold capitalize transition cursor-pointer ${
                        filterPriority === p
                          ? p === 'high'
                            ? 'bg-rose-600 text-white'
                            : p === 'medium'
                            ? 'bg-amber-500 text-white'
                            : p === 'low'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" /> Sort:
                  </span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value="due_date">Due Date / Urgency</option>
                    <option value="priority">Priority (High → Low)</option>
                    <option value="default">Original Order</option>
                  </select>
                </div>
              </div>

              {/* Active Search & Filter Feedback Strip */}
              {(searchQuery.trim() || filterStatus !== 'all' || filterPriority !== 'all') && (
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-900">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold">
                      Showing {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'}
                      {searchQuery.trim() && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
                      {filterStatus !== 'all' && <span> ({filterStatus})</span>}
                      {filterPriority !== 'all' && <span> [{filterPriority} priority]</span>}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterPriority('all');
                    }}
                    className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer shrink-0"
                  >
                    Reset filters
                  </button>
                </div>
              )}
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

          {/* Multi-Task Batch Selection & Action Toolbar */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                disabled={selectableTasks.length === 0}
                className={`inline-flex items-center gap-1.5 font-bold transition rounded-lg px-2 py-1 ${
                  selectableTasks.length === 0
                    ? 'text-slate-400 cursor-not-allowed opacity-60'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer'
                }`}
                title={allSelectableSelected ? 'Deselect all tasks' : 'Select all uncompleted tasks'}
              >
                {allSelectableSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : selectedTaskIds.size > 0 ? (
                  <MinusSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  Select All ({selectableTasks.length})
                </span>
              </button>

              {selectedTaskIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
                  {selectedTaskIds.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedTaskIds.size > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskIds(new Set())}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 transition cursor-pointer"
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteSelected}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Complete Selected ({selectedTaskIds.size})</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Select checkboxes below to batch-complete tasks
                </span>
              )}
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-2.5">
            {displayedTasks.length === 0 ? (
              <div className="text-center py-9 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                <Search className="w-6 h-6 text-slate-400 mx-auto opacity-60" />
                <p className="font-bold text-slate-700 text-sm">No tasks found</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  {searchQuery.trim()
                    ? `No offboarding tasks matching "${searchQuery}" in this view.`
                    : 'No offboarding tasks found matching the active filter criteria.'}
                </p>
                {(searchQuery.trim() || filterStatus !== 'all' || filterPriority !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterPriority('all');
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              displayedTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isSelected = selectedTaskIds.has(task.id);
                const isEditingNote = editingNoteTaskId === task.id;
                const isOverdue = isTaskOverdue(task);
                const dueInfo = getDueStatus(task);
                const isHigh = task.priority === 'high';
                const isMedium = task.priority === 'medium';

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      isSelected
                        ? 'ring-2 ring-blue-500/50 bg-blue-50/40 border-blue-300 shadow-xs'
                        : isOverdue
                        ? 'bg-rose-50/60 border-rose-300 hover:bg-rose-50/90 shadow-2xs'
                        : isCompleted
                        ? 'bg-slate-50/40 border-slate-100 hover:bg-slate-50'
                        : isHigh
                        ? 'bg-rose-50/30 border-rose-200/90 hover:bg-rose-50/50 shadow-2xs'
                        : 'bg-white border-slate-200/90 hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Batch Selection Checkbox (for uncompleted tasks) */}
                      {!isCompleted ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectTask(task.id);
                          }}
                          className={`mt-0.5 p-1 rounded-md transition cursor-pointer shrink-0 ${
                            isSelected
                              ? 'text-blue-600 bg-blue-100/90'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={isSelected ? 'Deselect for batch action' : 'Select for batch completion'}
                          aria-label={`Select task ${task.title}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-6 shrink-0" />
                      )}

                      {/* Direct Single-Task Toggle Check Button */}
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 shrink-0 transition cursor-pointer"
                        aria-label={`Mark task ${task.title} as ${isCompleted ? 'pending' : 'completed'}`}
                        title={isCompleted ? 'Click to mark pending' : 'Click to mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 hover:text-slate-400" />
                        ) : isOverdue ? (
                          <Circle className="w-5 h-5 text-rose-400 hover:text-emerald-600 stroke-[2.2]" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-600" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 ${
                              isHigh
                                ? 'bg-rose-600 text-white'
                                : isMedium
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isHigh && <Flame className="w-2.5 h-2.5 fill-current" />}
                            {task.priority || 'medium'}
                          </span>

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

                        {/* Handover Details if present */}
                        {task.handoverDetails && (
                          <p className="text-[11px] text-blue-700 bg-blue-50/80 p-2 rounded-lg mt-1.5 border border-blue-100">
                            <strong>Handover Notes:</strong> {task.handoverDetails}
                          </p>
                        )}

                        {/* Individual Task Internal Reminder Notes Section */}
                        {isEditingNote ? (
                          <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                              <span className="flex items-center gap-1.5">
                                <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                                Internal Task Reminder / Note
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingNoteTaskId(null)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                aria-label="Cancel editing note"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={noteDraftText}
                              onChange={(e) => setNoteDraftText(e.target.value)}
                              placeholder="Add specific reminders (e.g., ticket ID, scheduled 1:1, asset serial number)..."
                              className="w-full p-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingNoteTaskId(null)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNote(task.id)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        ) : task.notes ? (
                          <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start justify-between gap-2 text-xs">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <StickyNote className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                                  Internal Note:
                                </span>
                                <p className="text-slate-700 text-xs whitespace-pre-wrap break-words font-medium mt-0.5">
                                  {task.notes}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditNote(task)}
                                className="p-1 text-slate-500 hover:text-amber-900 hover:bg-amber-100 rounded-md transition cursor-pointer"
                                title="Edit reminder note"
                                aria-label="Edit note"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearNote(task.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                title="Clear reminder note"
                                aria-label="Clear note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditNote(task)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 hover:bg-slate-100 px-2 py-0.5 rounded-md transition cursor-pointer"
                            >
                              <StickyNote className="w-3 h-3 text-slate-400" />
                              <span>+ Add reminder note</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Due Date & Action */}
                    <div className="text-right shrink-0 flex flex-wrap sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
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
              })
            )}
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
                onClick={() => {
                  setFeedbackToast({
                    message: 'HR support request triggered. Sarah Jenkins (Head of People) has been notified.',
                    type: 'info',
                  });
                  setTimeout(() => setFeedbackToast(null), 4000);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between transition cursor-pointer"
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
