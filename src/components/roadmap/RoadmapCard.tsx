"use client";

import React from 'react';
import { Project, UserRole } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import { getProjectUserRelationship } from '@/lib/projectPermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Flame,
  GripVertical,
  CheckSquare,
  AlertCircle,
  Eye,
  Sliders,
  ShieldCheck,
  ArrowRight,
  FolderPlus,
  Calendar,
  User as UserIcon,
  Paperclip
} from 'lucide-react';

interface RoadmapCardProps {
  project: Project;
  isBeingDragged?: boolean;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragEnd?: () => void;
  onOpenDetail: (project: Project) => void;
  onOpenDerivation: (project: Project) => void;
  onOpenUrgency: (project: Project) => void;
}

const urgencyConfig = {
  BAJA: { label: 'Baja', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  MEDIA: { label: 'Media', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  ALTA: { label: 'Alta', color: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  URGENTE: { label: 'Urgente', color: 'bg-red-600 text-white border-red-600', dot: 'bg-white animate-ping' }
};

export default function RoadmapCard({
  project,
  isBeingDragged = false,
  onDragStart,
  onDragEnd,
  onOpenDetail,
  onOpenDerivation,
  onOpenUrgency
}: RoadmapCardProps) {
  const { currentUser, departments, markAsCompleted, markAsControlled, approveProject } =
    useProjectControlTower();

  const currentDept = departments.find((d) => d.id === project.currentDepartmentId);
  const urgency = urgencyConfig[project.urgency];

  const isPendingApproval = project.status === 'PENDIENTE_APROBACION';
  const isSupervisor = Boolean(
    currentUser &&
      (currentUser.role === 'ENCARGADO' ||
        currentUser.role === 'DIRECTOR' ||
        currentUser.role === 'ADMINISTRADOR')
  );

  const userRelationship = getProjectUserRelationship(project, currentUser);
  const isCurrentlyInUserDept = Boolean(
    currentUser?.departmentId && project.currentDepartmentId === currentUser.departmentId
  );

  // Permisos de arrastre según Rol y Área:
  const canDrag = Boolean(
    currentUser &&
      currentUser.role !== 'USUARIO' &&
      !isPendingApproval &&
      (currentUser.role === 'ADMINISTRADOR' || currentUser.role === 'DIRECTOR' || isCurrentlyInUserDept)
  );

  const isUserDept = isCurrentlyInUserDept;

  return (
    <div
      className={`group relative bg-white border border-slate-200/90 rounded-2xl transition-all duration-200 select-none shadow-xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 flex flex-col overflow-hidden shrink-0 ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isBeingDragged
          ? 'opacity-30 scale-[0.98] border-2 border-dashed border-blue-500 shadow-none'
          : ''
      }`}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        onDragStart(e, project.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpenDetail(project)}
    >
      {/* Barra de Urgencia Superior */}
      <div
        className={`h-1.5 w-full shrink-0 ${
          project.urgency === 'URGENTE'
            ? 'bg-red-600 animate-pulse'
            : project.urgency === 'ALTA'
            ? 'bg-rose-500'
            : project.urgency === 'MEDIA'
            ? 'bg-amber-400'
            : 'bg-emerald-500'
        }`}
      />

      <div className="p-3 sm:p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        {/* Parte Superior: Encabezado + Título + Descripción Completa */}
        <div className="space-y-2">
          {/* Cabecera: Código, Prioridad y Grip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                {project.code}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${urgency.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                Prioridad {urgency.label}
              </span>
              {project.attachments && project.attachments.length > 0 && (
                <span
                  title={`${project.attachments.length} documento(s) adjunto(s)`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 px-2 py-0.5 rounded-md transition-colors"
                >
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  {project.attachments.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {canDrag && (
                <div title="Arrastrar expediente a otra columna">
                  <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              )}
            </div>
          </div>

          {/* Título Completo sin recortes */}
          <div>
            <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-snug tracking-tight group-hover:text-blue-600 transition-colors break-words">
              {project.title}
            </h4>
          </div>

          {/* Descripción Completa sin recortes */}
          {project.description && (
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2 sm:p-2.5 rounded-xl border border-slate-100 break-words">
              {project.description}
            </p>
          )}

          {/* Última Observación de Pase Completa (si existe) */}
          {project.lastObservation && (
            <div className="bg-blue-50/60 border-l-4 border-blue-500 rounded-r-xl p-2 sm:p-2.5 text-xs text-slate-700 leading-relaxed break-words">
              <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider mb-0.5">
                Última indicación de pase:
              </span>
              <p className="italic">"{project.lastObservation}"</p>
            </div>
          )}
        </div>

        {/* Parte Inferior: Metadatos estructurados y Barra de Acciones */}
        <div className="pt-2 space-y-2.5 border-t border-slate-100 mt-2">
          {/* Fila de Badges: Departamento y Competencia */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className={`text-xs px-2.5 py-0.5 font-semibold rounded-md border ${currentDept?.color || 'bg-slate-100 text-slate-700'}`}
            >
              <Building2 className="w-3 h-3 mr-1" />
              {currentDept?.name || 'Área no asignada'}
            </Badge>

            {/* Badges de Trazabilidad y Competencia */}
            {userRelationship === 'ASSIGNED_CURRENT' && currentUser?.departmentId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                En tu área
              </span>
            )}

            {userRelationship === 'DERIVED_PREVIOUSLY' && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md"
                title="Expediente derivado previamente por tu área; visible para tu seguimiento"
              >
                <ArrowRight className="w-3 h-3 text-indigo-600" />
                Derivado (Seguimiento)
              </span>
            )}

            {userRelationship === 'CREATED_BY_USER' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                <FolderPlus className="w-3 h-3 text-sky-600" />
                Iniciado por ti
              </span>
            )}
          </div>

          {/* Fila de Estado y Fecha */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
            <div>
              {project.status === 'PENDIENTE_APROBACION' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-amber-700" />
                  Pendiente de Aprobación
                </span>
              )}

              {project.status === 'EN_PROCESO' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  En Proceso Operativo
                </span>
              )}

              {project.status === 'COMPLETADO_POR_USUARIO' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md animate-pulse">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Completado (Requiere Control)
                </span>
              )}

              {project.status === 'CONTROLADO' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Controlado y Validado
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <Calendar className="w-3 h-3" />
              <span>{new Date(project.createdAt).toLocaleDateString('es-AR')}</span>
            </div>
          </div>

          {/* Barra de Acciones Rápidas Contextuales según Rol */}
          <div
            className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()} // Prevenir abrir el detalle al presionar un botón
          >
            {/* Botón Ver Detalle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetail(project)}
              className="h-7 px-2.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 border-slate-200 gap-1 rounded-lg"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Historial ({project.history.length})
            </Button>

            <div className="flex items-center gap-1 flex-wrap">
              {/* ACCIÓN: APROBAR PROYECTO (Encargado, Director o Admin) */}
              {isPendingApproval && isSupervisor && (
                <Button
                  size="sm"
                  onClick={() => approveProject(project.id)}
                  className="h-7 px-2.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 gap-1 rounded-lg shadow-2xs"
                  title="Aprobar este proyecto para permitir su movimiento y derivación"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Aprobar
                </Button>
              )}

              {/* Mensaje si es usuario común y está pendiente de aprobación */}
              {isPendingApproval && !isSupervisor && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Aguardando aprobación
                </span>
              )}

              {/* ACCIÓN ROL: USUARIO - Marcar como completado (solo si está en su área) */}
              {currentUser?.role === 'USUARIO' && isUserDept && project.status === 'EN_PROCESO' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsCompleted(project.id)}
                  className="h-7 px-2.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300 gap-1 rounded-lg"
                  title="Notificar a tu Encargado que finalizaste la tarea"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Marcar Completada
                </Button>
              )}

              {/* ACCIÓN ROL: ENCARGADO / ADMIN - Controlar (solo si está en su área o si es Admin) */}
              {(currentUser?.role === 'ADMINISTRADOR' || (currentUser?.role === 'ENCARGADO' && isUserDept)) &&
                project.status === 'COMPLETADO_POR_USUARIO' && (
                  <Button
                    size="sm"
                    onClick={() => markAsControlled(project.id)}
                    className="h-7 px-2.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 gap-1 rounded-lg shadow-2xs"
                    title="Validar el trabajo del usuario y marcar como controlado"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Controlar
                  </Button>
                )}

              {/* ACCIÓN ROL: ENCARGADO / ADMIN - Derivar (solo si está en su área o si es Admin) */}
              {(currentUser?.role === 'ADMINISTRADOR' || (currentUser?.role === 'ENCARGADO' && isUserDept)) &&
                !isPendingApproval && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenDerivation(project)}
                    className="h-7 px-2.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 gap-1 rounded-lg"
                    title="Derivar a otra etapa/departamento con observación"
                  >
                    <Send className="w-3 h-3" />
                    Derivar
                  </Button>
                )}

              {/* ACCIÓN ROL: DIRECTOR - Cambiar Urgencia */}
              {(currentUser?.role === 'DIRECTOR' || currentUser?.role === 'ADMINISTRADOR') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenUrgency(project)}
                  className="h-7 px-2 text-[11px] font-bold text-slate-700 hover:text-slate-900 border-slate-200 gap-1 rounded-lg"
                  title="Modificar prioridad del proyecto y notificar"
                >
                  <Sliders className="w-3 h-3" />
                  Urgencia
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
