import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface Props {
  imageData: UploadedImage | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  index: number;
  label: string;
  description: string;
}

export const ImageUploadCard: React.FC<Props> = ({ imageData, onUpload, onRemove, index, label, description }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-amber-500 font-bold uppercase text-xs tracking-wider">Step 0{index + 1}</span>
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      
      <div 
        onClick={!imageData ? triggerUpload : undefined}
        className={`
          relative group w-full aspect-[16/9] rounded-lg border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
          ${imageData 
            ? 'border-amber-500/50 bg-gray-900' 
            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {imageData ? (
          <>
            <img 
              src={imageData.previewUrl} 
              alt={label} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <p className="text-white text-sm font-medium truncate">{imageData.file.name}</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3">
            <div className="p-4 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
              <Upload size={24} />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-medium text-gray-300">Upload Image</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
