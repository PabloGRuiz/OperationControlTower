"use client";

import React, { useState } from 'react';
import { Task, Priority, Department } from '@/types/roadmap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeColumnId: Task['columnId'] | null;
  onAddTask: (task: Omit<Task, 'id' | 'assignedTo'>) => void;
}

export default function NewTaskDialog({ isOpen, setIsOpen, activeColumnId, onAddTask }: NewTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !department || !priority || !activeColumnId) return;
    
    onAddTask({
      title,
      department: department as Department,
      priority: priority as Priority,
      columnId: activeColumnId
    });
    
    // Reset form
    setTitle('');
    setDepartment('');
    setPriority('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Nueva Tarea</DialogTitle>
          <p className="text-sm text-slate-500 font-medium">
            Completa los detalles para agregar la iniciativa al roadmap.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4.5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Título de la tarea o licitación</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ej: Renovación de servidores centrales" 
              className="text-base h-11 rounded-xl"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="department" className="text-sm font-semibold text-slate-700">Departamento responsable</Label>
            <Select value={department} onValueChange={(v) => setDepartment(v as Department)} required>
              <SelectTrigger className="text-base h-11 rounded-xl">
                <SelectValue placeholder="Selecciona departamento" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Sistemas" className="text-base py-2.5">Sistemas</SelectItem>
                <SelectItem value="Licitaciones" className="text-base py-2.5">Licitaciones</SelectItem>
                <SelectItem value="Operaciones" className="text-base py-2.5">Operaciones</SelectItem>
                <SelectItem value="Legal" className="text-base py-2.5">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">Nivel de Prioridad</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)} required>
              <SelectTrigger className="text-base h-11 rounded-xl">
                <SelectValue placeholder="Selecciona prioridad" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="HIGH" className="text-base py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-rose-700">Alta</span>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM" className="text-base py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-amber-700">Media</span>
                  </div>
                </SelectItem>
                <SelectItem value="LOW" className="text-base py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-emerald-700">Baja</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-10 text-sm font-semibold rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" className="h-10 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
              Crear Tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
