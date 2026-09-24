import React, { useState } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Download,
  Check,
  RefreshCw,
  Copy,
  Layers,
  Palette,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types/workhub';

interface ImageStudioViewProps {
  currentUser: User;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({ currentUser, onUpdateAvatar }) => {
  const [activeMode, setActiveMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Template suggestions for internal employee hub use
  const promptTemplates = [
    'A modern high-tech corporate illustration of software engineers collaborating on cloud microservices',
    'A sleek minimalist badge for Payment Platform Release 2.0 with geometric neon accents',
    'A warm friendly team celebration announcement graphic for company annual milestones',
    'A futuristic 3D avatar of a backend architect with glasses and glowing workspace',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setStatusMessage('Generating with gemini-3.1-flash-image-preview...');

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          referenceImage: activeMode === 'edit' ? referenceImage : null,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setStatusMessage(
          data.type === 'edit' ? 'Image edited successfully!' : 'Image created successfully!'
        );
      } else {
        setStatusMessage('Generation completed.');
      }
    } catch (err: any) {
      console.error('Image Studio error:', err);
      setStatusMessage('Error generating image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              WorkHub Asset Studio
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                gemini-3.1-flash-image-preview
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Create and edit custom graphics, team announcement banners, and avatars using text prompts.
            </p>
          </div>
        </div>

        {/* Mode Switcher: Create vs Edit */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto text-xs">
          <button
            onClick={() => {
              setActiveMode('create');
              setReferenceImage(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeMode === 'create'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Image
          </button>
          <button
            onClick={() => setActiveMode('edit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeMode === 'edit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Edit Existing Image
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          {/* If edit mode, file upload slot */}
          {activeMode === 'edit' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reference Image to Edit
              </label>
              {referenceImage ? (
                <div className="relative p-2 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={referenceImage}
                      alt="Ref"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-600 font-medium">Image uploaded for editing</span>
                  </div>
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="text-xs text-rose-600 font-bold hover:underline px-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">
                    Upload an image or team screenshot to modify
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {/* Text Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {activeMode === 'edit' ? 'Edit Instructions Prompt' : 'Text Prompt'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeMode === 'edit'
                  ? "e.g. 'Add a corporate celebration banner and make the color scheme indigo'"
                  : "e.g. 'A modern high-tech corporate illustration of engineers collaborating on payment APIs'"
              }
              className="w-full p-3 rounded-xl border border-slate-200 text-xs md:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1:1', '16:9', '4:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    aspectRatio === ratio
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Suggestion Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Template Ideas:
            </span>
            <div className="space-y-1.5">
              {promptTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(tmpl)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-[11px] text-slate-600 hover:text-blue-700 transition truncate block"
                >
                  "{tmpl}"
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading || (activeMode === 'edit' && !referenceImage)}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition ${
              prompt.trim() && !loading && (activeMode === 'create' || referenceImage)
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing with Gemini Image Model...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>{activeMode === 'edit' ? 'Apply Edit to Image' : 'Generate Image'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Canvas & Preview (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="font-bold text-sm text-slate-900">Output Preview</span>
              {statusMessage && (
                <span className="text-[11px] font-semibold text-blue-600">{statusMessage}</span>
              )}
            </div>

            <div className="w-full aspect-square max-h-96 rounded-2xl bg-slate-50 border border-slate-200/70 overflow-hidden flex items-center justify-center relative shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-700">Rendering visual with Gemini AI...</span>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Synthesizing prompt geometry and high-fidelity tokens
                  </p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-slate-600">No image generated yet</span>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Type a prompt on the left and click Generate to see the result.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar when image is available */}
          {generatedImage && (
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap gap-2">
              <a
                href={generatedImage}
                download="workhub-gemini-asset.png"
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </a>

              {onUpdateAvatar && (
                <button
                  onClick={() => {
                    onUpdateAvatar(generatedImage);
                    alert('Your profile avatar was updated with this image!');
                  }}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Set as Avatar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
