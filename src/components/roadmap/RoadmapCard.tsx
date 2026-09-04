"use client";

import React from 'react';
import { Project, UserRole } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
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
  Sliders
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
  const { currentUser, departments, markAsCompleted, markAsControlled } = useProjectControlTower();

  const currentDept = departments.find((d) => d.id === project.currentDepartmentId);
  const urgency = urgencyConfig[project.urgency];

  // Permisos según Rol:
  // - Usuario: NO puede arrastrar/derivar
  // - Encargado, Director, Administrador: SI pueden arrastrar/derivar
  const canDrag = Boolean(currentUser && currentUser.role !== 'USUARIO');
  const isUserDept = Boolean(currentUser && currentUser.departmentId === project.currentDepartmentId);

  return (
    <Card
      className={`group relative bg-white border border-slate-200/80 rounded-2xl transition-all duration-200 select-none overflow-hidden ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        isBeingDragged
          ? 'opacity-30 scale-[0.98] border-2 border-dashed border-blue-500 shadow-none'
          : 'shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
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
        className={`h-1.5 w-full ${
          project.urgency === 'URGENTE'
            ? 'bg-red-600 animate-pulse'
            : project.urgency === 'ALTA'
            ? 'bg-rose-500'
            : project.urgency === 'MEDIA'
            ? 'bg-amber-400'
            : 'bg-emerald-500'
        }`}
      />

      <CardContent className="p-4 space-y-3">
        {/* Cabecera de la tarjeta: Código, Urgencia y Grip */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              {project.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {canDrag && (
              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            )}
          </div>
        </div>

        {/* Título y descripción */}
        <div>
          <h4 className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
            {project.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Estado del flujo de control */}
        <div className="flex items-center justify-between text-xs pt-1">
          <Badge
            variant="secondary"
            className={`text-xs px-2.5 py-0.5 font-semibold rounded-md border ${currentDept?.color}`}
          >
            <Building2 className="w-3 h-3 mr-1" />
            {currentDept?.name || 'Área no asignada'}
          </Badge>

          {project.status === 'COMPLETADO_POR_USUARIO' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md animate-pulse">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Completado
            </span>
          )}

          {project.status === 'CONTROLADO' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Controlado
            </span>
          )}
        </div>

        {/* Última Observación de Pase */}
        {project.lastObservation && (
          <div className="bg-slate-50/90 border-l-2 border-blue-500 rounded-r-lg p-2 text-[11px] text-slate-600 font-sans leading-relaxed">
            <span className="font-semibold text-slate-800 block text-[10px] uppercase tracking-wider">
              Última indicación:
            </span>
            <span className="italic line-clamp-2">"{project.lastObservation}"</span>
          </div>
        )}

        {/* Barra de Acciones Rápidas Contextuales según Rol */}
        <div
          className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5"
          onClick={(e) => e.stopPropagation()} // Prevenir abrir el detalle al presionar un botón
        >
          {/* Botón Ver Detalle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDetail(project)}
            className="h-7 px-2 text-[11px] text-slate-500 hover:text-slate-800 gap-1 rounded-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            Historial ({project.history.length})
          </Button>

          <div className="flex items-center gap-1">
            {/* ACCIÓN ROL: USUARIO - Marcar como completado */}
            {currentUser?.role === 'USUARIO' && project.status === 'EN_PROCESO' && (
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

            {/* ACCIÓN ROL: ENCARGADO / ADMIN - Controlar */}
            {(currentUser?.role === 'ENCARGADO' || currentUser?.role === 'ADMINISTRADOR') &&
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

            {/* ACCIÓN ROL: ENCARGADO / ADMIN - Derivar */}
            {(currentUser?.role === 'ENCARGADO' || currentUser?.role === 'ADMINISTRADOR') && (
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
      </CardContent>
    </Card>
  );
}
