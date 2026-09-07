"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Check,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login, lockoutRemainingSeconds } = useProjectControlTower();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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
      console.error("Error durante el login:", err);
      setError('Error al procesar la autenticación criptográfica.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutRemainingSeconds > 0;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-slate-950 select-none">
      {/* ========================================================= */}
      {/* FONDO ATMOSFÉRICO: MESH AURORA GRADIENT (AZUL / CELESTE / BLANCO) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Orbe 1: Celeste brillante superior */}
        <div
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-sky-400/35 blur-[130px] animate-aurora-1"
        />

        {/* Orbe 2: Azul zafiro central profundo */}
        <div
          className="absolute top-1/4 -right-28 w-[650px] h-[650px] rounded-full bg-blue-600/40 blur-[150px] animate-aurora-2"
        />

        {/* Orbe 3: Celeste cielo y destello blanco inferior */}
        <div
          className="absolute -bottom-28 left-1/3 w-[600px] h-[600px] rounded-full bg-sky-300/30 blur-[140px] animate-aurora-3"
        />

        {/* Orbe 4: Azul cobalto base */}
        <div
          className="absolute bottom-10 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-700/30 blur-[130px]"
        />

        {/* Malla de textura sutil para mayor profundidad */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-slate-950/80" />
      </div>

      {/* ========================================================= */}
      {/* CONTENEDOR PRINCIPAL */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        
        {/* AVATAR CIRCULAR SUPERIOR CON VIDRIO ESMERILADO (Idéntico a la referencia) */}
        <div className="relative mb-6 sm:mb-8 group">
          {/* Anillo de resplandor exterior */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-b from-white/40 via-sky-300/30 to-blue-500/20 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-xl border border-white/35 flex items-center justify-center shadow-2xl shadow-sky-950/60 ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-[1.03]">
            <User className="w-12 h-12 sm:w-14 sm:h-14 text-white/95 stroke-[1.3] drop-shadow-md" />
          </div>
        </div>

        {/* IDENTIFICACIÓN INSTITUCIONAL */}
        <div className="text-center mb-6 space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-[0.25em] text-sky-200/90 shadow-sm">
            <Sparkles className="w-3 h-3 text-sky-300" />
            Operations Control Tower
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-sky-100/70 font-medium">
            Plataforma de Control de Gestión y Trazabilidad Operativa
          </p>
        </div>

        {/* ALERTA DE BLOQUEO POR FUERZA BRUTA */}
        {isLocked && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-300/40 backdrop-blur-md text-amber-100 text-xs font-semibold flex items-center gap-2.5 animate-pulse shadow-lg">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Acceso bloqueado por intentos fallidos. Reintenta en <strong>{lockoutRemainingSeconds}s</strong>.
            </span>
          </div>
        )}

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/25 border border-rose-300/40 backdrop-blur-md text-rose-100 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORMULARIO DE ACCESO (Inspirado en la referencia visual) */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          
          {/* CAMPO 1: USUARIO / EMAIL */}
          <div className="glass-input-wrapper rounded-2xl flex items-stretch overflow-hidden shadow-lg shadow-sky-950/20 group">
            {/* Contenedor de Icono Izquierdo */}
            <div className="w-13 sm:w-14 flex items-center justify-center border-r border-white/20 bg-white/10 text-white/80 group-focus-within:text-white group-focus-within:bg-white/15 transition-colors shrink-0">
              <User className="w-5 h-5 stroke-[1.7]" />
            </div>
            {/* Input nativo */}
            <input
              id="email"
              type="text"
              disabled={isLocked || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username o Correo Institucional"
              className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/60 font-medium outline-none disabled:opacity-50"
              autoComplete="username"
              required
            />
          </div>

          {/* CAMPO 2: CONTRASEÑA */}
          <div className="glass-input-wrapper rounded-2xl flex items-stretch overflow-hidden shadow-lg shadow-sky-950/20 group">
            {/* Contenedor de Icono Izquierdo */}
            <div className="w-13 sm:w-14 flex items-center justify-center border-r border-white/20 bg-white/10 text-white/80 group-focus-within:text-white group-focus-within:bg-white/15 transition-colors shrink-0">
              <Lock className="w-5 h-5 stroke-[1.7]" />
            </div>
            {/* Input de Contraseña */}
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              disabled={isLocked || loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/60 font-medium outline-none disabled:opacity-50"
              autoComplete="current-password"
              required
            />
            {/* Botón de Visibilidad */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="px-3.5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* FILA DE OPCIONES: REMEMBER ME Y ASISTENCIA */}
          <div className="flex items-center justify-between px-1 pt-1 text-xs text-sky-100 font-medium">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  rememberMe
                    ? 'bg-sky-400 border-sky-300 text-slate-950'
                    : 'bg-white/15 border-white/30 group-hover:border-white/50'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-white/80 group-hover:text-white transition-colors">
                Recordarme
              </span>
            </label>

            <span
              onClick={() => alert('Para soporte o restablecimiento de credenciales, contacte al Administrador del Sistema.')}
              className="italic text-sky-200/80 hover:text-white hover:underline transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          {/* BOTÓN PRINCIPAL DE LOGIN (Inspirado en la referencia) */}
          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900 bg-gradient-to-r from-sky-100 via-white to-sky-100 hover:from-white hover:to-sky-50 shadow-xl shadow-sky-950/40 hover:shadow-sky-400/20 active:scale-[0.99] hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Verificando...
              </span>
            ) : (
              <>
                <span>INGRESAR</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
