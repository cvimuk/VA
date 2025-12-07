import React, { useState } from 'react';
import { Copy, Check, Hash } from 'lucide-react';

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
    <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors group">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 font-bold text-sm">
          #{index + 1}
        </div>
        <div className="flex-1">
          <p className="text-gray-200 text-sm font-medium">{caption}</p>
          <p className={`text-[10px] mt-1 ${isLengthGood ? 'text-green-500' : 'text-amber-500'}`}>
            {charCount} chars {isLengthGood ? '' : '(Review length)'}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleCopy}
        className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all"
        title="Copy Caption"
      >
        {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
      </button>
    </div>
  );
};