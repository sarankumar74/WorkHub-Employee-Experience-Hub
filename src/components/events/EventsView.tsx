import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Check,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { CompanyEvent, User } from '../../types/workhub';

interface EventsViewProps {
  events: CompanyEvent[];
  currentUser: User;
  onAddEvent: (evt: Partial<CompanyEvent>) => void;
  onJoinMeeting: (evt: CompanyEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  currentUser,
  onAddEvent,
  onJoinMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'My Meetings' | 'Training' | 'Company Events'>('Upcoming');
  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [addedCalendarIds, setAddedCalendarIds] = useState<Record<string, boolean>>({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTeam, setNewTeam] = useState('Engineering Team');
  const [newType, setNewType] = useState<CompanyEvent['type']>('Team Meeting');
  const [newTime, setNewTime] = useState('11:00 AM – 11:30 AM');
  const [newLink, setNewLink] = useState('https://meet.google.com/hub-sync');

  const filterTabs: ('Upcoming' | 'My Meetings' | 'Training' | 'Company Events')[] = [
    'Upcoming',
    'My Meetings',
    'Training',
    'Company Events',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (activeTab === 'My Meetings') {
        return ev.participants.includes(currentUser.name) || ev.isUserAttending;
      }
      if (activeTab === 'Training') {
        return ev.type === 'Training' || ev.type === 'Orientation';
      }
      if (activeTab === 'Company Events') {
        return ev.type === 'Company Event';
      }
      return true; // Upcoming returns all
    });
  }, [events, activeTab, currentUser]);

  const handleAddCalendar = (id: string, title: string) => {
    setAddedCalendarIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`"${title}" added to your Google/Outlook calendar.`);
    }, 100);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle,
      team: newTeam,
      type: newType,
      time: newTime,
      meetingLink: newLink,
      displayDate: { month: 'AUG', day: '25' },
      participants: [currentUser.name, 'Team Members'],
    });

    setIsAddingEvent(false);
    setNewTitle('');
  };

  // Days in month mock grid for August (Starts Saturday = day 6)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = [12, 14, 20, 25];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header + Add Event Action (Matches Screen 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Events & Meetings
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              View upcoming meetings, training sessions and company events.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingEvent(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Main Two-Column Layout (Matches Screen 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Tabs + Event Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs: Upcoming, My Meetings, Training, Company Events */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Event Cards List (Matches Screen 7) */}
          <div className="space-y-3">
            {filteredEvents.map((evt) => {
              const hasAdded = addedCalendarIds[evt.id];
              return (
                <div
                  key={evt.id}
                  className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Date Badge (e.g. AUG 12, AUG 14, AUG 20) */}
                    <div className="w-13 h-13 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[10px] font-black tracking-wider text-slate-400">
                        {evt.displayDate.month}
                      </span>
                      <span className="text-lg font-black text-slate-800 leading-none mt-0.5">
                        {evt.displayDate.day}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm md:text-base text-slate-900 truncate">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{evt.team}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {evt.time}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Join or Add to Calendar */}
                  <div className="shrink-0">
                    {evt.type === 'Team Meeting' || evt.type === '1:1' ? (
                      <button
                        onClick={() => onJoinMeeting(evt)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddCalendar(evt.id, evt.title)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                          hasAdded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                        }`}
                      >
                        {hasAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CalendarIcon className="w-3.5 h-3.5" />}
                        <span>{hasAdded ? 'Added' : 'Add to Calendar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Month Calendar Widget + Today's Schedule Breakdown (5 cols) (Matches Screen 7) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Month Calendar Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">August 2026</span>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 py-2">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 text-center text-xs gap-y-1">
              {/* Empty padding days before day 1 (Saturday start) */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="py-1.5 text-slate-300">
                  {27 + i}
                </div>
              ))}

              {daysInMonth.map((d) => {
                const isSelected = selectedDay === d;
                const hasEvent = eventDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-semibold text-xs transition relative ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : hasEvent
                        ? 'text-blue-700 bg-blue-50 font-bold hover:bg-blue-100'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Today's Schedule Mini-List Below Calendar (Matches Screen 7) */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Today's Schedule
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-400">10:00 AM</span>
                  <span className="font-bold text-slate-800">Team Standup</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-400">12:00 PM</span>
                  <span className="font-bold text-slate-800">1:1 with Manager</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-400">02:00 PM</span>
                  <span className="font-bold text-slate-800">Product Demo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Schedule New Meeting / Event</h3>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">EVENT TITLE</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sprint Retrospective & Planning"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">TEAM / AUDIENCE</label>
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TYPE</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="Team Meeting">Team Meeting</option>
                    <option value="1:1">1:1</option>
                    <option value="Training">Training</option>
                    <option value="Company Event">Company Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TIME</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:00 AM – 11:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MEETING LINK</label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
