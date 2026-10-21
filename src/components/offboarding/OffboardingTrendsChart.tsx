import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BarChart3,
  Activity,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { OffboardingRecord, OffboardingTask } from '../../types/workhub';

interface OffboardingTrendsChartProps {
  offboarding: OffboardingRecord;
  onSelectTask?: (taskId: string) => void;
}

interface MilestonePoint {
  id: string;
  shortLabel: string;
  fullTitle: string;
  dueDate: string;
  assignedRole: string;
  isCompleted: boolean;
  targetProgress: number; // 0 - 100
  actualProgress: number; // 0 - 100
  targetTasksCount: number;
  actualTasksCount: number;
  delayDays: number; // 0 if on-time, >0 if delayed
  statusText: string;
  severity: 'on_track' | 'minor_delay' | 'critical_delay';
}

export const OffboardingTrendsChart: React.FC<OffboardingTrendsChartProps> = ({
  offboarding,
  onSelectTask
}) => {
  const [chartMode, setChartMode] = useState<'velocity' | 'delays'>('velocity');
  const [isExpanded, setIsExpanded] = useState(true);

  const today = useMemo(() => new Date(), []);

  // Process tasks to compute chronological milestones, target vs actual velocity, and delay days
  const {
    milestones,
    totalDelayedCount,
    maxDelayDays,
    averageDelayDays,
    currentVelocityRate,
    targetVelocityRate,
    criticalBottlenecks,
    overallLagPercent
  } = useMemo(() => {
    const rawTasks = [...offboarding.tasks];
    const total = rawTasks.length || 1;

    // Sort by due date
    const sorted = rawTasks.sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });

    let cumulativeCompleted = 0;
    let totalDelaySum = 0;
    let delayedTasksCount = 0;
    let maxDelay = 0;
    const bottlenecks: { task: OffboardingTask; delayDays: number }[] = [];

    const points: MilestonePoint[] = sorted.map((task, index) => {
      const stepTarget = Math.round(((index + 1) / total) * 100);
      const isCompleted = task.status === 'completed';

      if (isCompleted) {
        cumulativeCompleted++;
      }

      const stepActual = Math.round((cumulativeCompleted / total) * 100);

      // Compute delay days
      let delayDays = 0;
      if (task.dueDate) {
        const dueDateObj = new Date(task.dueDate);
        const diffMs = today.getTime() - dueDateObj.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (!isCompleted && diffDays > 0) {
          delayDays = diffDays;
          delayedTasksCount++;
          totalDelaySum += delayDays;
          if (delayDays > maxDelay) maxDelay = delayDays;
          bottlenecks.push({ task, delayDays });
        }
      }

      let severity: 'on_track' | 'minor_delay' | 'critical_delay' = 'on_track';
      if (delayDays > 14) {
        severity = 'critical_delay';
      } else if (delayDays > 0) {
        severity = 'minor_delay';
      }

      // Format clean short label: e.g. "T1 Resign" or "Aug 5"
      const dateLabel = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `T${index + 1}`;

      const shortLabel = `${dateLabel} (${task.title.split(' ').slice(0, 2).join(' ')})`;

      return {
        id: task.id,
        shortLabel,
        fullTitle: task.title,
        dueDate: task.dueDate || 'N/A',
        assignedRole: task.assignedRole,
        isCompleted,
        targetProgress: stepTarget,
        actualProgress: stepActual,
        targetTasksCount: index + 1,
        actualTasksCount: cumulativeCompleted,
        delayDays,
        statusText: isCompleted ? 'Completed' : delayDays > 0 ? `${delayDays}d overdue` : 'On track',
        severity
      };
    });

    // Sort bottlenecks by delay descending
    bottlenecks.sort((a, b) => b.delayDays - a.delayDays);

    const avgDelay = delayedTasksCount > 0 ? Math.round(totalDelaySum / delayedTasksCount) : 0;
    const currentPercent = Math.round((cumulativeCompleted / total) * 100);
    const targetPercentNow = 100; // Expected completion by October 2026
    const lag = Math.max(0, targetPercentNow - currentPercent);

    return {
      milestones: points,
      totalDelayedCount: delayedTasksCount,
      maxDelayDays: maxDelay,
      averageDelayDays: avgDelay,
      currentVelocityRate: Math.round((cumulativeCompleted / 8) * 10) / 10, // tasks per phase
      targetVelocityRate: 1.0,
      criticalBottlenecks: bottlenecks.slice(0, 3),
      overallLagPercent: lag
    };
  }, [offboarding.tasks, today]);

  // Custom Tooltip for Velocity Chart
  const CustomVelocityTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MilestonePoint = payload[0].payload;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2 max-w-xs backdrop-blur-xs">
        <div className="border-b border-slate-700/80 pb-1.5">
          <p className="font-bold text-slate-100 text-sm leading-tight">{data.fullTitle}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="capitalize">{data.assignedRole} Role</span>
            <span>·</span>
            <span>Due {data.dueDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Actual Progress</span>
            <span className="font-bold text-emerald-400 text-sm">{data.actualProgress}%</span>
            <span className="text-slate-400 block text-[10px]">({data.actualTasksCount} tasks done)</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px]">Target Velocity</span>
            <span className="font-bold text-blue-400 text-sm">{data.targetProgress}%</span>
            <span className="text-slate-400 block text-[10px]">({data.targetTasksCount} tasks target)</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Timeline Status:</span>
          {data.isCompleted ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          ) : data.delayDays > 0 ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {data.delayDays} days delayed
            </span>
          ) : (
            <span className="text-blue-400 font-bold">On Schedule</span>
          )}
        </div>
      </div>
    );
  };

  // Custom Tooltip for Delays Chart
  const CustomDelayTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MilestonePoint = payload[0].payload;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 max-w-xs">
        <p className="font-bold text-slate-100">{data.fullTitle}</p>
        <p className="text-[11px] text-slate-400">Assigned: {data.assignedRole} · Due: {data.dueDate}</p>
        <div className="pt-1 border-t border-slate-700/80">
          {data.isCompleted ? (
            <span className="text-emerald-400 font-semibold text-[11px]">Task has been completed</span>
          ) : data.delayDays > 0 ? (
            <div className="space-y-0.5">
              <span className="text-rose-400 font-bold block">{data.delayDays} Days Overdue</span>
              <span className="text-[10px] text-rose-300/80">
                Potential bottleneck slowing down subsequent offboarding milestones.
              </span>
            </div>
          ) : (
            <span className="text-blue-400 font-semibold text-[11px]">Pending within target schedule</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Top Header Strip */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                Offboarding Velocity & Delay Trends
                {totalDelayedCount > 0 && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md border border-rose-200">
                    {totalDelayedCount} Delays Identified
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500">
                Track historical completion speed against expected timeline pace and diagnose process bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setChartMode('velocity')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'velocity'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Velocity Curve</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('delays')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                chartMode === 'delays'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Delay Days</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
            title={isExpanded ? 'Collapse trends' : 'Expand trends'}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Key KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Completion Pace
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-black text-slate-900">{offboarding.progressPercent}%</span>
                <span className="text-[11px] text-slate-500 font-semibold">of 100%</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {milestones.filter((m) => m.isCompleted).length} of {milestones.length} tasks completed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Timeline Lag
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className={`text-lg font-black ${
                    overallLagPercent > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {overallLagPercent > 0 ? `-${overallLagPercent}%` : 'On Schedule'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Target vs actual progress gap
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Max Task Delay
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className={`text-lg font-black ${
                    maxDelayDays > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {maxDelayDays > 0 ? `${maxDelayDays} Days` : '0 Days'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {totalDelayedCount} action items overdue
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Average Resolution Lag
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className={`text-lg font-black ${
                    averageDelayDays > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {averageDelayDays > 0 ? `~${averageDelayDays} Days` : 'On Track'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Mean lag per pending task
              </span>
            </div>
          </div>

          {/* Recharts Chart Container */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {chartMode === 'velocity'
                    ? 'Cumulative Progress Speed (Target vs. Actual %)'
                    : 'Milestone Delay Gap (Days Overdue)'}
                </span>
                <span className="text-slate-400 hidden md:inline">·</span>
                <span className="text-slate-500 text-[11px] hidden md:inline">
                  {chartMode === 'velocity'
                    ? 'Comparing planned velocity curve to current completion trajectory'
                    : 'Pinpointing which tasks exceed due dates and threaten clearance'}
                </span>
              </div>

              {chartMode === 'velocity' && (
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    Target Pace
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Actual Speed
                  </span>
                </div>
              )}
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'velocity' ? (
                  <ComposedChart
                    data={milestones}
                    margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                  >
                    <defs>
                      <linearGradient id="velocityTargetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="velocityActualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      stroke="#94A3B8"
                      tick={{ fill: '#64748B', fontSize: 10 }}
                      angle={-18}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      unit="%"
                    />
                    <Tooltip content={<CustomVelocityTooltip />} />
                    <ReferenceLine y={100} stroke="#CBD5E1" strokeDasharray="4 4" />

                    {/* Target Planned Progress Area */}
                    <Area
                      type="monotone"
                      dataKey="targetProgress"
                      name="Target Pace"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#velocityTargetGrad)"
                    />

                    {/* Actual Historical Speed Area */}
                    <Area
                      type="monotone"
                      dataKey="actualProgress"
                      name="Actual Speed"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#velocityActualGrad)"
                      activeDot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                ) : (
                  <BarChart
                    data={milestones}
                    margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      stroke="#94A3B8"
                      tick={{ fill: '#64748B', fontSize: 10 }}
                      angle={-18}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      unit="d"
                    />
                    <Tooltip content={<CustomDelayTooltip />} />
                    <ReferenceLine y={0} stroke="#94A3B8" />
                    <ReferenceLine
                      y={7}
                      stroke="#F59E0B"
                      strokeDasharray="3 3"
                      label={{ value: 'Warning (7d)', fill: '#D97706', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    <ReferenceLine
                      y={14}
                      stroke="#E11D48"
                      strokeDasharray="3 3"
                      label={{ value: 'Critical (14d)', fill: '#E11D48', fontSize: 10, position: 'insideTopLeft' }}
                    />

                    <Bar dataKey="delayDays" radius={[6, 6, 0, 0]}>
                      {milestones.map((entry, index) => {
                        const color =
                          entry.delayDays === 0
                            ? '#10B981' // on track
                            : entry.delayDays > 14
                            ? '#E11D48' // critical
                            : '#F59E0B'; // warning
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Identified Bottlenecks Callout Card */}
          {criticalBottlenecks.length > 0 && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/90 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <h4 className="font-bold text-xs text-rose-900">
                  Critical Process Bottlenecks Detected
                </h4>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                The chart identifies that offboarding velocity slowed significantly after Week 2.
                The following tasks exceed target SLAs and pose a risk to the employee&apos;s final HR clearance:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {criticalBottlenecks.map(({ task, delayDays }) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-white/90 rounded-lg border border-rose-200 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-rose-600 uppercase tracking-wide">
                          +{delayDays} Days Lag
                        </span>
                        <span className="text-slate-500 capitalize">{task.assignedRole}</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs mt-1 truncate" title={task.title}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
