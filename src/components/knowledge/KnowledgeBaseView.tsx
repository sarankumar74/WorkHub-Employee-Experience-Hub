import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  FileText,
  Shield,
  Clock,
  Tag,
  ExternalLink,
  Plus,
  X,
  Check,
  ChevronRight,
  Download,
  Share2,
  FolderTree
} from 'lucide-react';
import { KnowledgeArticle, User } from '../../types/workhub';

interface KnowledgeBaseViewProps {
  articles: KnowledgeArticle[];
  currentUser: User;
  onAddArticle: (art: Partial<KnowledgeArticle>) => void;
  selectedArticleId?: string | null;
  onClearSelectedArticle?: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  articles,
  currentUser,
  onAddArticle,
  selectedArticleId,
  onClearSelectedArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(() => {
    if (selectedArticleId) {
      return articles.find((a) => a.id === selectedArticleId) || null;
    }
    return null;
  });
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeArticle['category']>('Company Policies');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('policy, internal');

  // Categories list with count breakdown (Matches Screen 6)
  const categoryCounts = [
    { label: 'All', count: 52 },
    { label: 'Company Policies', count: 10 },
    { label: 'Culture & Values', count: 5 },
    { label: 'Project Documentation', count: 12 },
    { label: 'Tools & Resources', count: 8 },
    { label: 'Processes', count: 8 },
    { label: 'FAQs', count: 6 },
    { label: 'Important Links', count: 3 },
  ];

  // Top tab filter pills (Matches Screen 6)
  const topTabs = ['All', 'Policies', 'Documentation', 'Processes', 'Tools', 'FAQs'];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        art.content.toLowerCase().includes(q);

      const matchesCat =
        activeCategory === 'All' ||
        (activeCategory === 'Policies' && art.category === 'Company Policies') ||
        (activeCategory === 'Documentation' && art.category === 'Project Documentation') ||
        (activeCategory === 'Tools' && art.category === 'Tools & Resources') ||
        art.category.toLowerCase().includes(activeCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [articles, searchQuery, activeCategory]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddArticle({
      title: newTitle,
      category: newCategory,
      summary: newSummary || 'Uploaded knowledge resource for employee hub.',
      content: newContent || `# ${newTitle}\n\nDocumentation details...`,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      author: `${currentUser.name} (${currentUser.role})`,
    });

    setIsCreatingArticle(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header + Add Article (Matches Screen 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Company Knowledge Base
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Find policies, documentation, FAQs and important resources.
            </p>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsCreatingArticle(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Search Bar + Search Button (Matches Screen 6) */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, policies, documentation..."
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

      {/* Top Filter Tabs Pills (Matches Screen 6) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {topTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              activeCategory === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Categories Sidebar + Right Featured Resources (Responsive for Tablet & Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Categories (4 cols on desktop, compact cards on tablet) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs h-fit space-y-1">
          <h3 className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {categoryCounts.map((cat) => {
              const isSelected =
                activeCategory === cat.label ||
                (activeCategory === 'Policies' && cat.label === 'Company Policies') ||
                (activeCategory === 'Documentation' && cat.label === 'Project Documentation');
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate mr-1">{cat.label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Featured Resources (8 cols on desktop, full on tablet) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-bold text-sm md:text-base text-slate-900">Featured Resources</h2>
            <button
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setViewingArticle(art)}
                className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm md:text-base text-slate-900 group-hover:text-blue-600 transition truncate">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{art.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>{art.updatedAt}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline font-semibold text-slate-600">{art.category}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Article Reader Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Bar */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wide">
                  {viewingArticle.category}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
                  {viewingArticle.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Author: {viewingArticle.author}</span>
                  <span>•</span>
                  <span>{viewingArticle.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => alert(`Downloaded: ${viewingArticle.title}.pdf`)}
                  title="Download Document"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Document link copied to clipboard!');
                  }}
                  title="Share"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setViewingArticle(null);
                    if (onClearSelectedArticle) onClearSelectedArticle();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article Content with markdown typography */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed">
              <div className="whitespace-pre-wrap font-sans">{viewingArticle.content}</div>

              {/* Tag footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {viewingArticle.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create Article Modal */}
      {isCreatingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Upload New Knowledge Document</h3>
              <button
                onClick={() => setIsCreatingArticle(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">DOCUMENT TITLE</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Remote Expense Reimbursement Policy"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CATEGORY</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="Company Policies">Company Policies</option>
                  <option value="Culture & Values">Culture & Values</option>
                  <option value="Project Documentation">Project Documentation</option>
                  <option value="Tools & Resources">Tools & Resources</option>
                  <option value="Processes">Processes</option>
                  <option value="FAQs">FAQs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SHORT SUMMARY</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Brief overview for search and previews..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MARKDOWN CONTENT</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="# Heading\n\nEnter guidelines here..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="finance, expense, wfh"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingArticle(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
