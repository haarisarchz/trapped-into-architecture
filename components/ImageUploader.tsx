"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

export default function ImageUploader({ value, onChange, bucket = "job-images", label = "Upload Image" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      let ext = ".png";
      if (file.name) {
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        if (extMatch) ext = extMatch[0].toLowerCase();
      }
      const fileName = `img-${Date.now()}${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(publicUrl);
    } catch (err: any) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
            handleUpload(file);
            break;
          }
        }
      }
    }
  }, []);

  return (
    <div 
      className="w-full focus:outline-none focus:ring-2 focus:ring-black rounded-2xl transition-shadow" 
      tabIndex={0} 
      onPaste={onPaste}
    >
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white">
          <img src={value} alt="Uploaded" className="w-full h-auto max-h-64 object-contain p-2" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition"
            >
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <label 
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-black cursor-pointer transition-all min-h-[160px] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-blue-600">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Plus size={24} className="text-gray-400" />
              </div>
              <span className="text-sm font-bold text-gray-700">{label}</span>
              <span className="text-xs text-gray-400 mt-1">Drag & drop, click, or paste image here</span>
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={onFileChange} 
          />
        </label>
      )}
    </div>
  );
}