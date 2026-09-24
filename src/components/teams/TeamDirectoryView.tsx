import React, { useState } from 'react';
import {
  Network,
  Users,
  Briefcase,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  ArrowDown
} from 'lucide-react';
import { DepartmentNode } from '../../types/workhub';

interface TeamDirectoryViewProps {
  departments: DepartmentNode[];
  onNavigateToDocs: () => void;
}

export const TeamDirectoryView: React.FC<TeamDirectoryViewProps> = ({
  departments,
  onNavigateToDocs,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedSubteam, setSelectedSubteam] = useState<{
    deptName: string;
    subteam: DepartmentNode['subteams'][0];
  } | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header + View Switcher (Matches Screen 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Company & Team Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Explore our organization structure, teams and projects.
            </p>
          </div>
        </div>

        {/* Switcher Buttons: Org Chart vs List View */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'chart'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Org Chart
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* ORG CHART VIEW (Matches Screen 5) */}
      {viewMode === 'chart' ? (
        <div className="space-y-8 overflow-x-auto pb-6">
          {/* Top Root Node: WorkHub 250+ Employees */}
          <div className="flex flex-col items-center">
            <div className="w-64 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center shadow-lg shadow-blue-500/20">
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  W
                </div>
                <h3 className="font-extrabold text-sm tracking-tight">WorkHub</h3>
              </div>
              <p className="text-xs text-blue-100 mt-1 font-medium">250+ Employees</p>
            </div>
            {/* Stem line */}
            <div className="w-0.5 h-6 bg-slate-300" />
            <div className="w-5/6 max-w-5xl h-0.5 bg-slate-300 hidden md:block" />
          </div>

          {/* 5 Connected Department Columns (Responsive for Tablet & Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4.5">
            {departments.map((dept) => {
              // Color themes matching the mockup:
              // Engineering: blue, Product: emerald/green, Design: rose/red, Marketing: amber, HR: purple
              const colorStyles: Record<string, { headerBg: string; border: string; badge: string; subHover: string }> = {
                Engineering: {
                  headerBg: 'bg-blue-600 text-white',
                  border: 'border-blue-200',
                  badge: 'bg-blue-100 text-blue-800',
                  subHover: 'hover:border-blue-400 hover:bg-blue-50/50',
                },
                Product: {
                  headerBg: 'bg-emerald-600 text-white',
                  border: 'border-emerald-200',
                  badge: 'bg-emerald-100 text-emerald-800',
                  subHover: 'hover:border-emerald-400 hover:bg-emerald-50/50',
                },
                Design: {
                  headerBg: 'bg-rose-600 text-white',
                  border: 'border-rose-200',
                  badge: 'bg-rose-100 text-rose-800',
                  subHover: 'hover:border-rose-400 hover:bg-rose-50/50',
                },
                Marketing: {
                  headerBg: 'bg-amber-500 text-white',
                  border: 'border-amber-200',
                  badge: 'bg-amber-100 text-amber-800',
                  subHover: 'hover:border-amber-400 hover:bg-amber-50/50',
                },
                HR: {
                  headerBg: 'bg-purple-600 text-white',
                  border: 'border-purple-200',
                  badge: 'bg-purple-100 text-purple-800',
                  subHover: 'hover:border-purple-400 hover:bg-purple-50/50',
                },
              };

              const style = colorStyles[dept.name] || colorStyles.Engineering;

              return (
                <div key={dept.id} className="flex flex-col items-center">
                  {/* Department Header Card */}
                  <div
                    className={`w-full p-3.5 rounded-2xl ${style.headerBg} text-center shadow-xs cursor-default`}
                  >
                    <div className="font-bold text-xs md:text-sm tracking-tight">{dept.name}</div>
                    <div className="text-[11px] opacity-90 font-medium">({dept.memberCount} members)</div>
                  </div>

                  {/* Vertical connector */}
                  <div className="w-0.5 h-4 bg-slate-300" />

                  {/* Subteam Pills List (Matches Screen 5) */}
                  <div className="w-full space-y-2">
                    {dept.subteams.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubteam({ deptName: dept.name, subteam: sub })}
                        className={`w-full p-2.5 rounded-xl bg-white border border-slate-200/80 ${style.subHover} transition text-left shadow-2xs group flex items-center justify-between cursor-pointer`}
                      >
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                          • {sub.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">
                          ({sub.memberCount})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept.id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">{dept.name} Department</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {dept.memberCount} team members
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {dept.subteams.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubteam({ deptName: dept.name, subteam: sub })}
                    className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{sub.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{sub.memberCount} members</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                    <div className="mt-2 text-[10px] font-medium text-blue-600 flex items-center gap-1">
                      <span>Lead: {sub.lead}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subteam Detail Modal */}
      {selectedSubteam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
                  {selectedSubteam.deptName} Department
                </span>
                <h3 className="text-xl font-bold mt-0.5">{selectedSubteam.subteam.name} Team</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Team Lead: <span className="font-bold text-white">{selectedSubteam.subteam.lead}</span> •{' '}
                  {selectedSubteam.subteam.memberCount} Members
                </p>
              </div>
              <button
                onClick={() => setSelectedSubteam(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-600">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  About Team
                </h4>
                <p className="text-slate-600 leading-relaxed">{selectedSubteam.subteam.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Core Responsibilities
                </h4>
                <ul className="space-y-1">
                  {selectedSubteam.subteam.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Active Projects
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubteam.subteam.projects.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Tech Stack & Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubteam.subteam.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSubteam(null);
                    onNavigateToDocs();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  View Team Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
