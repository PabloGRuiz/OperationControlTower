"use client";

import React, { useState } from 'react';
import { Project, Stage } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import RoadmapCard from './RoadmapCard';
import { Button } from '@/components/ui/button';
import { Plus, Layers, Info } from 'lucide-react';

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
  const { currentUser } = useProjectControlTower();
  const [isOver, setIsOver] = useState(false);

  // Can this user drag/drop or create projects?
  const canDerive = Boolean(currentUser && currentUser.role !== 'USUARIO');
  const canCreate = Boolean(currentUser && currentUser.role !== 'USUARIO');

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
      onDropToStage(projectId, stage.id);
    }
  };

  return (
    <div
      className={`flex flex-col w-[360px] shrink-0 transition-colors duration-200 rounded-2xl p-2.5 ${
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
      <div className="px-2 pt-1 pb-2 mb-1 border-b border-slate-200/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">
              {stage.title}
            </h3>
            <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200">
              {projects.length}
            </span>
          </div>

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
        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
          {stage.description}
        </p>
      </div>

      {/* Lista de Tarjetas de Proyecto */}
      <div className="flex flex-col gap-3 min-h-[220px] p-1 overflow-y-auto max-h-[calc(100vh-230px)]">
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
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              isOver
                ? 'border-blue-500 bg-blue-100/80 scale-[1.01] shadow-md'
                : 'border-blue-300 bg-blue-50/40 hover:border-blue-400'
            }`}
          >
            <div
              className={`rounded-full flex items-center justify-center transition-all ${
                isOver
                  ? 'w-10 h-10 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'w-8 h-8 bg-blue-500/20 text-blue-600'
              }`}
            >
              <Plus className={`${isOver ? 'w-6 h-6 stroke-[2.5]' : 'w-4 h-4'}`} />
            </div>
            <div className="text-center">
              <span className={`text-xs font-bold ${isOver ? 'text-blue-900 text-sm' : 'text-blue-600'}`}>
                {isOver ? `Derivar expediente a ${stage.title}` : `Pase a ${stage.title}`}
              </span>
              {isOver && draggedProject && (
                <p className="text-[11px] text-blue-800 font-medium truncate max-w-[260px] mt-0.5">
                  "{draggedProject.title}"
                </p>
              )}
            </div>
          </div>
        )}

        {projects.length === 0 && !showDropPanel && (
          <div className="flex flex-col items-center justify-center h-36 text-center text-slate-400 border-2 border-dashed border-slate-200/80 rounded-xl bg-white/40 p-4">
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
