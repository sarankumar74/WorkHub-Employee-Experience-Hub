import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Search,
  ExternalLink
} from 'lucide-react';
import { Employee, User } from '../../types/workhub';

interface TeamHealthSectionProps {
  currentUser: User;
  employees: Employee[];
  onOpenMessageModal?: (emp: Employee) => void;
  onNavigate?: (tab: string) => void;
}

interface MemberHealthData {
  id: string;
  name: string;
  shortName: string;
  jobTitle: string;
  team: string;
  department: string;
  avatar: string;
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
  completionRate: number;
  healthStatus: 'excellent' | 'good' | 'attention';
  overdueCount: number;
  rawEmployee: Employee;
}

// Generate realistic deterministic task stats for demo team members
const getMemberTaskStats = (emp: Employee, index: number) => {
  const seed = (emp.id.charCodeAt(emp.id.length - 1) + index * 7) % 10;
  
  let total = 8 + (seed % 5); // 8 to 12 tasks
  let completed = 5 + (seed % 4); // 5 to 8 completed
  if (completed > total) completed = total - 2;
  
  let inProgress = 1 + (seed % 3);
  let pending = Math.max(0, total - completed - inProgress);
  let overdueCount = seed > 6 ? 1 : 0;
  
  if (emp.status === 'offboarding') {
    total = 8;
    completed = 5;
    inProgress = 1;
    pending = 2;
    overdueCount = 1;
  }

  const completionRate = Math.round((completed / total) * 100);

  let healthStatus: MemberHealthData['healthStatus'] = 'good';
  if (completionRate >= 80 && overdueCount === 0) {
    healthStatus = 'excellent';
  } else if (overdueCount > 0 || completionRate < 55) {
    healthStatus = 'attention';
  }

  return {
    completed,
    inProgress,
    pending,
    total,
    completionRate,
    healthStatus,
    overdueCount,
  };
};

