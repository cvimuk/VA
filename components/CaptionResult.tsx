import React, { useState } from 'react';
import { Copy, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  caption: string;
  index: number;
}

export const CaptionResult: React.FC<Props> = ({ caption, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = caption.length;
  const isLengthGood = charCount <= 100;

  return (
    <div 
      className={`
        flex items-center justify-between p-4 rounded-lg border transition-all duration-300 group
        ${isLengthGood 
          ? 'bg-green-900/10 border-green-500/30 hover:border-green-500/50' 
          : 'bg-gray-900 border-gray-800 hover:border-amber-500/50'
        }
      `}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className={`
          w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full font-bold text-sm
          ${isLengthGood ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}
        `}>
          #{index + 1}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-gray-200 text-sm font-medium leading-relaxed">{caption}</p>
          
          <div className="flex items-center gap-2">
            <div className={`
              inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border
              ${isLengthGood 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }
            `}>
              {isLengthGood ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
              {charCount} Chars
            </div>
            {isLengthGood && <span className="text-[10px] text-green-500/70">Viral Ready</span>}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCopy}
        className={`
          ml-4 p-2 rounded-md transition-all self-center
          ${isLengthGood ? 'text-green-400/50 hover:text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
        `}
        title="Copy Caption"
      >
        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
      </button>
    </div>
  );
};