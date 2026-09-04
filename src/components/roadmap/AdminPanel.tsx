"use client";

import React, { useState } from 'react';
import { UserRole } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Settings,
  Layers,
  Building2,
  Users,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
  KeyRound,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function AdminPanel() {
  const {
    stages,
    departments,
    users,
    updateStageTitle,
    addDepartment,
    deleteDepartment,
    addUser,
    deleteUser,
    updateUserRole,
    resetCleanDatabase
  } = useProjectControlTower();

  const [activeTab, setActiveTab] = useState<'stages' | 'departments' | 'users'>('stages');

  // Estado para edición de etapas
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageTitle, setStageTitle] = useState('');
  const [stageDesc, setStageDesc] = useState('');

  // Estado para nuevo departamento
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('bg-blue-100 text-blue-800 border-blue-300');

  // Estado para nuevo usuario
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('USUARIO');
  const [newUserDeptId, setNewUserDeptId] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartEditStage = (stage: typeof stages[0]) => {
    setEditingStageId(stage.id);
    setStageTitle(stage.title);
    setStageDesc(stage.description);
  };

  const handleSaveStage = (stageId: string) => {
    if (!stageTitle.trim()) return;
    updateStageTitle(stageId, stageTitle.trim(), stageDesc.trim());
    setEditingStageId(null);
    setSuccessMsg('Etapa de columna actualizada con éxito.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    addDepartment(newDeptName.trim(), newDeptCode.trim(), newDeptColor);
    setNewDeptName('');
    setNewDeptCode('');
    setSuccessMsg('Departamento creado correctamente.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setErrorMsg('Todos los campos son obligatorios, incluyendo la contraseña inicial.');
      return;
    }

    if (newUserRole !== 'ADMINISTRADOR' && departments.length === 0) {
      setErrorMsg('Debes crear al menos un departamento antes de asignar usuarios.');
      return;
    }

    addUser(
      newUserName.trim(),
      newUserEmail.trim(),
      newUserPassword.trim(),
      newUserRole,
      newUserDeptId
    );
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setSuccessMsg('Cuenta de funcionario creada con éxito. Ya puede iniciar sesión.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header del Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Panel de Administración y Control Maestro
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestión de columnas del tablero, alta de departamentos, asignación de roles y control de cuentas.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            if (confirm('¿Deseas restablecer la base de datos a su estado limpio inicial (solo cuenta Admin)?')) {
              resetCleanDatabase();
            }
          }}
          className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5 h-10 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar Base de Datos Limpia
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Selector de Pestañas del Admin */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'stages'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Columnas y Etapas ({stages.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'departments'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          2. Departamentos ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          3. Usuarios y Cuentas ({users.length})
        </button>
      </div>

      {/* PESTAÑA 1: ETAPAS Y COLUMNAS */}
      {activeTab === 'stages' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Personalización de Nombres de Columnas / Etapas del Proceso
            </h3>
            <p className="text-xs text-slate-500">
              Como Administrador puedes renombrar las etapas del ciclo de vida para que se adapten a las normativas de tu organismo.
            </p>

            <div className="divide-y divide-slate-100">
              {stages.map((stage) => {
                const isEditing = editingStageId === stage.id;
                return (
                  <div key={stage.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={stageTitle}
                          onChange={(e) => setStageTitle(e.target.value)}
                          placeholder="Nombre de la etapa"
                          className="text-sm h-9 rounded-lg"
                        />
                        <Input
                          value={stageDesc}
                          onChange={(e) => setStageDesc(e.target.value)}
                          placeholder="Descripción del objetivo de la etapa"
                          className="text-xs h-8 rounded-lg text-slate-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Orden {stage.order}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{stage.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStageId(null)}
                            className="h-8 text-xs font-semibold rounded-lg"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveStage(stage.id)}
                            className="h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Guardar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEditStage(stage)}
                          className="h-8 text-xs font-semibold rounded-lg text-blue-600 hover:text-blue-800 gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Renombrar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: DEPARTAMENTOS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Departamentos y Áreas Operativas</h3>
            {departments.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No hay departamentos dados de alta</p>
                <p className="text-[11px] text-slate-400">
                  Utiliza el formulario de la derecha para dar de alta las áreas oficiales (ej: Presupuesto, Legal, Licitaciones).
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <div key={dept.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${dept.color}`}>
                        {dept.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`¿Eliminar el departamento "${dept.name}"?`)) {
                          deleteDepartment(dept.id);
                        }
                      }}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Eliminar departamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Nuevo Departamento
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Nombre del Departamento</Label>
                <Input
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Ej: Presupuesto y Finanzas"
                  className="text-xs h-9 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Código Abreviado</Label>
                <Input
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="Ej: PRESUPUESTO"
                  className="text-xs h-9 rounded-lg uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Color de Etiqueta</Label>
                <Select value={newDeptColor} onValueChange={(v) => v && setNewDeptColor(v)}>
                  <SelectTrigger className="text-xs h-9 rounded-lg">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-emerald-100 text-emerald-800 border-emerald-300">Verde Esmeralda</SelectItem>
                    <SelectItem value="bg-blue-100 text-blue-800 border-blue-300">Azul Institucional</SelectItem>
                    <SelectItem value="bg-purple-100 text-purple-800 border-purple-300">Púrpura Legal</SelectItem>
                    <SelectItem value="bg-amber-100 text-amber-800 border-amber-300">Ámbar Operaciones</SelectItem>
                    <SelectItem value="bg-indigo-100 text-indigo-800 border-indigo-300">Índigo Sistemas</SelectItem>
                    <SelectItem value="bg-rose-100 text-rose-800 border-rose-300">Rosa Salmón</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-lg shadow-sm"
              >
                Agregar Departamento
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: USUARIOS Y ASIGNACIÓN DE ROLES */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Gestión de Cuentas y Contraseñas
            </h3>
            <p className="text-xs text-slate-500">
              Administra los funcionarios, sus roles y sus contraseñas de acceso local.
            </p>

            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const isMasterAdmin = user.id === 'usr-admin';
                return (
                  <div key={user.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-slate-200">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-xs font-bold">
                          {user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{user.name}</span>
                          {isMasterAdmin && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                              Admin Maestro
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Pass: <strong className="text-slate-700">{user.password || 'admin'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Selector de Rol */}
                      <Select
                        value={user.role}
                        disabled={isMasterAdmin}
                        onValueChange={(newRole) =>
                          newRole && updateUserRole(user.id, newRole as UserRole, user.departmentId)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs font-bold w-32 bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USUARIO">Usuario</SelectItem>
                          <SelectItem value="ENCARGADO">Encargado</SelectItem>
                          <SelectItem value="DIRECTOR">Director</SelectItem>
                          <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Selector de Departamento */}
                      <Select
                        value={user.departmentId || ''}
                        disabled={isMasterAdmin}
                        onValueChange={(newDept) =>
                          newDept && updateUserRole(user.id, user.role, newDept)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs font-medium w-40 bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Sin Depto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin Depto</SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {!isMasterAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`¿Eliminar la cuenta de "${user.name}"?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Crear Nueva Cuenta
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Nombre Completo</Label>
                <Input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej: Lic. Martín Toledo"
                  className="text-xs h-9 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Correo Institucional (Login)</Label>
                <Input
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="martin.toledo@torre.gob.ar"
                  type="email"
                  className="text-xs h-9 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Contraseña de Acceso</Label>
                <Input
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Contraseña inicial"
                  type="text"
                  className="text-xs h-9 rounded-lg font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Rol Inicial</Label>
                <Select value={newUserRole} onValueChange={(v) => v && setNewUserRole(v as UserRole)}>
                  <SelectTrigger className="text-xs h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USUARIO">Usuario (Auxiliar / Operativo)</SelectItem>
                    <SelectItem value="ENCARGADO">Encargado (Jefe de Área)</SelectItem>
                    <SelectItem value="DIRECTOR">Director (Dirección General)</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador (Sistemas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Departamento Asignado</Label>
                <Select value={newUserDeptId} onValueChange={(v) => v && setNewUserDeptId(v)}>
                  <SelectTrigger className="text-xs h-9 rounded-lg">
                    <SelectValue placeholder="Selecciona depto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin Departamento</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-lg shadow-sm"
              >
                Crear Cuenta de Funcionario
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
