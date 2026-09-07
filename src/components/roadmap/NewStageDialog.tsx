"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layers, Plus } from 'lucide-react';

interface NewStageDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function NewStageDialog({ isOpen, setIsOpen }: NewStageDialogProps) {
  const { stages, addStage } = useProjectControlTower();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const nextOrderNumber = stages.length + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El nombre o título de la columna/etapa es obligatorio.');
      return;
    }

    const result = addStage(title.trim(), description.trim());
    if (!result.success) {
      setError(result.error || 'Error al agregar la etapa.');
      return;
    }

    setTitle('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-white shadow-2xl border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Agregar Nueva Etapa / Columna
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium">
                Se añadirá como la columna orden #{nextOrderNumber} en el flujo del proceso.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {error && (
            <div className="p-3 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="stage-title" className="text-xs font-bold text-slate-700">
              Título de la Etapa / Columna <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="stage-title"
              placeholder={`Ej: ${nextOrderNumber}. Control y Certificación Final`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm h-10 rounded-xl"
              autoFocus
            />
            <p className="text-[11px] text-slate-400">
              Puedes incluir la numeración en el título para mantener coherencia en el flujo.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stage-description" className="text-xs font-bold text-slate-700">
              Descripción del Objetivo (Opcional)
            </Label>
            <Textarea
              id="stage-description"
              placeholder="Describe las tareas, revisiones o pases que se ejecutan en esta etapa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs rounded-xl min-h-[85px] resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold h-10 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-10 px-4 rounded-xl gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Crear Etapa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
