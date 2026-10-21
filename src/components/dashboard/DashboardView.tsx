import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Bell,
  TrendingUp,
  Clock,
  Video,
  Briefcase,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
  Network,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  UserCog,
  CheckCircle2,
  LayoutDashboard,
  Activity,
  X,
  Sparkles,
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeftRight
} from 'lucide-react';
import { User, CompanyEvent, Announcement, OffboardingRecord, Employee } from '../../types/workhub';
import { StickyNotesSection } from './StickyNotesSection';
import { OffboardingDonutChart } from './OffboardingDonutChart';
import { DailyOffboardingAlert } from './DailyOffboardingAlert';
import { TeamHealthSection } from './TeamHealthSection';
import { CompanyPollWidget } from './CompanyPollWidget';
import { DailyGoalsWidget } from './DailyGoalsWidget';
import { QuickActionsSection } from './QuickActionsSection';
import { QuickActionModal, QuickActionType } from '../modals/QuickActionModal';
import { TeamMoodWidget } from './TeamMoodWidget';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenEditProfile?: () => void;
  events: CompanyEvent[];
  announcements: Announcement[];
  offboarding?: OffboardingRecord;
  employees?: Employee[];
  onOpenMessageModal?: (emp: Employee) => void;
  onJoinMeeting: (event: CompanyEvent) => void;
  onOpenArticle: (articleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onOpenEditProfile,
  events,
  announcements,
  offboarding,
  employees = [],
  onOpenMessageModal,
  onJoinMeeting,
  onOpenArticle,
}) => {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const todayMeetings = events.slice(0, 4);

  const totalTasks = offboarding?.tasks?.length || 10;
  const completedTasks = offboarding?.tasks?.filter((t) => t.status === 'completed').length || 7;
  const remainingTasks = totalTasks - completedTasks;
  const progressPercent = offboarding?.progressPercent ?? Math.round((completedTasks / totalTasks) * 100);

  const quickLinks = [
    { title: 'Company Policies', icon: Shield, color: 'text-blue-600 bg-blue-50', action: () => onNavigate('knowledge') },
    { title: 'Project Docs', icon: FileText, color: 'text-emerald-600 bg-emerald-50', action: () => onNavigate('knowledge') },
    { title: 'HR Portal', icon: UserCheck, color: 'text-purple-600 bg-purple-50', action: () => onNavigate('offboarding') },
    { title: 'Leave Request', icon: Calendar, color: 'text-amber-600 bg-amber-50', action: () => onOpenArticle('art-003') },
    { title: 'IT Support', icon: HelpCircle, color: 'text-cyan-600 bg-cyan-50', action: () => onOpenArticle('art-006') },
    { title: 'Team Directory', icon: Network, color: 'text-indigo-600 bg-indigo-50', action: () => onNavigate('teams') },
  ];

  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionType>(null);
  const [quickActionToast, setQuickActionToast] = useState<string | null>(null);
  const [dashboardMode, setDashboardMode] = useState<'classic' | 'pulse'>('classic');

  // Widget order state for drag-and-drop customization
  const widgetOrderStorageKey = `workhub_dashboard_widget_order_${currentUser.id || 'default'}`;
  const DEFAULT_WIDGET_ORDER = ['mood', 'poll', 'goals'];

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(widgetOrderStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = ['mood', 'poll', 'goals'];
          const filtered = parsed.filter((id) => valid.includes(id));
          const missing = valid.filter((id) => !filtered.includes(id));
          return [...filtered, ...missing];
        }
      }
    } catch (e) {
      console.warn('Failed to parse widget order:', e);
    }
    return DEFAULT_WIDGET_ORDER;
  });

  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const [reorderToast, setReorderToast] = useState<string | null>(null);

  const updateWidgetOrder = (newOrder: string[], message = 'Widget order updated & saved!') => {
    setWidgetOrder(newOrder);
    try {
      localStorage.setItem(widgetOrderStorageKey, JSON.stringify(newOrder));
    } catch (e) {
      console.warn('Failed to save widget order:', e);
    }
    setReorderToast(message);
    setTimeout(() => setReorderToast(null), 3000);
  };

  const handleResetWidgetOrder = () => {
    updateWidgetOrder(DEFAULT_WIDGET_ORDER, 'Widget layout reset to default order.');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidgetId !== targetId) {
      setDragOverWidgetId(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetId: string) => {
    if (dragOverWidgetId === targetId) {
      setDragOverWidgetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedWidgetId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const currentOrder = [...widgetOrder];
    const sourceIndex = currentOrder.indexOf(sourceId);
    const targetIndex = currentOrder.indexOf(targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      currentOrder.splice(sourceIndex, 1);
      currentOrder.splice(targetIndex, 0, sourceId);
      updateWidgetOrder(currentOrder);
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const moveWidget = (id: string, delta: -1 | 1) => {
    const index = widgetOrder.indexOf(id);
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= widgetOrder.length) return;

    const currentOrder = [...widgetOrder];
    const [item] = currentOrder.splice(index, 1);
    currentOrder.splice(targetIndex, 0, item);
    updateWidgetOrder(currentOrder);
  };

  const getWidgetMetadata = (id: string) => {
    switch (id) {
      case 'mood':
        return { label: 'Team Mood', badge: 'Sentiment & Trends' };
      case 'poll':
        return { label: 'Company Poll', badge: 'Weekly Pulse' };
      case 'goals':
        return { label: 'Daily Goals', badge: 'Personal Focus' };
      default:
        return { label: id, badge: 'Widget' };
    }
  };

  const renderWidgetById = (id: string) => {
    switch (id) {
      case 'mood':
        return <TeamMoodWidget currentUser={currentUser} />;
      case 'poll':
        return <CompanyPollWidget currentUser={currentUser} />;
      case 'goals':
        return <DailyGoalsWidget currentUser={currentUser} />;
      default:
        return null;
    }
  };

  const handleQuickActionSuccess = (msg: string) => {
    setQuickActionToast(msg);
    setTimeout(() => {
      setQuickActionToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              WorkHub Enterprise
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{dashboardMode === 'classic' ? 'Overview' : 'Team Pulse & Polls'}</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, {currentUser.name.split(' ')[0]}! <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Here's what's happening today in your workspace.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setDashboardMode('classic')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                dashboardMode === 'classic'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setDashboardMode('pulse')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                dashboardMode === 'pulse'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Team Pulse & Polls</span>
            </button>
          </div>

          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Confirmation Toast Banner */}
      {quickActionToast && (
        <div className="p-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{quickActionToast}</span>
          </div>
          <button
            onClick={() => setQuickActionToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Reorder Confirmation Toast */}
      {reorderToast && (
        <div className="p-3 px-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{reorderToast}</span>
          </div>
          <button
            onClick={() => setReorderToast(null)}
            className="text-indigo-700 hover:text-indigo-950 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Daily Offboarding Deadline Alert Notification */}
      <DailyOffboardingAlert
        offboarding={offboarding}
        currentUser={currentUser}
        onNavigate={onNavigate}
      />

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 md:gap-5">
        {/* Stat 1: Remaining Tasks */}
        <div
          onClick={() => onNavigate('offboarding')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">{remainingTasks}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Open Tasks</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Transition & handover checklist</p>
        </div>

        {/* Stat 2: Upcoming Meetings */}
        <div
          onClick={() => onNavigate('events')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">{events.length}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Upcoming Events</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Standups, reviews & team syncs</p>
        </div>

        {/* Stat 3: Announcements */}
        <div
          onClick={() => onNavigate('knowledge')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-600">{announcements.length}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Announcements</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Office schedule & company news</p>
        </div>

        {/* Stat 4: Offboarding Progress */}
        <div
          onClick={() => onNavigate('offboarding')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-purple-600">{progressPercent}%</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Task Completion</p>
          <div className="w-full bg-purple-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ================= MODE 1: CLASSIC PREVIOUS UI DESIGN (DEFAULT) ================= */}
      {dashboardMode === 'classic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Main Left Column (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* 1. Interactive Recharts Offboarding Donut Chart */}
            <OffboardingDonutChart
              offboarding={offboarding}
              currentUser={currentUser}
              onNavigate={onNavigate}
            />

            {/* 2. Team Health & Task Distribution Overview */}
            <TeamHealthSection
              currentUser={currentUser}
              employees={employees}
              onOpenMessageModal={onOpenMessageModal}
              onNavigate={onNavigate}
            />

            {/* 3. Personal Sticky Notes Scratchpad */}
            <StickyNotesSection currentUser={currentUser} />
          </div>

          {/* Right Sidebar Column (1 Column on Desktop, 2 Columns side-by-side on Tablet) */}
          <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
            {/* Today's Schedule Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-sm md:text-base text-slate-900">Today's Schedule</h2>
                  </div>
                  <button
                    onClick={() => onNavigate('events')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-1">
                  {todayMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="text-xs font-bold text-slate-500 w-16 sm:w-20 shrink-0">
                          {meeting.time.split('–')[0].trim()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-900 truncate">
                            {meeting.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{meeting.team}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onJoinMeeting(meeting)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer self-end xs:self-center"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Announcements Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <h2 className="font-bold text-sm md:text-base text-slate-900">Announcements</h2>
                  </div>
                  <button
                    onClick={() => onNavigate('knowledge')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-1">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="py-3 flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {ann.iconType === 'briefcase' ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        ) : ann.iconType === 'book' ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1">
                          {ann.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ann.content}</p>
                        <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                          {ann.timeAgo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 2: TEAM PULSE & POLLS ================= */}
      {dashboardMode === 'pulse' && (
        <div className="space-y-6">
          {/* Quick Actions (1-Click: Time Off, Expense, Log Hours) */}
          <QuickActionsSection
            onTriggerAction={(action) => setActiveQuickAction(action)}
          />

          {/* Widget Grid Customization Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 md:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 truncate">
                    Customizable Widget Grid
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                    Drag & Drop Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  Drag cards by the handle or use ◀ / ▶ arrows to reorganize your daily workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {/* Reset to Default Order button */}
              <button
                type="button"
                onClick={handleResetWidgetOrder}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:bg-slate-50 shadow-2xs"
                title="Reset widgets to default layout"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Order</span>
              </button>
            </div>
          </div>

          {/* Draggable Responsive Widget Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {widgetOrder.map((id, index) => {
              const isDragging = draggedWidgetId === id;
              const isDragOver = dragOverWidgetId === id && draggedWidgetId !== id;
              const meta = getWidgetMetadata(id);
              const isLastOnTablet = index === 2;

              return (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, id)}
                  onDragOver={(e) => handleDragOver(e, id)}
                  onDragLeave={(e) => handleDragLeave(e, id)}
                  onDrop={(e) => handleDrop(e, id)}
                  onDragEnd={handleDragEnd}
                  className={`col-span-1 ${
                    isLastOnTablet ? 'md:col-span-2 lg:col-span-1' : ''
                  } h-full transition-all duration-200 relative group/widget ${
                    isDragging
                      ? 'opacity-40 scale-[0.98] ring-2 ring-indigo-500 rounded-2xl'
                      : isDragOver
                      ? 'ring-2 ring-indigo-500 ring-offset-2 scale-[1.01] rounded-2xl shadow-lg'
                      : ''
                  }`}
                >
                  {/* Reorder Header Bar with Drag Handle & Left/Right Arrows */}
                  <div className="mb-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <span
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition"
                        title="Click & drag to reorder this widget"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-slate-800 text-xs truncate">
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        · Slot #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveWidget(id, -1)}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-md hover:bg-white transition cursor-pointer"
                        title="Move left / earlier in grid"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-semibold text-slate-400 px-1">
                        {index + 1}/3
                      </span>
                      <button
                        type="button"
                        onClick={() => moveWidget(id, 1)}
                        disabled={index === widgetOrder.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-md hover:bg-white transition cursor-pointer"
                        title="Move right / later in grid"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Drop Target Glow Overlay */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-indigo-500/10 border-2 border-dashed border-indigo-500 rounded-2xl pointer-events-none z-10 flex items-center justify-center backdrop-blur-[0.5px]">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Drop here to place in Slot #{index + 1}
                      </span>
                    </div>
                  )}

                  {/* Render Widget */}
                  <div className="h-full">
                    {renderWidgetById(id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Section: Quick Links */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm md:text-base text-slate-900">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {quickLinks.map((ql, idx) => {
            const Icon = ql.icon;
            return (
              <button
                key={idx}
                onClick={ql.action}
                className="p-4 bg-white rounded-2xl border border-slate-200/70 hover:border-blue-300 shadow-2xs hover:shadow-sm transition flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition group-hover:scale-110 ${ql.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition">
                  {ql.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Modal for Time Off, Expense & Work Hours */}
      <QuickActionModal
        isOpen={Boolean(activeQuickAction)}
        actionType={activeQuickAction}
        onClose={() => setActiveQuickAction(null)}
        currentUser={currentUser}
        onSuccessToast={handleQuickActionSuccess}
      />
    </div>
  );
};
