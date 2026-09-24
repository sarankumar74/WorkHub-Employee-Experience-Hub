import React from 'react';
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
  Wand2,
  ChevronRight,
  UserCheck,
  UserCog
} from 'lucide-react';
import { User, CompanyEvent, Announcement } from '../../types/workhub';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenEditProfile?: () => void;
  events: CompanyEvent[];
  announcements: Announcement[];
  onJoinMeeting: (event: CompanyEvent) => void;
  onOpenArticle: (articleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onOpenEditProfile,
  events,
  announcements,
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

  const quickLinks = [
    { title: 'Company Policies', icon: Shield, color: 'text-blue-600 bg-blue-50', action: () => onNavigate('knowledge') },
    { title: 'Project Docs', icon: FileText, color: 'text-emerald-600 bg-emerald-50', action: () => onNavigate('knowledge') },
    { title: 'HR Portal', icon: UserCheck, color: 'text-purple-600 bg-purple-50', action: () => onNavigate('offboarding') },
    { title: 'Leave Request', icon: Calendar, color: 'text-amber-600 bg-amber-50', action: () => onOpenArticle('art-003') },
    { title: 'IT Support', icon: HelpCircle, color: 'text-cyan-600 bg-cyan-50', action: () => onOpenArticle('art-006') },
    { title: 'Asset Studio', icon: Wand2, color: 'text-indigo-600 bg-indigo-50', action: () => onNavigate('image-studio') },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner (Matches Screen 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, {currentUser.name.split(' ')[0]}! <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200/70 shadow-2xs transition cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Profile</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row (Responsive for Mobile, Tablet & Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 md:gap-5">
        {/* Stat 1: Today's Tasks */}
        <div
          onClick={() => onNavigate('offboarding')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">3</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Today's Tasks</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Offboarding & Handover checklist</p>
        </div>

        {/* Stat 2: Upcoming Meetings */}
        <div
          onClick={() => onNavigate('events')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">2</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Upcoming Meetings</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Next up: Team Standup at 10 AM</p>
        </div>

        {/* Stat 3: Announcements */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-600">5</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Announcements</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Office schedule & company meet</p>
        </div>

        {/* Stat 4: Onboarding/Exit Progress */}
        <div
          onClick={() => onNavigate('offboarding')}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl md:text-3xl font-extrabold text-purple-600">70%</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700">Onboarding Progress</p>
          <div className="w-full bg-purple-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule + Announcements (Matches Screen 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Today's Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm md:text-base text-slate-900">Today's Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {todayMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xs font-bold text-slate-500 w-20 shrink-0">
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs shrink-0 flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Announcements (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm md:text-base text-slate-900">Announcements</h2>
            </div>
            <button
              onClick={() => onNavigate('knowledge')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {announcements.map((ann) => (
              <div key={ann.id} className="py-3.5 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {ann.iconType === 'briefcase' ? (
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  ) : ann.iconType === 'book' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
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

      {/* Bottom Section: Quick Links (Matches Screen 2) */}
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
    </div>
  );
};
