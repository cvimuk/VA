import React, { useState } from 'react';
import { Copy, Check, Video, Film, Camera } from 'lucide-react';

interface Props {
  title: string;
  promptText: string;
  icon: React.ReactNode;
  step: string;
}

export const PromptResult: React.FC<Props> = ({ title, promptText, icon, step }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-gray-500 text-xs uppercase tracking-wider">{step}</p>
        </div>
      </div>

      <div className="relative group">
        <div className="w-full h-48 bg-gray-950 rounded-lg border border-gray-800 p-4 text-gray-300 text-sm font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap shadow-inner">
          {promptText}
        </div>
        
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-md border border-gray-700 shadow-lg transition-all"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
