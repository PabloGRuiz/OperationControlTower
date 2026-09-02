"use client";

import React, { useState } from 'react';
import { Task, initialTasks } from '@/types/roadmap';
import RoadmapColumn from './RoadmapColumn';
import NewTaskDialog from './NewTaskDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Filter, Share2, Sparkles } from 'lucide-react';

const columns = [
  { id: 'month-1', title: 'Noviembre' },
  { id: 'month-2', title: 'Diciembre' },
  { id: 'month-3', title: 'Enero' },
  { id: 'done', title: 'Completadas' }
] as const;

export default function RoadmapBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<Task['columnId'] | null>(null);

  const draggedTask = tasks.find((t) => t.id === draggedTaskId) || null;

  // Handle drag and drop logic
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: Task['columnId']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, columnId } : t))
      );
    }
    setDraggedTaskId(null);
  };

  const openNewTaskDialog = (columnId: Task['columnId']) => {
    setActiveColumnId(columnId);
    setIsDialogOpen(true);
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'assignedTo'>) => {
    const task: Task = {
      ...newTask,
      id: `t${Date.now()}`,
      assignedTo: {
        name: 'Usuario Actual',
        avatarUrl: 'https://i.pravatar.cc/150?u=current',
      },
    };
    setTasks((prev) => [...prev, task]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased select-none">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 shrink-0 gap-4 shadow-2xs">
        <div className="flex items-center gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Product Roadmap
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-blue-600" /> Asana View
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Planificación mensual y seguimiento de entregables estratégicos
            </p>
          </div>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200/60">
            <button className="bg-white text-slate-900 px-4 py-1.5 rounded-lg shadow-2xs transition-all">
              Tablero
            </button>
            <button className="hover:text-slate-900 px-4 py-1.5 rounded-lg transition-colors">
              Lista
            </button>
            <button className="hover:text-slate-900 px-4 py-1.5 rounded-lg transition-colors">
              Cronograma
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Equipo:
            </span>
            <div className="flex -space-x-2">
              <Avatar className="border-2 border-white w-9 h-9 shadow-2xs">
                <AvatarImage src="https://i.pravatar.cc/150?u=ana" alt="Ana" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white w-9 h-9 shadow-2xs">
                <AvatarImage src="https://i.pravatar.cc/150?u=carlos" alt="Carlos" />
                <AvatarFallback>CG</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white w-9 h-9 shadow-2xs">
                <AvatarImage src="https://i.pravatar.cc/150?u=laura" alt="Laura" />
                <AvatarFallback>LP</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-white w-9 h-9 shadow-2xs">
                <AvatarImage src="https://i.pravatar.cc/150?u=jorge" alt="Jorge" />
                <AvatarFallback>JR</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <Button variant="outline" size="sm" className="font-semibold text-slate-700 gap-1.5 shadow-2xs rounded-lg">
            <Share2 className="w-4 h-4 text-slate-500" />
            Compartir
          </Button>
        </div>
      </header>

      {/* Interactive Helper Banner when dragging */}
      {draggedTask && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Moviendo: <strong className="underline underline-offset-2">{draggedTask.title}</strong></span>
          </div>
          <span className="text-blue-100 hidden sm:inline">
            Suelta la tarjeta en el panel con el signo <strong>+</strong> de la columna de destino
          </span>
        </div>
      )}

      {/* Board Container with horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex flex-row gap-6 p-6 sm:p-8 min-h-full items-start w-max">
          {columns.map((col) => (
            <RoadmapColumn
              key={col.id}
              title={col.title}
              columnId={col.id}
              tasks={tasks.filter((t) => t.columnId === col.id)}
              draggedTask={draggedTask}
              isDraggingAnywhere={Boolean(draggedTaskId)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAddTask={() => openNewTaskDialog(col.id)}
            />
          ))}
        </div>
      </div>

      <NewTaskDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        activeColumnId={activeColumnId}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
