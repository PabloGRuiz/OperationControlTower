"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, users } = useProjectControlTower();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || 'Credenciales inválidas.');
        setLoading(false);
      }
    }, 250);
  };

  const handleQuickAdmin = () => {
    setEmail('admin@torre.gob.ar');
    setPassword('admin');
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 font-sans text-slate-100">
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
            Plataforma de Gestión, Trazabilidad y Control de Procesos
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <Card className="bg-white/95 backdrop-blur-md border-slate-700/50 shadow-2xl rounded-2xl text-slate-900 overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Ingresa con tu correo institucional y contraseña asignada
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Correo Institucional
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej: admin@torre.gob.ar"
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
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all gap-2"
              >
                {loading ? 'Accediendo...' : 'Ingresar al Sistema'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Acceso de Inicialización de Administrador */}
            <div className="pt-2 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    Cuenta Administrador Inicial
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickAdmin}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Autocompletar
                  </button>
                </div>
                <div className="text-slate-500 font-mono text-[11px] space-y-0.5">
                  <div>Usuario: <strong className="text-slate-700">admin@torre.gob.ar</strong></div>
                  <div>Contraseña: <strong className="text-slate-700">admin</strong></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer institucional */}
        <p className="text-center text-xs text-slate-500 font-medium">
          Versión Limpia 2.0 • Base de Datos Local Segura
        </p>
      </div>
    </div>
  );
}
