import React, { useState, useMemo } from 'react';
import {
  Search,
  Mail,
  MessageSquare,
  Phone,
  User as UserIcon,
  Briefcase,
  Layers,
  MapPin,
  X,
  ExternalLink,
  ChevronDown,
  UserCog
} from 'lucide-react';
import { Employee, User } from '../../types/workhub';

interface PeopleFinderViewProps {
  employees: Employee[];
  currentUser?: User;
  onOpenEditProfile?: () => void;
  onOpenMessageModal: (emp: Employee) => void;
}

export const PeopleFinderView: React.FC<PeopleFinderViewProps> = ({
  employees,
  currentUser,
  onOpenEditProfile,
  onOpenMessageModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<Employee | null>(null);

  // Extract unique filter lists
  const teamsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.team));
    return ['All Teams', ...Array.from(set)];
  }, [employees]);

  const rolesList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.jobTitle));
    return ['All Roles', ...Array.from(set)];
  }, [employees]);

  const projectsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.projects.forEach((p) => set.add(p)));
    return ['All Projects', ...Array.from(set)];
  }, [employees]);

  const skillsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.skills.forEach((s) => set.add(s)));
    return ['All Skills', ...Array.from(set)];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.team.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q)) ||
        e.projects.some((p) => p.toLowerCase().includes(q));

      const matchesTeam = selectedTeam === 'All Teams' || e.team === selectedTeam;
      const matchesRole = selectedRole === 'All Roles' || e.jobTitle === selectedRole;
      const matchesProject = selectedProject === 'All Projects' || e.projects.includes(selectedProject);
      const matchesSkill = selectedSkill === 'All Skills' || e.skills.includes(selectedSkill);

      return matchesSearch && matchesTeam && matchesRole && matchesProject && matchesSkill;
    });
  }, [employees, searchQuery, selectedTeam, selectedRole, selectedProject, selectedSkill]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header (Matches Screen 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              People & Team Finder
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Find the right person by name, role, team, project or skill.
            </p>
          </div>
        </div>

        {onOpenEditProfile && currentUser && (
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-300"
            />
            <span>Edit My Profile</span>
            <UserCog className="w-3.5 h-3.5 text-blue-600" />
          </button>
        )}
      </div>

      {/* Search Bar + Button (Matches Screen 4) */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, team, project or skill..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs transition"
          />
        </div>
        <button
          onClick={() => {}}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm shrink-0"
        >
          Search
        </button>
      </div>

      {/* Filter Dropdowns Row (Matches Screen 4) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="relative">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            {teamsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            {rolesList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            {projectsList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full appearance-none px-3.5 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            {skillsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Employee Cards List (Matches Screen 4) */}
      <div className="space-y-3.5">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <UserIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-800">No team members match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search query or dropdowns</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTeam('All Teams');
                setSelectedRole('All Roles');
                setSelectedProject('All Projects');
                setSelectedSkill('All Skills');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Info: Avatar + Details */}
              <div className="flex items-start md:items-center gap-3.5 min-w-0">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  onClick={() => setActiveEmployeeModal(emp)}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 cursor-pointer shrink-0 group-hover:scale-105 transition"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      onClick={() => setActiveEmployeeModal(emp)}
                      className="font-bold text-sm md:text-base text-slate-900 hover:text-blue-600 transition cursor-pointer truncate"
                    >
                      {emp.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {emp.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{emp.jobTitle}</p>

                  {/* Badges / Tags (Matches Screen 4) */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100/80 rounded-md text-[10px] font-semibold">
                      {emp.team}
                    </span>
                    {emp.projects.slice(0, 2).map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100/80 rounded-md text-[10px] font-semibold"
                      >
                        {p}
                      </span>
                    ))}
                    {emp.skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Icons (Matches Screen 4): Email, Chat, Phone */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                <a
                  href={`mailto:${emp.email}`}
                  title={`Email ${emp.name}`}
                  className="w-9 h-9 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onOpenMessageModal(emp)}
                  title={`Message ${emp.name}`}
                  className="w-9 h-9 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveEmployeeModal(emp)}
                  title="View Profile Details"
                  className="w-9 h-9 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Employee Detail Modal */}
      {activeEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={activeEmployeeModal.avatar}
                  alt={activeEmployeeModal.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h3 className="font-bold text-lg">{activeEmployeeModal.name}</h3>
                  <p className="text-blue-100 text-xs">{activeEmployeeModal.jobTitle}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    {activeEmployeeModal.department} • {activeEmployeeModal.team}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveEmployeeModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-600">
              {activeEmployeeModal.bio && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    About
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{activeEmployeeModal.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">MANAGER</span>
                  <span className="font-bold text-slate-800">{activeEmployeeModal.manager}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">LOCATION</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    {activeEmployeeModal.location}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Assigned Projects
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeEmployeeModal.projects.map((p, idx) => (
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
                  Core Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeEmployeeModal.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {currentUser && onOpenEditProfile && (activeEmployeeModal.email.toLowerCase() === currentUser.email.toLowerCase() || activeEmployeeModal.id === currentUser.id) ? (
                  <button
                    onClick={() => {
                      setActiveEmployeeModal(null);
                      onOpenEditProfile();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <UserCog className="w-4 h-4" />
                    Edit My Profile & Photo
                  </button>
                ) : (
                  <>
                    <a
                      href={`mailto:${activeEmployeeModal.email}`}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email {activeEmployeeModal.name.split(' ')[0]}
                    </a>
                    <button
                      onClick={() => {
                        const emp = activeEmployeeModal;
                        setActiveEmployeeModal(null);
                        onOpenMessageModal(emp);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
