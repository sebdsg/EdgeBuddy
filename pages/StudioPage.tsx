
import React, { useState, useRef } from 'react';
import { generateProImage, editImage, analyzeImage, generateVideoWithVeo } from '../services/geminiService';

const StudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'animate' | 'analyze'>('generate');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [ratio, setRatio] = useState('16:9');
  const [result, setResult] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Processing...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleKeyFlow = async () => {
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const resetOutputs = () => {
    setResult(null);
    setVideoResult(null);
    setAnalysisText(null);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setLoadingMsg('Nano Banana Pro is generating your image...');
    try {
      await handleKeyFlow();
      resetOutputs();
      const img = await generateProImage(prompt, size, ratio);
      setResult(img);
    } catch (e: any) {
      if (e.message === 'API_KEY_ERROR') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt) return;
    setLoading(true);
    setLoadingMsg('Applying AI edits with Flash...');
    resetOutputs();
    const edited = await editImage(sourceImage, prompt);
    setResult(edited);
    setLoading(false);
  };

  const handleAnimate = async () => {
    if (!sourceImage) return;
    setLoading(true);
    setLoadingMsg('Veo is animating your photo (approx 1-2 mins)...');
    resetOutputs();
    const video = await generateVideoWithVeo(sourceImage, prompt, ratio === '9:16' ? '9:16' : '16:9');
    setVideoResult(video);
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!sourceImage) return;
    setLoading(true);
    setLoadingMsg('Pro vision model analyzing screenshot...');
    resetOutputs();
    const analysis = await analyzeImage(sourceImage);
    setAnalysisText(analysis);
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

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-white">
      <div className="bg-gradient-to-br from-green-800 to-zinc-900 dark:from-blue-900 dark:to-zinc-950 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-[var(--border-color)]/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <h2 className="text-2xl font-black uppercase tracking-tight relative z-10">AI Sports Studio</h2>
        <p className="text-[10px] opacity-70 font-black mt-1 tracking-widest uppercase relative z-10">Multimodal Creative Suite</p>
      </div>

      <div className="flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto scrollbar-hide">
        {(['generate', 'edit', 'animate', 'analyze'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); resetOutputs(); }}
            className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-green-600 dark:bg-blue-600 text-white shadow-md' : 'text-white opacity-40 hover:opacity-100'
            }`}
          >
            {tab === 'generate' ? 'Create' : tab === 'edit' ? 'Edit' : tab === 'animate' ? 'Animate' : 'Analyze'}
          </button>
        ))}
      </div>

      <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-sm space-y-4">
        {activeTab !== 'generate' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-black/40 border-2 border-dashed border-[var(--border-color)]/30 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden relative group"
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest">Upload Reference</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest px-1">
            {activeTab === 'analyze' ? 'Instructions' : 'Prompt'}
          </label>
          <textarea 
            placeholder={
              activeTab === 'generate' ? "A 4K cinematic close-up of a soccer ball in a neon rainy stadium..." : 
              activeTab === 'animate' ? "Make the players in the image perform a victory celebration..." :
              "Describe the change or question..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-black/40 p-4 rounded-2xl text-sm border border-[var(--border-color)]/30 focus:ring-2 focus:ring-green-500 dark:focus:ring-blue-500 outline-none h-24 theme-transition uppercase font-bold text-white placeholder:opacity-20"
          />
        </div>

        <button 
          onClick={() => {
            if (activeTab === 'generate') handleGenerate();
            if (activeTab === 'edit') handleEdit();
            if (activeTab === 'animate') handleAnimate();
            if (activeTab === 'analyze') handleAnalyze();
          }}
          disabled={loading || (activeTab !== 'generate' && !sourceImage)}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
            loading ? 'bg-zinc-800 text-white/30 cursor-wait' : 'bg-green-600 dark:bg-blue-600 text-white hover:opacity-90'
          }`}
        >
          {loading ? loadingMsg : `${activeTab.toUpperCase()} RESULT`}
        </button>
      </div>

      {(result || videoResult || analysisText) && (
        <div className="space-y-4 animate-slideUp">
          <div className="bg-[var(--card-bg)] p-4 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl">
             {result && <img src={result} className="w-full rounded-[1.5rem]" />}
             {videoResult && (
               <video src={videoResult} className="w-full rounded-[1.5rem]" controls autoPlay loop />
             )}
             {analysisText && (
               <div className="p-4 bg-black/40 rounded-2xl text-sm leading-relaxed text-white opacity-80">
                  <h4 className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase mb-2 tracking-widest">AI Expert Analysis</h4>
                  {analysisText}
               </div>
             )}
             
             {(result || videoResult) && (
               <div className="flex justify-between items-center p-3">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Studio Output</span>
                 <a 
                   href={result || videoResult || '#'} 
                   download="pickpal-studio" 
                   className="text-green-500 dark:text-blue-500 text-[10px] font-black uppercase border-b-2 border-green-900 dark:border-blue-900 tracking-widest"
                 >
                   Save to Device
                 </a>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioPage;
