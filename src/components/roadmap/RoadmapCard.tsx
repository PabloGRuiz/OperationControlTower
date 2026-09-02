"use client";

import React from 'react';
import { Task } from '@/types/roadmap';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoadmapCardProps {
  task: Task;
  isBeingDragged?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: () => void;
}

const priorityColors: Record<Task['priority'], string> = {
  HIGH: 'bg-rose-500 shadow-sm shadow-rose-200',
  MEDIUM: 'bg-amber-400 shadow-sm shadow-amber-100',
  LOW: 'bg-emerald-500 shadow-sm shadow-emerald-100'
};

const priorityLabels: Record<Task['priority'], string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja'
};

const departmentColors: Record<Task['department'], string> = {
  Sistemas: 'bg-blue-50 text-blue-700 border border-blue-200/60 font-medium',
  Licitaciones: 'bg-purple-50 text-purple-700 border border-purple-200/60 font-medium',
  Operaciones: 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium',
  Legal: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium'
};

export default function RoadmapCard({
  task,
  isBeingDragged = false,
  onDragStart,
  onDragEnd
}: RoadmapCardProps) {
  return (
    <Card 
      className={`group cursor-grab active:cursor-grabbing bg-white border border-slate-200/80 rounded-xl transition-all duration-200 select-none ${
        isBeingDragged
          ? 'opacity-30 scale-[0.98] border-2 border-dashed border-blue-500 shadow-none'
          : 'shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Priority Indicator Pill & Drag Handle */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-14 rounded-full transition-all ${priorityColors[task.priority]}`}
              title={`Prioridad ${priorityLabels[task.priority]}`}
            />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {priorityLabels[task.priority]}
            </span>
          </div>
          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
        
        {/* Title - Larger and more legible */}
        <div className="flex items-start gap-2.5 mb-4">
          {task.columnId === 'done' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <h4 className="text-[16px] font-bold text-slate-900 leading-snug tracking-tight">
            {task.title}
          </h4>
        </div>
        
        {/* Footer with avatar, name and department */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 border border-slate-200 shadow-2xs ring-2 ring-white">
              <AvatarImage src={task.assignedTo.avatarUrl} alt={task.assignedTo.name} />
              <AvatarFallback className="text-[11px] font-bold bg-slate-100 text-slate-700">
                {task.assignedTo.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
              {task.assignedTo.name}
            </span>
          </div>
          
          <Badge
            variant="secondary"
            className={`text-xs px-2.5 py-0.5 rounded-md ${departmentColors[task.department]}`}
          >
            {task.department}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
