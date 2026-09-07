"use client";

import React from 'react';
import { ProjectAttachment } from '@/types/roadmap';
import {
  formatFileSize,
  getFileCategory,
  downloadAttachment,
  openAttachmentInNewTab
} from '@/lib/attachmentUtils';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  File,
  Download,
  Eye,
  Trash2,
  Calendar,
  User as UserIcon
} from 'lucide-react';

interface AttachmentFileItemProps {
  key?: React.Key;
  attachment: ProjectAttachment;
  onDelete?: (attachmentId: string) => void;
  canDelete?: boolean;
  compact?: boolean;
}

export default function AttachmentFileItem({
  attachment,
  onDelete,
  canDelete = false,
  compact = false
}: AttachmentFileItemProps) {
  const category = getFileCategory(attachment.name, attachment.type);

  const getCategoryConfig = () => {
    switch (category) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          badge: 'PDF'
        };
      case 'excel':
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          badge: 'EXCEL'
        };
      case 'word':
        return {
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          badge: 'WORD'
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
          badge: 'IMAGEN'
        };
      case 'archive':
        return {
          icon: <Archive className="w-5 h-5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          badge: 'ZIP'
        };
      default:
        return {
          icon: <File className="w-5 h-5 text-slate-600" />,
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          badge: 'DOC'
        };
    }
  };

  const config = getCategoryConfig();
  const formattedDate = new Date(attachment.uploadedAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (compact) {
    return (
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs hover:bg-slate-100/70 transition-colors group">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-white shadow-2xs">
            {React.cloneElement(config.icon, { className: 'w-4 h-4' })}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800 truncate" title={attachment.name}>
              {attachment.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => openAttachmentInNewTab(attachment)}
            className="h-7 w-7 text-slate-500 hover:text-blue-600 rounded-lg"
            title="Visualizar archivo"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => downloadAttachment(attachment)}
            className="h-7 w-7 text-slate-500 hover:text-emerald-600 rounded-lg"
            title="Descargar archivo"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`¿Deseas eliminar el archivo adjunto "${attachment.name}"?`)) {
                  onDelete(attachment.id);
                }
              }}
              className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg"
              title="Eliminar archivo adjunto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all gap-3 group">
      {/* Lado Izquierdo: Icono + Detalles de Archivo */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.bg} shadow-2xs`}>
          {config.icon}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5
              className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md group-hover:text-blue-600 transition-colors"
              title={attachment.name}
            >
              {attachment.name}
            </h5>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${config.bg}`}>
              {config.badge}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
            <span>{formatFileSize(attachment.size)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <UserIcon className="w-3 h-3 text-slate-400" />
              {attachment.uploadedBy.name} ({attachment.uploadedBy.role})
            </span>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Acciones (Descargar, Ver, Eliminar) */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openAttachmentInNewTab(attachment)}
          className="h-8 px-2.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-blue-700 hover:border-blue-300 gap-1.5 shadow-2xs"
          title="Ver o previsualizar documento"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Ver</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => downloadAttachment(attachment)}
          className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-2xs"
          title="Descargar archivo en tu equipo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar</span>
        </Button>

        {canDelete && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm(`¿Deseas eliminar permanentemente el archivo "${attachment.name}"?`)) {
                onDelete(attachment.id);
              }
            }}
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg ml-1"
            title="Eliminar archivo adjunto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
