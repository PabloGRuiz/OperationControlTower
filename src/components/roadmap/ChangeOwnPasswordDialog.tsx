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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ChangeOwnPasswordDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ChangeOwnPasswordDialog({
  isOpen,
  setIsOpen
}: ChangeOwnPasswordDialogProps) {
  const { currentUser, changeOwnPassword } = useProjectControlTower();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    setLoading(true);

    try {
      const res = await changeOwnPassword(currentPassword, newPassword);
      if (!res.success) {
        setError(res.error || 'Error al actualizar la contraseña.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado al procesar el cambio.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const isMinLength = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
      <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <KeyRound className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Seguridad de Acceso
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Actualiza tu contraseña de acceso para mantener la protección de tu cuenta.
          </p>
        </DialogHeader>

        {/* Tarjeta de Usuario Activo */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl my-1">
          <Avatar className="w-10 h-10 border-2 border-white shadow-xs ring-1 ring-slate-200">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback className="text-xs font-bold bg-blue-600 text-white">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 rounded bg-blue-50 text-blue-700 border-blue-200">
                {currentUser.role}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate block">
              {currentUser.email}
            </span>
          </div>
        </div>

        {/* Mensajes de Estado */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Contraseña actualizada exitosamente! Cerrando ventana...</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Contraseña Actual */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Contraseña Actual *</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="h-10 text-xs pr-9 rounded-xl"
                disabled={loading || success}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Nueva Contraseña *</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-10 text-xs pr-9 rounded-xl"
                disabled={loading || success}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Confirmar Nueva Contraseña *</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="h-10 text-xs pr-9 rounded-xl"
                disabled={loading || success}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Requisitos visuales */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-[11px]">
            <div className={`flex items-center gap-1.5 font-medium ${isMinLength ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                {isMinLength ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
              </span>
              <span>Longitud mínima de 6 caracteres</span>
            </div>

            <div className={`flex items-center gap-1.5 font-medium ${isMatch ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                {isMatch ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
              </span>
              <span>Las contraseñas coinciden</span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl text-xs font-semibold h-10"
              disabled={loading || success}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || success || !isMinLength || !isMatch}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-10 shadow-sm disabled:opacity-50 gap-1.5"
            >
              {loading ? (
                <span>Actualizando...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
