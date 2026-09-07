"use client";

import React, { useState } from 'react';
import { UrgencyLevel } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PlusCircle, Building2, Flame, Clock, Paperclip, X, FileText } from 'lucide-react';
import AttachmentUploader, { StagedAttachment } from './AttachmentUploader';
import { formatFileSize, getFileCategory } from '@/lib/attachmentUtils';

interface NewProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  defaultDepartmentId?: string;
}

export default function NewProjectDialog({
  isOpen,
  setIsOpen,
  defaultDepartmentId
}: NewProjectDialogProps) {
  const { departments, currentUser, createProject } = useProjectControlTower();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('ALTA');
  const [targetDepartmentId, setTargetDepartmentId] = useState(
    defaultDepartmentId || currentUser?.departmentId || ''
  );
  const [observation, setObservation] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);

  const handleRemoveStaged = (indexToRemove: number) => {
    setStagedAttachments((prev: StagedAttachment[]) => prev.filter((_, idx: number) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDepartmentId) return;

    createProject({
      title: title.trim(),
      description: description.trim(),
      urgency,
      targetDepartmentId,
      initialObservation: observation.trim(),
      attachments: stagedAttachments
    });

    setTitle('');
    setDescription('');
    setObservation('');
    setStagedAttachments([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <PlusCircle className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Apertura de Nuevo Proyecto
            </DialogTitle>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Se generará un código de expediente oficial y se iniciará el registro de auditoría.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Título del Proyecto / Licitación *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Licitación de Equipamiento Diagnóstico por Imágenes"
              className="text-sm h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Descripción y Alcance
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve reseña del objetivo, justificación de compra o impacto institucional..."
              className="min-h-[70px] text-sm resize-none rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Nivel de Urgencia</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                <SelectTrigger className="text-sm h-11 rounded-xl">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="BAJA" className="text-sm py-2">Baja (Plazos estándar)</SelectItem>
                  <SelectItem value="MEDIA" className="text-sm py-2">Media (Regular)</SelectItem>
                  <SelectItem value="ALTA" className="text-sm py-2">Alta (Prioritario)</SelectItem>
                  <SelectItem value="URGENTE" className="text-sm py-2 font-bold text-red-600">
                    URGENTE (Crítico)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Área Responsable Inicial *</Label>
              <Select value={targetDepartmentId} onValueChange={(v) => v && setTargetDepartmentId(v)} required>
                <SelectTrigger className="text-sm h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-sm py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Observación Inicial de Apertura
            </Label>
            <Textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Indicaciones preliminares o antecedentes del expediente..."
              className="min-h-[70px] text-sm resize-none rounded-xl"
            />
          </div>

          {/* SECCIÓN DE ARCHIVOS ADJUNTOS INICIALES */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Documentación y Archivos Adjuntos (Opcional)
              </Label>
              {stagedAttachments.length > 0 && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {stagedAttachments.length} archivo(s)
                </span>
              )}
            </div>

            <AttachmentUploader
              onFilesSelected={(newFiles: StagedAttachment[]) =>
                setStagedAttachments((prev: StagedAttachment[]) => [...prev, ...newFiles])
              }
              label="Adjuntar pliegos, dictámenes, memorándums o imágenes..."
            />

            {stagedAttachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {stagedAttachments.map((file: StagedAttachment, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60 font-bold">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Quitar archivo antes de crear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentUser?.role === 'USUARIO' && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de Aprobación:</strong> Como Usuario, el proyecto se registrará con estado <em>Pendiente de Aprobación</em> y requerirá la validación de un Encargado o Director antes de poder ser derivado o movido entre etapas.
              </span>
            </div>
          )}

          {departments.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
              No hay departamentos dados de alta. El Administrador debe crear las áreas operativas en la pestaña Administración antes de aperturar expedientes.
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-xs font-semibold h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={departments.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 shadow-sm disabled:opacity-50"
            >
              Aperturar Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
