import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Network,
  BookOpen,
  CalendarDays,
  LogOut,
  HelpCircle,
  Wand2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog
} from 'lucide-react';
import { User } from '../../types/workhub';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onOpenLogout: () => void;
  onOpenEditProfile?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogout,
  onOpenEditProfile,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'RAG' },
    { id: 'people', label: 'People Finder', icon: Users },
    { id: 'teams', label: 'Team Directory', icon: Network },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'events', label: 'Events & Meetings', icon: CalendarDays },
    { id: 'offboarding', label: 'Exit & Offboarding', icon: LogOut, badge: 'Active' },
    { id: 'image-studio', label: 'Asset Studio', icon: Wand2, badge: 'AI' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 flex flex-col justify-between h-screen bg-white border-r border-slate-200 transition-all duration-200 ease-in-out ${
          /* Mobile behavior: off-canvas drawer */
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Tablet / Desktop collapsible width */
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* WorkHub Brand Header + Collapse Toggle Button */}
          <div
            className={`flex items-center border-b border-slate-100 transition-all ${
              isCollapsed ? 'justify-center p-4' : 'justify-between px-5 py-4'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
                W
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="font-bold text-slate-900 tracking-tight text-base truncate">
                    WorkHub
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 truncate">
                    Employee Experience Hub
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle button (visible on tablet and desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Main Menu
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all group relative ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide uppercase shrink-0 ${
                        isActive
                          ? 'bg-blue-700/80 text-white'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed mode */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Role pill indicator (compact if collapsed) */}
          <div className={`mx-3 mt-2 rounded-xl bg-slate-50 border border-slate-100 ${isCollapsed ? 'p-2 text-center' : 'p-3'}`}>
            {isCollapsed ? (
              <div title={`Role: ${currentUser.role}`} className="flex justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Active Role
                  </span>
                  <span className="capitalize font-bold text-blue-700 text-[10px] bg-blue-100/80 px-2 py-0.5 rounded-full">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {currentUser.role === 'admin'
                    ? 'Full HR & Admin management access'
                    : currentUser.role === 'manager'
                    ? 'Team oversight & handover reviews'
                    : 'Standard employee experience portal'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Help & Support + User Card */}
        <div className={`border-t border-slate-100 space-y-2 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          <button
            onClick={() => handleNavClick('knowledge')}
            title={isCollapsed ? 'Help & Support' : undefined}
            className={`w-full flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Help & Support</span>}
          </button>

          {/* User Profile info */}
          <div
            className={`flex items-center rounded-xl bg-slate-50 border border-slate-100 ${
              isCollapsed ? 'flex-col p-2 gap-2' : 'justify-between p-2'
            }`}
          >
            <div
              onClick={onOpenEditProfile}
              className="flex items-center gap-2 overflow-hidden min-w-0 cursor-pointer hover:opacity-80 transition group"
              title="Click to edit profile"
            >
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs group-hover:ring-2 group-hover:ring-blue-400 transition"
                />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.jobTitle}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {onOpenEditProfile && !isCollapsed && (
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  title="Edit Profile"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                >
                  <UserCog className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
