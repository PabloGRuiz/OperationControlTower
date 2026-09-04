"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert, Clock } from 'lucide-react';

export default function LoginPage() {
  const { login, lockoutRemainingSeconds } = useProjectControlTower();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error al procesar la autenticación criptográfica.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutRemainingSeconds > 0;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 font-sans text-slate-100 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Cabecera Institucional */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-2 border border-blue-400/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operations Control Tower
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Acceso Seguro a la Plataforma de Gestión y Procesos
          </p>
        </div>

        {/* Tarjeta de Login */}
        <Card className="bg-white/95 backdrop-blur-md border-slate-700/50 shadow-2xl rounded-2xl text-slate-900 overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Ingresa tus credenciales oficiales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Aviso de Bloqueo por Fuerza Bruta */}
            {isLocked && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Bloqueo temporal por intentos fallidos. Reintenta en <strong>{lockoutRemainingSeconds}s</strong>.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Correo Institucional
                </Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isLocked || loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@torre.gob.ar"
                  className="h-11 rounded-xl text-sm bg-white border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Contraseña
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLocked || loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl text-sm pr-10 bg-white border-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || isLocked}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all gap-2 disabled:opacity-50"
              >
                {loading ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                Autenticación Criptográfica SHA-256 + Salt • Control de Acceso RBAC
              </span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 font-medium">
          Sistema Protegido • Auditoría y Trazabilidad Activa
        </p>
      </div>
    </div>
  );
}
