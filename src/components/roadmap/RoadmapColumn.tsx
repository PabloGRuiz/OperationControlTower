"use client";

import React, { useState } from 'react';
import { Task } from '@/types/roadmap';
import RoadmapCard from './RoadmapCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RoadmapColumnProps {
  title: string;
  columnId: Task['columnId'];
  tasks: Task[];
  draggedTask: Task | null;
  isDraggingAnywhere: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: Task['columnId']) => void;
  onAddTask: () => void;
}

export default function RoadmapColumn({
  title,
  columnId,
  tasks,
  draggedTask,
  isDraggingAnywhere,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onAddTask
}: RoadmapColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const isCurrentOrigin = draggedTask?.columnId === columnId;
  const showDropPanel = isDraggingAnywhere && !isCurrentOrigin;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isOver false if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleInternalDrop = (e: React.DragEvent) => {
    setIsOver(false);
    onDrop(e, columnId);
  };

  return (
    <div
      className={`flex flex-col w-[350px] shrink-0 transition-colors duration-200 rounded-2xl p-2 ${
        isOver
          ? 'bg-blue-50/60 ring-2 ring-blue-400/50'
          : 'bg-slate-100/70'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => {
        onDragOver(e);
        if (!isOver) setIsOver(true);
      }}
      onDrop={handleInternalDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddTask}
          className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
          title="Añadir nueva tarea"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Column Content */}
      <div className="flex flex-col gap-3 min-h-[180px] p-1">
        {tasks.map((task) => (
          <RoadmapCard
            key={task.id}
            task={task}
            isBeingDragged={draggedTask?.id === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Dynamic Drop Panel with "+" when holding a card */}
        {showDropPanel && (
          <div
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
              isOver
                ? 'border-blue-500 bg-blue-100/70 scale-[1.01] shadow-md'
                : 'border-blue-300/80 bg-blue-50/40 hover:border-blue-400'
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
              <span className={`text-xs font-bold ${isOver ? 'text-blue-800 text-sm' : 'text-blue-600'}`}>
                {isOver ? `Soltar en ${title}` : `Mover a ${title}`}
              </span>
              {isOver && draggedTask && (
                <p className="text-[11px] text-blue-700/80 font-medium truncate max-w-[250px] mt-0.5">
                  "{draggedTask.title}"
                </p>
              )}
            </div>
          </div>
        )}

        {tasks.length === 0 && !showDropPanel && (
          <div className="flex flex-col items-center justify-center h-32 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200/80 rounded-xl bg-white/40">
            <span className="font-medium text-slate-500 text-xs">Sin tareas</span>
            <span className="text-[11px] text-slate-400 mt-1">Arrastra aquí o usa el botón +</span>
          </div>
        )}
      </div>
    </div>
  );
}
