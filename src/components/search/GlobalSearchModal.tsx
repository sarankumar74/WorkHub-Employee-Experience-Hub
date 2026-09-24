import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  Users,
  Briefcase,
  FileText,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Employee, KnowledgeArticle, CompanyEvent } from '../../types/workhub';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, metadata?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    people: Employee[];
    teams: any[];
    documents: KnowledgeArticle[];
    events: CompanyEvent[];
  }>({
    people: [],
    teams: [],
    documents: [],
    events: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ people: [], teams: [], documents: [], events: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ people: [], teams: [], documents: [], events: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults({
          people: data.people || [],
          teams: data.teams || [],
          documents: data.documents || [],
          events: data.events || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.people.length + results.teams.length + results.documents.length + results.events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type 'Payment API', 'Leave', 'Arun', 'Engineering'..."
            className="flex-1 text-sm md:text-base text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips when empty */}
        {!query && (
          <div className="p-6 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {['Payment API', 'Work From Home Policy', 'Arun Kumar', 'Leave Policy', 'Team Standup', 'Code Review'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-medium text-slate-600 hover:text-blue-600 border border-slate-200/70 transition"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Results Container */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-xs divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Searching company resources...</div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No matching results found for "{query}".
              </div>
            ) : (
              <>
                {/* 1. People matches */}
                {results.people.length > 0 && (
                  <div className="space-y-2 pt-2 first:pt-0">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                      People
                    </span>
                    {results.people.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          onClose();
                          onNavigate('people', { employeeId: emp.id });
                        }}
                        className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 block">
                              {emp.name}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {emp.jobTitle} • {emp.team}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Teams matches */}
                {results.teams.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                      Teams & Departments
                    </span>
                    {results.teams.map((tm, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onClose();
                          onNavigate('teams');
                        }}
                        className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 block">
                              {tm.name}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              Department: {tm.department} • Lead: {tm.lead}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Documents & Knowledge Base */}
                {results.documents.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                      Documents & Policies
                    </span>
                    {results.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onClose();
                          onNavigate('knowledge', { articleId: doc.id });
                        }}
                        className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 block">
                              {doc.title}
                            </span>
                            <span className="text-slate-500 text-[11px]">{doc.category}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Events */}
                {results.events.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                      Events & Meetings
                    </span>
                    {results.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onClose();
                          onNavigate('events');
                        }}
                        className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 block">
                              {ev.title}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {ev.team} • {ev.time}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
