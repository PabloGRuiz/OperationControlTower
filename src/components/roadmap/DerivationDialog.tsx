"use client";

import React, { useState, useEffect } from 'react';
import { Project, Stage } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowRight, Send, ShieldAlert, Building2, Layers } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DerivationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: Project | null;
  targetStageId: string | null;
}

export default function DerivationDialog({
  isOpen,
  setIsOpen,
  project,
  targetStageId
}: DerivationDialogProps) {
  const { departments, stages, currentUser, deriveProject } = useProjectControlTower();

  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [observation, setObservation] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (project) {
      // Default to passed targetStageId or next stage
      setSelectedStageId(targetStageId || project.stageId);
      setSelectedDepartmentId(project.currentDepartmentId);
      setObservation('');
      setError('');
    }
  }, [project, targetStageId]);

  if (!project) return null;

  const currentStage = stages.find((s) => s.id === project.stageId);
  const destinationStage = stages.find((s) => s.id === selectedStageId);
  const currentDept = departments.find((d) => d.id === project.currentDepartmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) {
      setError('La observación con indicaciones de pase es obligatoria para la trazabilidad.');
      return;
    }
    if (!selectedDepartmentId) {
      setError('Debe seleccionar el departamento responsable de destino.');
      return;
    }

    deriveProject(project.id, selectedStageId, selectedDepartmentId, observation.trim());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[580px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-mono">
              {project.code}
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Derivación y Pase de Expediente
            </DialogTitle>
          </div>
          <p className="text-sm text-slate-500 font-medium line-clamp-1">
            {project.title}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Pase de Etapas Visual */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-sm">
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Etapa Origen
              </span>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                {currentStage?.title}
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-blue-500 shrink-0" />

            <div className="flex-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Etapa Destino
              </span>
              <Select value={selectedStageId} onValueChange={(v) => v && setSelectedStageId(v)}>
                <SelectTrigger className="h-8 text-xs sm:text-sm font-semibold mt-0.5 bg-white">
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id} className="text-xs sm:text-sm">
                      {stage.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Departamento de Destino */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              Departamento Responsable Destino *
            </Label>
            <Select value={selectedDepartmentId} onValueChange={(v) => v && setSelectedDepartmentId(v)}>
              <SelectTrigger className="text-sm h-10 rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Seleccionar departamento que recibe..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id} className="text-sm py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${dept.color}`}>
                        {dept.code}
                      </span>
                      <span>{dept.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              Se notificará a todos los miembros de este departamento al confirmar.
            </p>
          </div>

          {/* Observación / Indicaciones */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Observación e Indicaciones de Pase *</span>
              <span className="text-[11px] font-normal text-slate-400">Registro inmutable de auditoría</span>
            </Label>
            <Textarea
              value={observation}
              onChange={(e) => {
                setObservation(e.target.value);
                if (error) setError('');
              }}
              placeholder="Escribe aquí las directivas, detalles de plazos, partidas a afectar o instrucciones para el área que recibe..."
              className="min-h-[100px] text-sm resize-none rounded-xl"
              required
            />
            {error && (
              <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Sello de Auditoría */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-white shadow-2xs">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-xs font-bold bg-blue-200 text-blue-800">
                {currentUser.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{currentUser.name}</span>{' '}
              <span className="text-blue-700 font-medium">({currentUser.role})</span> registrará
              este movimiento con firma y fecha/hora automática.
            </div>
          </div>

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
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              Confirmar y Derivar Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
