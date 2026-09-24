import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { User, NotificationItem } from '../../types/workhub';

interface NavbarProps {
  currentUser: User;
  onOpenSearch: () => void;
  onOpenLogout: () => void;
  onOpenEditProfile: () => void;
  onSwitchRole: (user: User) => void;
  demoUsers: User[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenSearch,
  onOpenLogout,
  onOpenEditProfile,
  onSwitchRole,
  demoUsers,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  notifications,
  onNotificationClick,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      {/* Mobile/Tablet Toggle & Search Trigger */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 max-w-xl">
        {/* Mobile & Tablet Drawer Trigger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition"
          aria-label="Toggle Navigation Drawer"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop / Large Tablet icon rail toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition mr-1"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Global Search Input Trigger */}
        <div
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 w-full max-w-xs md:max-w-md px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-xl cursor-pointer border border-slate-200/60 transition group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
          <span className="text-xs md:text-sm text-slate-400 select-none flex-1 truncate">
            Search people, docs, events...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onNotificationClick(notif);
                      setShowNotifications(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer flex gap-3 transition ${
                      !notif.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'meeting' ? (
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                      ) : notif.type === 'offboarding' ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 md:pl-2 md:pr-2.5 rounded-full md:rounded-xl hover:bg-slate-100 transition"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-slate-500 capitalize">
                {currentUser.jobTitle}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                  Role: {currentUser.role}
                </span>
              </div>

              {/* Edit Profile & Avatar Action */}
              <div className="py-1 border-b border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenEditProfile();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    <span>Edit Profile & Photo</span>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-blue-100/80 px-1.5 py-0.5 rounded-md font-bold">
                    Edit
                  </span>
                </button>
              </div>

              {/* Role Switcher for previewing Employee, Manager, and HR/Admin views */}
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Switch Demo Persona
                </span>
                <div className="space-y-1">
                  {demoUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchRole(u);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