export const TeamHealthSection: React.FC<TeamHealthSectionProps> = ({
  currentUser,
  employees,
  onOpenMessageModal,
  onNavigate,
}) => {
  const [viewScope, setViewScope] = useState<'direct_reports' | 'department'>('direct_reports');
  const [sortBy, setSortBy] = useState<'rate' | 'name' | 'workload'>('rate');
  const [searchQuery, setSearchQuery] = useState('');

  // Identify direct reports or department team members
  const teamMembers = useMemo(() => {
    const currentName = (currentUser.name || '').toLowerCase();
    
    // 1. Check direct reports matching manager name
    const directReports = employees.filter((e) => {
      const mgr = (e.manager || '').toLowerCase();
      return mgr.includes(currentName) || currentName.includes(mgr);
    });

    // 2. Department members
    const deptMembers = employees.filter(
      (e) =>
        e.department.toLowerCase() === (currentUser.department || 'Engineering').toLowerCase() &&
        e.id !== currentUser.id
    );

    // If direct reports exist and mode is direct_reports, return them; otherwise fallback smoothly
    if (viewScope === 'direct_reports' && directReports.length > 0) {
      return directReports;
    }
    
    // If user selected department view or has no direct reports explicitly named
    return deptMembers.length > 0 ? deptMembers : employees.slice(0, 5);
  }, [employees, currentUser, viewScope]);

  // Compute processed metrics for each team member
  const membersData: MemberHealthData[] = useMemo(() => {
    return teamMembers.map((emp, index) => {
      const stats = getMemberTaskStats(emp, index);
      const nameParts = emp.name.split(' ');
      const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : emp.name;

      return {
        id: emp.id,
        name: emp.name,
        shortName,
        jobTitle: emp.jobTitle,
        team: emp.team,
        department: emp.department,
        avatar: emp.avatar,
        rawEmployee: emp,
        ...stats,
      };
    });
  }, [teamMembers]);

  // Filter & Sort
  const displayedMembers = useMemo(() => {
    let list = membersData.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.jobTitle.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'rate') return b.completionRate - a.completionRate;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'workload') return b.total - a.total;
      return 0;
    });

    return list;
  }, [membersData, sortBy, searchQuery]);

  // Aggregate Team Health Metrics
  const teamStats = useMemo(() => {
    if (membersData.length === 0) {
      return { avgRate: 0, totalCompleted: 0, totalInProgress: 0, totalPending: 0, attentionCount: 0 };
    }

    const totalComp = membersData.reduce((acc, m) => acc + m.completed, 0);
    const totalProg = membersData.reduce((acc, m) => acc + m.inProgress, 0);
    const totalPend = membersData.reduce((acc, m) => acc + m.pending, 0);
    const totalAll = membersData.reduce((acc, m) => acc + m.total, 0);
    const attention = membersData.filter((m) => m.healthStatus === 'attention').length;

    const avgRate = totalAll > 0 ? Math.round((totalComp / totalAll) * 100) : 0;

    return {
      avgRate,
      totalCompleted: totalComp,
      totalInProgress: totalProg,
      totalPending: totalPend,
      attentionCount: attention,
    };
  }, [membersData]);

  // Custom Bar Chart Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MemberHealthData;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-700 backdrop-blur-xs min-w-[170px] space-y-1.5">
          <div className="font-bold text-slate-100 border-b border-slate-700 pb-1 flex items-center justify-between">
            <span>{data.name}</span>
            <span className="text-emerald-400 font-extrabold">{data.completionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400">{data.jobTitle}</p>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between items-center text-emerald-300">
              <span>Completed:</span>
              <span className="font-bold">{data.completed}</span>
            </div>
            <div className="flex justify-between items-center text-blue-300">
              <span>In Progress:</span>
              <span className="font-bold">{data.inProgress}</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>Pending / Backlog:</span>
              <span className="font-bold">{data.pending}</span>
            </div>
            {data.overdueCount > 0 && (
              <div className="flex justify-between items-center text-rose-400 font-semibold pt-0.5 border-t border-slate-800">
                <span>Overdue:</span>
                <span>{data.overdueCount} task</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-5 animate-in fade-in duration-200">
      {/* Header with Title & Scope Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900">
                Team Health & Task Completion Overview
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                Manager Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live task execution rates & transition velocity for team members reporting under {currentUser.name}
            </p>
          </div>
        </div>

        {/* View Scope Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewScope('direct_reports')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewScope === 'direct_reports'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct Reports
            </button>
            <button
              onClick={() => setViewScope('department')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewScope === 'department'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentUser.department || 'Department'} Team
            </button>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('people')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Open Org Directory"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Avg Team Completion Rate */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-50/70 to-emerald-50/50 border border-teal-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-700 mb-1">
            <span className="text-xs font-bold">Avg Completion</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-teal-900">{teamStats.avgRate}%</span>
            <span className="text-[10px] font-semibold text-teal-600">across team</span>
          </div>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">Tasks Finished</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-900">{teamStats.totalCompleted}</span>
            <span className="text-[10px] text-emerald-600 font-medium">delivered</span>
          </div>
        </div>

        {/* Metric 3: Active in Progress */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-bold">In Flight</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-900">{teamStats.totalInProgress}</span>
            <span className="text-[10px] text-blue-600 font-medium">in progress</span>
          </div>
        </div>

        {/* Metric 4: Team Members & Attention Items */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">Reporting Team</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900">{membersData.length}</span>
            <span className="text-[10px] text-amber-700 font-semibold">
              {teamStats.attentionCount > 0 ? `(${teamStats.attentionCount} needs review)` : 'all healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Section: Stacked Bar Chart */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Task Distribution by Team Member</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Tap or hover over bars for task breakdown
          </span>
        </div>

        {/* Scrollable container on narrow mobile so charts remain crisp */}
        <div className="w-full overflow-x-auto pb-1">
          <div className="min-w-[340px] sm:min-w-0 h-56 md:h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayedMembers}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 10, fontSize: 10 }}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  stackId="tasks"
                  fill="#10B981" // emerald-500
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="inProgress"
                  name="In Progress"
                  stackId="tasks"
                  fill="#3B82F6" // blue-500
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending / Backlog"
                  stackId="tasks"
                  fill="#F59E0B" // amber-500
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Member Cards Breakdown */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Member Task Velocity & 1:1 Check-ins
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              ({displayedMembers.length} active)
            </span>
          </div>

          {/* Controls: Search & Sort - responsive on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <option value="rate">Sort: Highest Completion</option>
              <option value="workload">Sort: Total Tasks</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Member Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedMembers.map((member) => {
            const isAttention = member.healthStatus === 'attention';
            const isExcellent = member.healthStatus === 'excellent';

            return (
              <div
                key={member.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs ${
                  isAttention
                    ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  {/* Member Profile Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.rawEmployee.status === 'offboarding' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                              Exit
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{member.jobTitle}</p>
                      </div>
                    </div>

                    {/* Completion Rate Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                          isExcellent
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAttention
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {member.completionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Task Mini Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>
                        {member.completed} of {member.total} tasks completed
                      </span>
                      <span>{member.inProgress} in progress</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(member.completed / member.total) * 100}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${(member.inProgress / member.total) * 100}%` }}
                        className="bg-blue-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${(member.pending / member.total) * 100}%` }}
                        className="bg-amber-400 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Overdue warning & Quick Action */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  {member.overdueCount > 0 ? (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      1 overdue item
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      On Schedule
                    </span>
                  )}

                  {onOpenMessageModal && (
                    <button
                      onClick={() => onOpenMessageModal(member.rawEmployee)}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-[11px] transition cursor-pointer hover:underline"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Sync / Chat</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
