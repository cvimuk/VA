import React, { useState, useEffect } from 'react';
import { UploadedImage, GeneratedPrompts, AppState } from './types';
import { ImageUploadCard } from './components/ImageUploadCard';
import { PromptResult } from './components/PromptResult';
import { CaptionResult } from './components/CaptionResult';
import { generateVeoPrompts } from './services/geminiService';
import { Clapperboard, Sparkles, Wand2, Film, Hammer, Camera, MessageSquareQuote, Key } from 'lucide-react';

const INITIAL_IMAGES: (UploadedImage | null)[] = [null, null, null];
const DESCRIPTIONS = [
  "Start State (Empty)",
  "Middle State (In Progress)",
  "End State (Finished)"
];
const DETAILED_DESC = [
  "Upload the empty room or initial site photo.",
  "Upload the photo of the work in progress.",
  "Upload the final, fully decorated photo."
];
const API_KEY_STORAGE_KEY = 'veo_architect_api_key';

function App() {
  const [images, setImages] = useState<(UploadedImage | null)[]>(INITIAL_IMAGES);
  const [context, setContext] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  });
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<GeneratedPrompts | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persist API Key to LocalStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }, [apiKey]);

  const handleUpload = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage: UploadedImage = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: e.target?.result as string,
        label: DESCRIPTIONS[index],
        description: DETAILED_DESC[index]
      };
      
      const newImages = [...images];
      newImages[index] = newImage;
      setImages(newImages);
      // Reset results if user changes images
      if (results) {
        setResults(null);
        setStatus(AppState.IDLE);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    setResults(null);
    setStatus(AppState.IDLE);
  };

  const handleGenerate = async () => {
    if (images.some(img => img === null)) {
      setErrorMsg("Please upload all 3 reference images first.");
      return;
    }
    
    setStatus(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const validImages = images as UploadedImage[]; // Type assertion safe due to check above
      const prompts = await generateVeoPrompts(validImages, context, apiKey);
      setResults(prompts);
      setStatus(AppState.SUCCESS);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate prompts. Please check your API Key and try again.");
      setStatus(AppState.ERROR);
    }
  };

  const canGenerate = images.every(img => img !== null) && status !== AppState.ANALYZING;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-amber-500 p-2 rounded-lg text-black">
              <Clapperboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Veo Architect <span className="text-amber-500 text-sm font-normal ml-2">Timelapse Toolkit</span></h1>
              <p className="text-xs text-gray-500">Google Veo 3.1 Prompt Engineer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto bg-gray-900 p-1.5 rounded-lg border border-gray-800 focus-within:border-amber-500/50 transition-colors">
            <div className="p-1 text-gray-500">
              <Key size={16} />
            </div>
            <input 
              type="password"
              placeholder="Paste Gemini API Key (Optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none w-full md:w-64"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        
        {/* Section 1: Inputs */}
        <section className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-amber-500" size={20} />
            <h2 className="text-xl font-semibold">1. Source Materials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <ImageUploadCard
                key={idx}
                index={idx}
                imageData={img}
                label={DESCRIPTIONS[idx]}
                description={DETAILED_DESC[idx]}
                onUpload={(file) => handleUpload(file, idx)}
                onRemove={() => handleRemove(idx)}
              />
            ))}
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Context & Theme (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add details here to refine your prompts (e.g., 'Modern Scandinavian renovation', 'Workers wearing orange vests', 'Warm sunset lighting')..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 transition-colors h-24 resize-none"
            />
          </div>

          <div className="flex justify-end">
             {errorMsg && (
              <div className="mr-4 text-red-400 text-sm flex items-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                {errorMsg}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg
                ${canGenerate 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
              `}
            >
              {status === AppState.ANALYZING ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                  Analyzing Vision...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate Veo Prompts
                </>
              )}
            </button>
          </div>
        </section>

        {/* Section 2: Results */}
        {results && (
          <section className="space-y-12 animate-fade-in-up border-t border-gray-800 pt-10">
            {/* Prompts */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="text-amber-500" size={20} />
                  <h2 className="text-xl font-semibold">2. Generated Prompts</h2>
                </div>
                <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                  Ready for Google Flow
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PromptResult 
                  title="The Construction"
                  step="Step 1 → 2"
                  promptText={results.prompt1}
                  icon={<Hammer size={24} />}
                />
                <PromptResult 
                  title="The Finish Line"
                  step="Step 2 → 3"
                  promptText={results.prompt2}
                  icon={<Sparkles size={24} />}
                />
                <PromptResult 
                  title="Cinematic Walkthrough/Orbit"
                  step="Step 3 → Motion"
                  promptText={results.prompt3}
                  icon={<Camera size={24} />}
                />
              </div>
            </div>

            {/* Captions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="text-amber-500" size={20} />
                <h2 className="text-xl font-semibold">3. Social Media Titles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.captions.map((caption, idx) => (
                  <CaptionResult key={idx} caption={caption} index={idx} />
                ))}
              </div>
            </div>

          </section>
        )}
      </main>
    </div>
  );
}

export default App;