"use client";

import React, { useState } from 'react';
import { Project } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Building2,
  AlertCircle,
  CheckCircle2,
  Layers,
  History,
  ArrowRight,
  ShieldCheck,
  Flame,
  FileText,
  Paperclip,
  Plus,
  FolderOpen
} from 'lucide-react';
import AttachmentFileItem from './AttachmentFileItem';
import AttachmentUploader from './AttachmentUploader';

interface ProjectDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: Project | null;
}

const urgencyConfig = {
  BAJA: { label: 'Baja', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEDIA: { label: 'Media', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ALTA: { label: 'Alta', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  URGENTE: { label: 'Urgente', color: 'bg-red-600 text-white border-red-600 animate-pulse' }
};

const statusConfig = {
  PENDIENTE_APROBACION: { label: 'Pendiente de Aprobación', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  EN_PROCESO: { label: 'En Proceso Operativo', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETADO_POR_USUARIO: { label: 'Completado (Requiere Control)', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  CONTROLADO: { label: 'Controlado y Validado', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
};

const actionTypeLabels: Record<string, string> = {
  CREACION: 'Apertura de Expediente',
  APROBACION: 'Aprobación de Expediente',
  DERIVACION: 'Pase y Derivación',
  COMPLETADO: 'Finalización de Tarea',
  CONTROLADO: 'Control y Validación',
  CAMBIO_URGENCIA: 'Ajuste de Prioridad',
  ADJUNTO: 'Documentación Adjunta'
};

export default function ProjectDetailDialog({
  isOpen,
  setIsOpen,
  project
}: ProjectDetailDialogProps) {
  const {
    departments,
    stages,
    currentUser,
    approveProject,
    addAttachmentToProject,
    deleteAttachmentFromProject
  } = useProjectControlTower();

  const [isUploadingOpen, setIsUploadingOpen] = useState(false);

  if (!project) return null;

  const isSupervisor = Boolean(currentUser && ['ADMINISTRADOR', 'DIRECTOR', 'ENCARGADO'].includes(currentUser.role));
  const isPendingApproval = project.status === 'PENDIENTE_APROBACION';

  const currentStage = stages.find((s) => s.id === project.stageId);
  const currentDept = departments.find((d) => d.id === project.currentDepartmentId);
  const attachments = project.attachments || [];

  const handleFilesAdded = (files: Array<{ name: string; size: number; type: string; dataUrl: string }>) => {
    for (const file of files) {
      addAttachmentToProject(project.id, file);
    }
    setIsUploadingOpen(false);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    deleteAttachmentFromProject(project.id, attachmentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {project.code}
              </span>
              <Badge
                variant="outline"
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${urgencyConfig[project.urgency].color}`}
              >
                <Flame className="w-3 h-3 mr-1" />
                Urgencia {urgencyConfig[project.urgency].label}
              </Badge>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${statusConfig[project.status].color}`}
            >
              {statusConfig[project.status].label}
            </Badge>
          </div>

          <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {project.title}
          </DialogTitle>
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            {project.description}
          </p>
        </DialogHeader>

        {/* Metadatos Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
          <div>
            <span className="text-slate-400 font-semibold block uppercase tracking-wider mb-1">
              Etapa Actual
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              {currentStage?.title}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase tracking-wider mb-1">
              Departamento Asignado
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className={`text-xs px-2 py-0.5 rounded ${currentDept?.color}`}>
                {currentDept?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Banner de Aprobación Pendiente */}
        {isPendingApproval && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-950">
                  Expediente Pendiente de Aprobación
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {isSupervisor
                    ? 'Este proyecto fue generado por un usuario y requiere su aprobación para permitir derivaciones entre áreas y etapas.'
                    : 'Este proyecto requiere la validación y aprobación de un Encargado o Director antes de poder ser derivado o movido de etapa.'}
                </p>
              </div>
            </div>
            {isSupervisor && (
              <Button
                size="sm"
                onClick={() => approveProject(project.id, 'Aprobado formalmente para inicio de operaciones')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg px-3 py-1.5 h-auto flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar Proyecto
              </Button>
            )}
          </div>
        )}

        {/* Documentación y Archivos Adjuntos Oficiales */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Documentación y Archivos Adjuntos ({attachments.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pliegos de bases, dictámenes, informes técnicos y anexos del expediente.
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant={isUploadingOpen ? "secondary" : "outline"}
              onClick={() => setIsUploadingOpen(!isUploadingOpen)}
              className="text-xs font-semibold h-8 rounded-lg gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              {isUploadingOpen ? (
                <>Cancelar</>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Adjuntar Archivo
                </>
              )}
            </Button>
          </div>

          {/* Uploader interactivo desplegable */}
          {isUploadingOpen && (
            <div className="mb-3.5 p-3 rounded-2xl bg-blue-50/40 border border-blue-200/80">
              <AttachmentUploader
                onFilesSelected={handleFilesAdded}
                label="Selecciona o arrastra documentos para adjuntar al expediente"
              />
            </div>
          )}

          {/* Listado de archivos adjuntos */}
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((att) => {
                const canDelete = Boolean(
                  currentUser &&
                    (att.uploadedBy.id === currentUser.id ||
                      ['ADMINISTRADOR', 'DIRECTOR', 'ENCARGADO'].includes(currentUser.role))
                );

                return (
                  <AttachmentFileItem
                    key={att.id}
                    attachment={att}
                    canDelete={canDelete}
                    onDelete={handleDeleteAttachment}
                  />
                );
              })}
            </div>
          ) : (
            !isUploadingOpen && (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs bg-slate-50/40 flex flex-col items-center justify-center gap-1">
                <FolderOpen className="w-6 h-6 text-slate-300" />
                <span className="font-semibold text-slate-600">Sin documentos adjuntos</span>
                <span className="text-[11px] text-slate-400">
                  Presiona "Adjuntar Archivo" para incorporar pliegos, resoluciones o informes al expediente.
                </span>
              </div>
            )
          )}
        </div>

        {/* Historial y Trazabilidad Inmutable */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Historial de Derivaciones y Trazabilidad Activa ({project.history.length})
            </h4>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Control Riguroso
            </span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {project.history.map((item, idx) => {
              const fromStageTitle = stages.find((s) => s.id === item.fromStageId)?.title;
              const toStageTitle = stages.find((s) => s.id === item.toStageId)?.title;
              const fromDept = departments.find((d) => d.id === item.fromDepartmentId);
              const toDept = departments.find((d) => d.id === item.toDepartmentId);

              const formattedDate = new Date(item.timestamp).toLocaleString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={item.id || idx} className="relative flex items-start gap-4 pl-8 group">
                  {/* Punto en timeline */}
                  <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white shadow-xs" />

                  <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs group-hover:border-slate-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-slate-200">
                          <AvatarImage src={item.performedBy.avatarUrl} alt={item.performedBy.name} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {item.performedBy.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-900">
                          {item.performedBy.name}
                        </span>
                        <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                          {item.performedBy.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </div>
                    </div>

                    {/* Resumen de Aprobación */}
                    {item.actionType === 'APROBACION' && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 mb-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Expediente aprobado para derivación y circulación operativa</span>
                      </div>
                    )}

                    {/* Resumen del movimiento */}
                    {item.actionType === 'DERIVACION' && (
                      <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600 mb-2 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                        <span>Pase a</span>
                        <strong className="text-slate-800">{toStageTitle}</strong>
                        <span className="text-slate-400">|</span>
                        <span>Área:</span>
                        <strong className="text-slate-800">{toDept?.name}</strong>
                      </div>
                    )}

                    {/* Observación obligatoria registrada */}
                    <div className="bg-amber-50/50 border-l-2 border-amber-400 p-2.5 rounded-r-lg text-xs text-slate-700 leading-relaxed font-sans">
                      <span className="font-semibold text-amber-900 block text-[11px] uppercase tracking-wider mb-0.5">
                        Observación registrada:
                      </span>
                      "{item.observation}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
