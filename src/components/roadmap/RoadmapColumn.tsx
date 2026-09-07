"use client";

import React, { useState } from 'react';
import { Project, Stage } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import RoadmapCard from './RoadmapCard';
import { Button } from '@/components/ui/button';
import { Plus, Layers, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface RoadmapColumnProps {
  stage: Stage;
  projects: Project[];
  draggedProject: Project | null;
  isDraggingAnywhere: boolean;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropToStage: (projectId: string, stageId: string) => void;
  onNewProjectInStage: (stageId: string) => void;
  onOpenDetail: (project: Project) => void;
  onOpenDerivation: (project: Project) => void;
  onOpenUrgency: (project: Project) => void;
}

export default function RoadmapColumn({
  stage,
  projects,
  draggedProject,
  isDraggingAnywhere,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropToStage,
  onNewProjectInStage,
  onOpenDetail,
  onOpenDerivation,
  onOpenUrgency
}: RoadmapColumnProps) {
  const { currentUser, stages, moveStage, deleteStage } = useProjectControlTower();
  const [isOver, setIsOver] = useState(false);

  // Can this user drag/drop or create projects?
  const canDerive = Boolean(currentUser && currentUser.role !== 'USUARIO');
  const canCreate = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'ADMINISTRADOR';

  const isFirst = stages.length > 0 && stages[0].id === stage.id;
  const isLast = stages.length > 0 && stages[stages.length - 1].id === stage.id;

  const handleMoveLeft = () => moveStage(stage.id, 'left');
  const handleMoveRight = () => moveStage(stage.id, 'right');
  const handleDeleteStage = () => {
    if (projects.length > 0) {
      alert(`No puedes eliminar la etapa "${stage.title}" porque tiene ${projects.length} proyecto(s) activo(s). Derívalos antes de borrarla.`);
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar la etapa "${stage.title}"?`)) {
      const res = deleteStage(stage.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const isCurrentOrigin = draggedProject?.stageId === stage.id;
  const showDropPanel = isDraggingAnywhere && !isCurrentOrigin && canDerive;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (canDerive) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const projectId = e.dataTransfer.getData('text/plain') || draggedProject?.id;
    if (projectId && canDerive) {
      if (draggedProject?.status === 'PENDIENTE_APROBACION') {
        alert('Este proyecto está pendiente de aprobación. Debe ser aprobado antes de poder moverse a otra etapa.');
        return;
      }
      onDropToStage(projectId, stage.id);
    }
  };

  return (
    <div
      className={`flex flex-col w-[350px] sm:w-[380px] xl:w-[410px] h-full max-h-full shrink-0 transition-colors duration-200 rounded-2xl p-2.5 sm:p-3 ${
        isOver
          ? 'bg-blue-50/70 ring-2 ring-blue-500/60'
          : 'bg-slate-100/70 border border-slate-200/50'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => {
        onDragOver(e);
        if (!isOver && canDerive) setIsOver(true);
      }}
      onDrop={handleDrop}
    >
      {/* Cabecera de la Etapa */}
      <div className="px-2 pt-0.5 pb-2 mb-1 border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-900 tracking-tight">
              {stage.title}
            </h3>
            <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200">
              {projects.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <div className="flex items-center gap-0.5 mr-0.5 bg-slate-200/70 p-0.5 rounded-lg">
                <button
                  onClick={handleMoveLeft}
                  disabled={isFirst}
                  title="Mover columna a la izquierda"
                  className="p-1 rounded text-slate-600 hover:text-slate-950 hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleMoveRight}
                  disabled={isLast}
                  title="Mover columna a la derecha"
                  className="p-1 rounded text-slate-600 hover:text-slate-950 hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteStage}
                  title={projects.length > 0 ? `Etapa con ${projects.length} proyecto(s)` : "Eliminar etapa vacía"}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {canCreate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNewProjectInStage(stage.id)}
                className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
                title="Aperturar nuevo proyecto en esta etapa"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
          {stage.description}
        </p>
      </div>

      {/* Lista de Tarjetas de Proyecto: se expande y scrollea de forma limpia sin desbordar */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-1 overflow-y-auto pr-1.5 pb-2">
        {projects.map((project) => (
          <RoadmapCard
            key={project.id}
            project={project}
            isBeingDragged={draggedProject?.id === project.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpenDetail={onOpenDetail}
            onOpenDerivation={onOpenDerivation}
            onOpenUrgency={onOpenUrgency}
          />
        ))}

        {/* Panel Interactivo con signo + al arrastrar para Derivar */}
        {showDropPanel && (
          <div
            className={`shrink-0 border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 mt-1 ${
              isOver
                ? 'border-blue-500 bg-blue-100/80 scale-[1.01] shadow-md'
                : 'border-blue-300 bg-blue-50/40 hover:border-blue-400'
            }`}
          >
            <div
              className={`rounded-full flex items-center justify-center transition-all ${
                isOver
                  ? 'w-9 h-9 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'w-7 h-7 bg-blue-500/20 text-blue-600'
              }`}
            >
              <Plus className={`${isOver ? 'w-5 h-5 stroke-[2.5]' : 'w-3.5 h-3.5'}`} />
            </div>
            <div className="text-center">
              <span className={`text-xs font-bold ${isOver ? 'text-blue-900' : 'text-blue-600'}`}>
                {isOver ? `Derivar expediente a ${stage.title}` : `Pase a ${stage.title}`}
              </span>
              {isOver && draggedProject && (
                <p className="text-[11px] text-blue-800 font-medium truncate max-w-[240px] mt-0.5">
                  "{draggedProject.title}"
                </p>
              )}
            </div>
          </div>
        )}

        {projects.length === 0 && !showDropPanel && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[140px] text-center text-slate-400 border-2 border-dashed border-slate-200/80 rounded-xl bg-white/40 p-4">
            <Layers className="w-6 h-6 text-slate-300 mb-1" />
            <span className="font-semibold text-slate-600 text-xs">Sin expedientes</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {canDerive ? 'Arrastra un proyecto aquí para derivarlo' : 'No hay proyectos en esta etapa'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
