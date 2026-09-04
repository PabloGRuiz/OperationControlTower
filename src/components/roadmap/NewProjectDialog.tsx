"use client";

import React, { useState } from 'react';
import { UrgencyLevel } from '@/types/roadmap';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PlusCircle, Building2, Flame } from 'lucide-react';

interface NewProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  defaultDepartmentId?: string;
}

export default function NewProjectDialog({
  isOpen,
  setIsOpen,
  defaultDepartmentId
}: NewProjectDialogProps) {
  const { departments, currentUser, createProject } = useProjectControlTower();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('ALTA');
  const [targetDepartmentId, setTargetDepartmentId] = useState(
    defaultDepartmentId || currentUser?.departmentId || ''
  );
  const [observation, setObservation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDepartmentId) return;

    createProject({
      title: title.trim(),
      description: description.trim(),
      urgency,
      targetDepartmentId,
      initialObservation: observation.trim()
    });

    setTitle('');
    setDescription('');
    setObservation('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <PlusCircle className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Apertura de Nuevo Proyecto
            </DialogTitle>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Se generará un código de expediente oficial y se iniciará el registro de auditoría.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Título del Proyecto / Licitación *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Licitación de Equipamiento Diagnóstico por Imágenes"
              className="text-sm h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Descripción y Alcance
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve reseña del objetivo, justificación de compra o impacto institucional..."
              className="min-h-[70px] text-sm resize-none rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Nivel de Urgencia</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                <SelectTrigger className="text-sm h-11 rounded-xl">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="BAJA" className="text-sm py-2">Baja (Plazos estándar)</SelectItem>
                  <SelectItem value="MEDIA" className="text-sm py-2">Media (Regular)</SelectItem>
                  <SelectItem value="ALTA" className="text-sm py-2">Alta (Prioritario)</SelectItem>
                  <SelectItem value="URGENTE" className="text-sm py-2 font-bold text-red-600">
                    URGENTE (Crítico)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Área Responsable Inicial *</Label>
              <Select value={targetDepartmentId} onValueChange={(v) => v && setTargetDepartmentId(v)} required>
                <SelectTrigger className="text-sm h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-sm py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{dept.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Observación Inicial de Apertura
            </Label>
            <Textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Indicaciones preliminares o antecedentes del expediente..."
              className="min-h-[70px] text-sm resize-none rounded-xl"
            />
          </div>

          {departments.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
              No hay departamentos dados de alta. El Administrador debe crear las áreas operativas en la pestaña Administración antes de aperturar expedientes.
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-xs font-semibold h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={departments.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 shadow-sm disabled:opacity-50"
            >
              Aperturar Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
