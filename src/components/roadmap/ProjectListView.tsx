"use client";

import React from 'react';
import { Project, Stage } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import { getProjectUserRelationship } from '@/lib/projectPermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Layers,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  CheckSquare,
  ShieldCheck,
  Sliders,
  ArrowRight,
  FolderPlus,
  Calendar,
  UserCheck,
  Paperclip
} from 'lucide-react';

interface ProjectListViewProps {
  projects: Project[];
  stages: Stage[];
  onOpenDetail: (project: Project) => void;
  onOpenDerivation: (project: Project) => void;
  onOpenUrgency: (project: Project) => void;
}

const urgencyConfig = {
  BAJA: { label: 'Baja', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  MEDIA: { label: 'Media', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  ALTA: { label: 'Alta', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  URGENTE: { label: 'Urgente', color: 'bg-red-600 text-white border-red-600', dot: 'bg-white' }
};

export default function ProjectListView({
  projects,
  stages,
  onOpenDetail,
  onOpenDerivation,
  onOpenUrgency
}: ProjectListViewProps) {
  const { currentUser, departments, approveProject, markAsCompleted, markAsControlled } =
    useProjectControlTower();

  const isSupervisor = Boolean(
    currentUser &&
      (currentUser.role === 'ENCARGADO' ||
        currentUser.role === 'DIRECTOR' ||
        currentUser.role === 'ADMINISTRADOR')
  );

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-8 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Sin expedientes visibles</h3>
        <p className="text-xs text-slate-500 mt-1">
          No hay proyectos que correspondan a tu área o a tus filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-28">Expediente</th>
                <th className="py-3.5 px-4 min-w-[280px]">Título y Descripción Completa</th>
                <th className="py-3.5 px-4 min-w-[170px]">Etapa Actual</th>
                <th className="py-3.5 px-4 min-w-[150px]">Área Asignada</th>
                <th className="py-3.5 px-4 w-28 text-center">Prioridad</th>
                <th className="py-3.5 px-4 min-w-[160px]">Estado de Flujo</th>
                <th className="py-3.5 px-4 min-w-[140px]">Trazabilidad</th>
                <th className="py-3.5 px-4 min-w-[130px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => {
                const stage = stages.find((s) => s.id === project.stageId);
                const currentDept = departments.find((d) => d.id === project.currentDepartmentId);
                const urgency = urgencyConfig[project.urgency];
                const relationship = getProjectUserRelationship(project, currentUser);
                const isUserDept = Boolean(
                  currentUser?.departmentId && project.currentDepartmentId === currentUser.departmentId
                );
                const isPendingApproval = project.status === 'PENDIENTE_APROBACION';

                return (
                  <tr
                    key={project.id}
                    onClick={() => onOpenDetail(project)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    {/* Código y Fecha */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                        {project.code}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(project.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>
                      {project.attachments && project.attachments.length > 0 && (
                        <div className="mt-1.5">
                          <span
                            title={`${project.attachments.length} archivo(s) adjunto(s)`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded"
                          >
                            <Paperclip className="w-2.5 h-2.5 text-slate-500" />
                            {project.attachments.length} adjunto(s)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Título y Descripción Completa */}
                    <td className="py-4 px-4 align-top">
                      <h4 className="text-[14px] font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                        {project.description}
                      </p>
                      {project.lastObservation && (
                        <div className="mt-2 p-2 bg-slate-50 border-l-2 border-blue-500 rounded-r-lg text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] block">
                            Última indicación:
                          </span>
                          <span className="italic">"{project.lastObservation}"</span>
                        </div>
                      )}
                    </td>

                    {/* Etapa Actual */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{stage?.title || 'Sin etapa'}</span>
                      </div>
                    </td>

                    {/* Área Asignada */}
                    <td className="py-4 px-4 align-top">
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2.5 py-0.5 font-semibold rounded-md border ${currentDept?.color || 'bg-slate-100 text-slate-700'}`}
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        {currentDept?.name || 'No asignada'}
                      </Badge>
                    </td>

                    {/* Prioridad */}
                    <td className="py-4 px-4 align-top text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                        {urgency.label}
                      </span>
                    </td>

                    {/* Estado del Flujo */}
                    <td className="py-4 px-4 align-top">
                      {project.status === 'PENDIENTE_APROBACION' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Pendiente de Aprobación
                        </span>
                      )}
                      {project.status === 'EN_PROCESO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          En Proceso
                        </span>
                      )}
                      {project.status === 'COMPLETADO_POR_USUARIO' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md animate-pulse">
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
                    </td>

                    {/* Trazabilidad / Relación con el Usuario */}
                    <td className="py-4 px-4 align-top">
                      {relationship === 'ASSIGNED_CURRENT' && currentUser?.departmentId && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          En tu área
                        </span>
                      )}
                      {relationship === 'DERIVED_PREVIOUSLY' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          <ArrowRight className="w-3 h-3 text-indigo-600" />
                          Derivado (Seguimiento)
                        </span>
                      )}
                      {relationship === 'CREATED_BY_USER' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                          <FolderPlus className="w-3 h-3 text-sky-600" />
                          Iniciado por ti
                        </span>
                      )}
                    </td>

                    {/* Botones de Acción */}
                    <td
                      className="py-4 px-4 align-top text-right space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenDetail(project)}
                          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 gap-1 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Detalle
                        </Button>

                        {isPendingApproval && isSupervisor && (
                          <Button
                            size="sm"
                            onClick={() => approveProject(project.id)}
                            className="h-7 px-2.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 gap-1 rounded-lg shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Aprobar
                          </Button>
                        )}

                        {currentUser?.role === 'USUARIO' && isUserDept && project.status === 'EN_PROCESO' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsCompleted(project.id)}
                            className="h-7 px-2.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300 gap-1 rounded-lg"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Completar
                          </Button>
                        )}

                        {(currentUser?.role === 'ADMINISTRADOR' || (currentUser?.role === 'ENCARGADO' && isUserDept)) &&
                          project.status === 'COMPLETADO_POR_USUARIO' && (
                            <Button
                              size="sm"
                              onClick={() => markAsControlled(project.id)}
                              className="h-7 px-2.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 gap-1 rounded-lg shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Controlar
                            </Button>
                          )}

                        {(currentUser?.role === 'ADMINISTRADOR' || (currentUser?.role === 'ENCARGADO' && isUserDept)) &&
                          !isPendingApproval && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onOpenDerivation(project)}
                              className="h-7 px-2.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 gap-1 rounded-lg"
                            >
                              <Send className="w-3 h-3" />
                              Derivar
                            </Button>
                          )}

                        {(currentUser?.role === 'DIRECTOR' || currentUser?.role === 'ADMINISTRADOR') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenUrgency(project)}
                            className="h-7 px-2 text-[11px] font-bold text-slate-700 hover:text-slate-900 border-slate-200 gap-1 rounded-lg"
                          >
                            <Sliders className="w-3 h-3" />
                            Urgencia
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
