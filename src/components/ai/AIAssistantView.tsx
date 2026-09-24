import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ExternalLink,
  Check,
  Bot,
  User,
  ShieldAlert
} from 'lucide-react';
import { AIMessage } from '../../types/workhub';

interface AIAssistantViewProps {
  onOpenArticleByTitle?: (title: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onOpenArticleByTitle }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init-1',
      role: 'user',
      content: 'What is our company hybrid and work from home policy?',
      timestamp: '10:24 AM',
    },
    {
      id: 'msg-init-2',
      role: 'assistant',
      content: `Our company follows a hybrid work policy:

• **3 days work from office** (Mon, Tue, Thu)
• **2 days work from home** (Wed, Fri)
• **Flexible timing** between 9 AM – 6 PM
• **Home Office Stipend**: $750 annual credit for ergonomic and hardware setup
• **See the full policy here:** Work from Home Policy`,
      timestamp: '10:24 AM',
      sources: [
        { title: 'Work From Home Policy', category: 'Company Policies' },
      ],
      suggestedFollowups: [
        'Can I work remotely from another city?',
        'How to apply for WFH?',
        'What equipment is provided?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    { label: 'Company Policies', prompt: 'What are the main company policies for working hours and conduct?' },
    { label: 'Project Documentation', prompt: 'Who handles the Payment API and where is the documentation?' },
    { label: 'HR Policies', prompt: 'How does the company performance review and PTO system work?' },
    { label: 'Leave Policy', prompt: 'How many days of leave do we get per year?' },
    { label: 'Teams & Roles', prompt: 'Explain our engineering team structure and leads.' },
    { label: 'Development Process', prompt: 'What is our code review and pull request process?' },
    { label: 'Work From Home', prompt: 'What is our work from home and hybrid policy?' },
    { label: 'Company Culture', prompt: 'What are our core company values and mission?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();

      const aiReply: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Here is the relevant information based on our company knowledge base.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        suggestedFollowups: data.suggestedFollowups || [
          'Who is responsible for this project?',
          'Where is this documented in WorkHub?',
          'How do I request access?',
        ],
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered a temporary connection issue. You can also browse the articles directly in the **Knowledge Base** tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } catch {
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Assistant Header (Matches Screen 3) */}
      <div className="p-4 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shadow-blue-500/20">
            A
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Company Assistant
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                RAG Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Ask anything about our company, policies, teams, projects or processes.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `msg-clear-${Date.now()}`,
                role: 'assistant',
                content: 'Conversation reset. How can I help you today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Quick Prompt Chips (Matches Screen 3) */}
      <div className="px-4 md:px-6 py-2.5 border-b border-slate-100 bg-slate-50/30 overflow-x-auto flex gap-2 no-scrollbar shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-600 hover:text-blue-700 shrink-0 transition shadow-2xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                    A
                  </div>
                )}
              </div>

              {/* Bubble Body */}
              <div className={`space-y-2 max-w-2xl ${isUser ? 'items-end text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-xs border border-slate-200/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Sources badge pills */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400 font-medium">Source:</span>
                      {msg.sources.map((s, idx) => (
                        <span
                          key={idx}
                          onClick={() => onOpenArticleByTitle && onOpenArticleByTitle(s.title)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp & Action Bar */}
                <div
                  className={`flex items-center gap-2 text-[11px] text-slate-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setFeedback((prev) => ({ ...prev, [msg.id]: 'up' }))}
                        className={`p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition ${
                          feedback[msg.id] === 'up' ? 'text-blue-600 font-bold' : ''
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback((prev) => ({ ...prev, [msg.id]: 'down' }))}
                        className={`p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition ${
                          feedback[msg.id] === 'down' ? 'text-rose-600 font-bold' : ''
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up chips (Matches Screen 3) */}
                {!isUser && msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowups.map((followup, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(followup)}
                        className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition shadow-2xs"
                      >
                        {followup}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
              A
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/60 rounded-tl-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-medium ml-1">Searching WorkHub knowledge...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar at Bottom (Matches Screen 3) */}
      <div className="p-3 md:p-4 border-t border-slate-100 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 text-xs md:text-sm text-slate-800 bg-transparent focus:outline-hidden"
          />

          <button
            type="button"
            onClick={() => alert('Attachments can be added from Knowledge Base files or PDF policies.')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-xl transition ${
              isRecording ? 'text-rose-600 bg-rose-100 animate-pulse' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
            title="Voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center ${
              inputValue.trim() && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
