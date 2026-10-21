import React from 'react';
import {
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { QuickActionType } from '../modals/QuickActionModal';

interface QuickActionsSectionProps {
  onTriggerAction: (action: QuickActionType) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onTriggerAction,
}) => {
  const actions = [
    {
      id: 'time-off' as const,
      title: 'Request Time Off',
      subtitle: '16.5 days available · PTO & leave',
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
      border: 'hover:border-amber-300',
      badge: 'PTO & Leave',
    },
    {
      id: 'expense' as const,
      title: 'Submit Expense',
      subtitle: 'Claims, meals, travel & equipment',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      border: 'hover:border-emerald-300',
      badge: 'Reimbursements',
    },
    {
      id: 'work-hours' as const,
      title: 'Log Work Hours',
      subtitle: 'Daily timesheet & project tracking',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white',
      border: 'hover:border-blue-300',
      badge: 'Timesheet',
    },
  ];

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-2">
              <span>Quick Actions</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              One-click access to common daily employee tasks & requests
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          Fast-track submissions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onTriggerAction(act.id)}
              className={`p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 shadow-2xs hover:shadow-xs transition-all text-left flex items-start gap-3.5 group cursor-pointer ${act.border}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 ${act.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {act.title}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {act.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
