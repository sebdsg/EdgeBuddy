
import React, { useState, useRef } from 'react';
import { generateProImage, editImage } from '../services/geminiService';

const StudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [ratio, setRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyFlow = async () => {
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      await handleKeyFlow();
      const img = await generateProImage(prompt, size, ratio);
      setResult(img);
    } catch (e) {
      if (e.message === 'API_KEY_ERROR') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt) return;
    setLoading(true);
    const edited = await editImage(sourceImage, prompt);
    setResult(edited);
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-black uppercase tracking-tight">AI Studio</h2>
        <p className="text-xs opacity-80 font-bold mt-1">NANO BANANA POWERED TOOLS</p>
      </div>

      <div className="flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--border-color)]">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'generate' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}
        >
          Generate HQ
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'edit' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}
        >
          Edit Image
        </button>
      </div>

      <div className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4">
        {activeTab === 'edit' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative"
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2">
                <div className="text-3xl">📸</div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Source Image</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            {activeTab === 'generate' ? 'Detailed Prompt' : 'Describe the Edit'}
          </label>
          <textarea 
            placeholder={activeTab === 'generate' ? "A futuristic basketball stadium in neon purple..." : "Add a vintage retro filter and cinematic lighting..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-sm border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none h-24"
          />
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Quality</label>
              <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl text-xs border border-gray-100 dark:border-gray-800 outline-none">
                <option value="1K">1K Standard</option>
                <option value="2K">2K High Def</option>
                <option value="4K">4K Cinematic</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ratio</label>
              <select value={ratio} onChange={(e) => setRatio(e.target.value as any)} className="w-full bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl text-xs border border-gray-100 dark:border-gray-800 outline-none">
                <option value="16:9">16:9 Wide</option>
                <option value="1:1">1:1 Square</option>
                <option value="9:16">9:16 Portrait</option>
              </select>
            </div>
          </div>
        )}

        <button 
          onClick={activeTab === 'generate' ? handleGenerate : handleEdit}
          disabled={loading || !prompt || (activeTab === 'edit' && !sourceImage)}
          className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all ${
            loading ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {loading ? 'Processing with Nano Banana Pro...' : (activeTab === 'generate' ? 'Generate Image' : 'Apply AI Edit')}
        </button>
      </div>

      {result && (
        <div className="space-y-3 animate-slideUp">
          <div className="bg-[var(--card-bg)] p-3 rounded-3xl border border-[var(--border-color)] shadow-xl">
             <img src={result} className="w-full rounded-2xl" />
             <div className="flex justify-between items-center p-3">
               <span className="text-[10px] font-bold text-gray-400 uppercase">Generated Visual</span>
               <a href={result} download="edgebuddy-studio.png" className="text-blue-500 text-xs font-bold">Download ↓</a>
             </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-400 hover:underline">
          Billing & API Info
        </a>
      </div>
    </div>
  );
};

export default StudioPage;
