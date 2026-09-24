import React, { useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Share2, Sparkles } from 'lucide-react';
import { CompanyEvent } from '../../types/workhub';

interface MeetingRoomModalProps {
  meeting: CompanyEvent | null;
  onClose: () => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({ meeting, onClose }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  if (!meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 w-full max-w-4xl h-[75vh] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col text-white">
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-md uppercase">
              {meeting.type}
            </span>
            <h3 className="font-bold text-base text-white mt-1">{meeting.title}</h3>
            <p className="text-xs text-slate-400">{meeting.team} • {meeting.time}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Tiles Grid */}
        <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto bg-slate-950">
          {meeting.participants.map((p, idx) => (
            <div
              key={idx}
              className="bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold mb-3 shadow-lg">
                {p.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold text-xs text-slate-200">{p}</span>
              <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                <Mic className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}

          {/* Self Tile */}
          <div className="bg-slate-850 rounded-2xl border border-blue-500/50 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner ring-1 ring-blue-500/30">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold mb-3 text-blue-400 border border-slate-700">
              YOU
            </div>
            <span className="font-bold text-xs text-blue-300">You (Speaking)</span>
            <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
              {micOn ? (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Meeting Controls */}
        <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>00:14:28</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3 rounded-2xl transition ${
                micOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-600 text-white'
              }`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`p-3 rounded-2xl transition ${
                videoOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-600 text-white'
              }`}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Meeting link: ${meeting.meetingLink} copied!`)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
