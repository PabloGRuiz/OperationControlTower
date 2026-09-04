"use client";

import React, { useState } from 'react';
import { Project, UrgencyLevel } from '@/types/roadmap';
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
import { Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ChangeUrgencyDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: Project | null;
}

export default function ChangeUrgencyDialog({
  isOpen,
  setIsOpen,
  project
}: ChangeUrgencyDialogProps) {
  const { currentUser, changeUrgency } = useProjectControlTower();
  const [urgency, setUrgency] = useState<UrgencyLevel>('ALTA');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Es obligatorio fundamentar el motivo del cambio de urgencia.');
      return;
    }

    changeUrgency(project.id, urgency, reason.trim());
    setReason('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Flame className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Modificar Nivel de Urgencia
            </DialogTitle>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Expediente: <strong className="text-slate-800 font-mono">{project.code}</strong> - {project.title}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Nuevo Nivel de Urgencia *</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
              <SelectTrigger className="text-sm h-11 rounded-xl">
                <SelectValue placeholder="Selecciona urgencia" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="BAJA" className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-emerald-800">Baja (Plazos estándar)</span>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIA" className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-amber-800">Media (Seguimiento regular)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ALTA" className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-rose-800">Alta (Prioridad ejecutiva)</span>
                  </div>
                </SelectItem>
                <SelectItem value="URGENTE" className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="font-bold text-red-700">URGENTE (Despacho inmediato)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Motivo o Fundamentación de la Dirección *
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Indica el motivo por el cual se redefine la prioridad estratégica de este proyecto..."
              className="min-h-[85px] text-sm resize-none rounded-xl"
              required
            />
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Al aplicar el cambio, se emitirá una <strong>notificación de alta prioridad</strong> a todos los miembros del departamento responsable actual.
            </span>
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
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold h-10 shadow-sm"
            >
              Aplicar y Notificar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
