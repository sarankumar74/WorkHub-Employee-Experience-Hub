import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Pin,
  Sparkles,
  Check,
  Edit2,
  Palette,
  X,
  Clock
} from 'lucide-react';
import { User } from '../../types/workhub';

export interface StickyNoteItem {
  id: string;
  content: string;
  color: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose';
  isPinned?: boolean;
  updatedAt: string;
}

interface StickyNotesSectionProps {
  currentUser: User;
}

const COLOR_CONFIGS: Record<
  StickyNoteItem['color'],
  {
    bg: string;
    border: string;
    header: string;
    text: string;
    accent: string;
    badge: string;
  }
> = {
  amber: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200/90 hover:border-amber-300',
    header: 'text-amber-900',
    text: 'text-amber-950',
    accent: 'bg-amber-500',
    badge: 'bg-amber-200/60 text-amber-800',
  },
  blue: {
    bg: 'bg-sky-50/90',
    border: 'border-sky-200/90 hover:border-sky-300',
    header: 'text-sky-900',
    text: 'text-sky-950',
    accent: 'bg-sky-500',
    badge: 'bg-sky-200/60 text-sky-800',
  },
  emerald: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200/90 hover:border-emerald-300',
    header: 'text-emerald-900',
    text: 'text-emerald-950',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-200/60 text-emerald-800',
  },
  purple: {
    bg: 'bg-purple-50/90',
    border: 'border-purple-200/90 hover:border-purple-300',
    header: 'text-purple-900',
    text: 'text-purple-950',
    accent: 'bg-purple-500',
    badge: 'bg-purple-200/60 text-purple-800',
  },
  rose: {
    bg: 'bg-rose-50/90',
    border: 'border-rose-200/90 hover:border-rose-300',
    header: 'text-rose-900',
    text: 'text-rose-950',
    accent: 'bg-rose-500',
    badge: 'bg-rose-200/60 text-rose-800',
  },
};

const DEFAULT_NOTES: StickyNoteItem[] = [
  {
    id: 'note-1',
    content: '📌 Remember to sync with the product team on the v2 navigation redesign before Friday standup.',
    color: 'amber',
    isPinned: true,
    updatedAt: 'Today, 9:30 AM',
  },
  {
    id: 'note-2',
    content: '🔑 Useful internal link: check out the new engineering architecture RFC on the Knowledge Hub.',
    color: 'blue',
    isPinned: false,
    updatedAt: 'Yesterday',
  },
];

export const StickyNotesSection: React.FC<StickyNotesSectionProps> = ({ currentUser }) => {
  const storageKey = `workhub_sticky_notes_${currentUser.id || 'default'}`;

  const [notes, setNotes] = useState<StickyNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_NOTES;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<StickyNoteItem['color']>('amber');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Save to localStorage when notes change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (err) {
      console.warn('Failed to save sticky notes to localStorage:', err);
    }
  }, [notes, storageKey]);

  // Reload notes if current user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        setNotes(DEFAULT_NOTES);
      }
    } catch {
      setNotes(DEFAULT_NOTES);
    }
  }, [storageKey]);

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const newNote: StickyNoteItem = {
      id: `note-${Date.now()}`,
      content: trimmed,
      color: selectedColor,
      isPinned: false,
      updatedAt: 'Just now',
    };

    setNotes([newNote, ...notes]);
    setNewContent('');
    setIsCreating(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleChangeColor = (id: string, color: StickyNoteItem['color']) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setNotes(
      notes.map((n) =>
        n.id === id
          ? {
              ...n,
              content: editingText.trim(),
              updatedAt: 'Just now',
            }
          : n
      )
    );
    setEditingId(null);
  };

  // Sort notes: pinned first, then recent
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/70 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-2">
              <span>My Sticky Notes</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {notes.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Quick reminders & text snippets saved locally on this browser
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setNewContent('');
          }}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Inline Create Note Card */}
      {isCreating && (
        <form
          onSubmit={handleAddNote}
          className="p-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Write Quick Snippet
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            autoFocus
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Type your notes, checklist items, links, or ideas..."
            className="w-full p-3 rounded-xl border border-blue-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Color:</span>
              {(['amber', 'blue', 'emerald', 'purple', 'rose'] as const).map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition cursor-pointer flex items-center justify-center ${
                    COLOR_CONFIGS[color].accent
                  } ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-slate-700 scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  title={color}
                >
                  {selectedColor === color && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newContent.trim()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sticky Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <StickyNote className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No sticky notes yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Keep quick links, meeting reminders, or draft ideas handy right on your personal dashboard.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedNotes.map((note) => {
            const colors = COLOR_CONFIGS[note.color] || COLOR_CONFIGS.amber;
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm ${colors.bg} ${colors.border}`}
              >
                {/* Note Top Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${colors.badge}`}>
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        Pinned
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      {note.updatedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Pin button */}
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      title={note.isPinned ? 'Unpin note' : 'Pin to top'}
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        note.isPinned
                          ? 'text-amber-700 bg-amber-200/70'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveEdit(note.id);
                        } else {
                          setEditingId(note.id);
                          setEditingText(note.content);
                        }
                      }}
                      title="Edit note"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-lg transition cursor-pointer"
                    >
                      {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                {isEditing ? (
                  <div className="space-y-2 py-1">
                    <textarea
                      autoFocus
                      rows={3}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-black/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap ${colors.text}`}>
                    {note.content}
                  </p>
                )}

                {/* Bottom Color Palette Picker */}
                <div className="pt-3 mt-2 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(['amber', 'blue', 'emerald', 'purple', 'rose'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => handleChangeColor(note.id, c)}
                        className={`w-3.5 h-3.5 rounded-full transition cursor-pointer ${
                          COLOR_CONFIGS[c].accent
                        } ${
                          note.color === c
                            ? 'ring-1.5 ring-offset-1 ring-slate-600 scale-110'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        title={`Change to ${c}`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {note.content.length} chars
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
