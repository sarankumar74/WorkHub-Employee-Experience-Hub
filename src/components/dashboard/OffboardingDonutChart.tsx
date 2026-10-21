import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ListTodo,
  Calendar
} from 'lucide-react';
import { OffboardingRecord, User } from '../../types/workhub';

interface OffboardingDonutChartProps {
  offboarding?: OffboardingRecord;
  currentUser: User;
  onNavigate: (tab: string) => void;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export const OffboardingDonutChart: React.FC<OffboardingDonutChartProps> = ({
  offboarding,
  currentUser,
  onNavigate,
}) => {
  const tasks = offboarding?.tasks || [];
  const totalTasks = tasks.length || 10;

  const completedCount = tasks.filter((t) => t.status === 'completed').length || 7;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length || 2;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length || (totalTasks - completedCount - inProgressCount);
  
  const completedPercent = Math.round((completedCount / totalTasks) * 100);
  const inProgressPercent = Math.round((inProgressCount / totalTasks) * 100);
  const pendingPercent = Math.max(0, 100 - completedPercent - inProgressPercent);

  const chartData: ChartDataItem[] = [
    {
      name: 'Completed',
      value: completedCount,
      color: '#10B981', // emerald-500
      percentage: completedPercent,
    },
    {
      name: 'In Progress',
      value: inProgressCount,
      color: '#3B82F6', // blue-500
      percentage: inProgressPercent,
    },
    {
      name: 'Pending',
      value: pendingCount,
      color: '#F59E0B', // amber-500
      percentage: pendingPercent,
    },
  ];

  // Custom Recharts tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700/80 backdrop-blur-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <p className="text-slate-300">
            <span className="font-semibold text-white">{data.value}</span> tasks ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-2">
              <span>Offboarding & Transition Progress</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {completedPercent}% Done
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Task completion distribution for {currentUser.name.split(' ')[0]}'s workspace
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('offboarding')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition cursor-pointer"
        >
          <span>View All Tasks</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Donut Chart with Center Label (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[210px]">
          <div className="w-full h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#ffffff"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut KPI Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {completedPercent}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Completed
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium text-center">
            {completedCount} of {totalTasks} total tasks finished
          </div>
        </div>

        {/* Right: Breakdown Cards & Quick Metrics (7 cols) */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Status Breakdown Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {/* Completed */}
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold">Completed</span>
                <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-extrabold text-emerald-800">{completedCount}</span>
                <span className="text-[9px] sm:text-[10px] text-emerald-600">({completedPercent}%)</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="p-2 sm:p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold">In Flight</span>
                <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-extrabold text-blue-800">{inProgressCount}</span>
                <span className="text-[9px] sm:text-[10px] text-blue-600">({inProgressPercent}%)</span>
              </div>
            </div>

            {/* Pending */}
            <div className="p-2 sm:p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold">Pending</span>
                <AlertCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-extrabold text-amber-800">{pendingCount}</span>
                <span className="text-[9px] sm:text-[10px] text-amber-600">({pendingPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Overall Task Completion</span>
              <span className="text-purple-700 font-bold">{completedPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${completedPercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Completed: ${completedPercent}%`}
              />
              <div
                style={{ width: `${inProgressPercent}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`In Progress: ${inProgressPercent}%`}
              />
              <div
                style={{ width: `${pendingPercent}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Pending: ${pendingPercent}%`}
              />
            </div>
          </div>

          {/* Action Row - responsive on mobile */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <ListTodo className="w-4 h-4 text-purple-600 shrink-0" />
              <p className="text-xs text-slate-600 truncate">
                {pendingCount > 0
                  ? `${pendingCount} item${pendingCount > 1 ? 's' : ''} remaining before handover sign-off`
                  : 'All transition checklist items completed!'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('offboarding')}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer text-center"
            >
              Manage Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
