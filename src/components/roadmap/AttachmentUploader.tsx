"use client";

import React, { useRef, useState } from 'react';
import {
  fileToDataUrl,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENT_SIZE_LABEL
} from '@/lib/attachmentUtils';
import { Paperclip, UploadCloud, AlertCircle } from 'lucide-react';

export interface StagedAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface AttachmentUploaderProps {
  onFilesSelected: (files: StagedAttachment[]) => void;
  isProcessing?: boolean;
  multiple?: boolean;
  label?: string;
}

export default function AttachmentUploader({
  onFilesSelected,
  isProcessing = false,
  multiple = true,
  label = "Arrastra documentos aquí o haz clic para examinar"
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage('');

    const filesToProcess = Array.from(fileList);
    const validStaged: StagedAttachment[] = [];
    const oversizedFiles: string[] = [];

    for (const file of filesToProcess) {
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        oversizedFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        validStaged.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl
        });
      } catch (err) {
        console.error('Error al procesar archivo:', err);
      }
    }

    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `Los siguientes archivos superan el límite de ${MAX_ATTACHMENT_SIZE_LABEL} por archivo: ${oversizedFiles.join(', ')}`
      );
    }

    if (validStaged.length > 0) {
      onFilesSelected(validStaged);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/30 scale-[1.005]'
            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-300'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.zip,.rar,.txt"
        />

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
            isDragOver
              ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/25'
              : 'bg-white text-blue-600 border border-slate-200/80 shadow-2xs'
          }`}
        >
          {isDragOver ? <UploadCloud className="w-5 h-5 animate-bounce" /> : <Paperclip className="w-5 h-5" />}
        </div>

        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {isDragOver ? 'Suelta los archivos aquí' : label}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Formatos admitidos: PDF, Word, Excel, Planillas, Imágenes y ZIP (Hasta {MAX_ATTACHMENT_SIZE_LABEL} c/u)
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
