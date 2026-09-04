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
  ShieldCheck,
  Edit3
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
    addUser,
    updateUserRole,
    resetDemoData
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
  const [newUserRole, setNewUserRole] = useState<UserRole>('USUARIO');
  const [newUserDeptId, setNewUserDeptId] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

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
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    addDepartment(newDeptName.trim(), newDeptCode.trim(), newDeptColor);
    setNewDeptName('');
    setNewDeptCode('');
    setSuccessMsg('Departamento creado correctamente.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserDeptId) return;
    addUser(newUserName.trim(), newUserEmail.trim(), newUserRole, newUserDeptId);
    setNewUserName('');
    setNewUserEmail('');
    setSuccessMsg('Cuenta de usuario creada con éxito.');
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
            if (confirm('¿Deseas restablecer todos los datos iniciales de prueba?')) {
              resetDemoData();
            }
          }}
          className="text-xs font-semibold text-slate-600 gap-1.5 h-10 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer Datos Demo
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Selector de Pestañas del Admin */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('stages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stages'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Columnas y Etapas del Tablero ({stages.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          3. Usuarios y Roles ({users.length})
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
            <div className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <div key={dept.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${dept.color}`}>
                      {dept.code}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
                  </div>
                </div>
              ))}
            </div>
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
                  placeholder="Ej: Auditoría y Control Interno"
                  className="text-xs h-9 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Código Abreviado</Label>
                <Input
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="Ej: AUDITORIA"
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
                    <SelectItem value="bg-cyan-100 text-cyan-800 border-cyan-300">Cyan</SelectItem>
                    <SelectItem value="bg-teal-100 text-teal-800 border-teal-300">Verde Azulado</SelectItem>
                    <SelectItem value="bg-rose-100 text-rose-800 border-rose-300">Rosa Salmón</SelectItem>
                    <SelectItem value="bg-orange-100 text-orange-800 border-orange-300">Naranja</SelectItem>
                    <SelectItem value="bg-violet-100 text-violet-800 border-violet-300">Violeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-lg"
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
              Gestión de Cuentas y Asignación de Roles
            </h3>
            <p className="text-xs text-slate-500">
              Puedes reasignar roles y departamentos a cualquier funcionario de forma inmediata.
            </p>

            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                return (
                  <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-slate-200">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-xs font-bold">
                          {user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Selector de Rol */}
                      <Select
                        value={user.role}
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
                        value={user.departmentId}
                        onValueChange={(newDept) =>
                          newDept && updateUserRole(user.id, user.role, newDept)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs font-medium w-44 bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                <Label className="text-xs font-bold text-slate-700">Correo Institucional</Label>
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
                <Label className="text-xs font-bold text-slate-700">Rol Inicial</Label>
                <Select value={newUserRole} onValueChange={(v) => v && setNewUserRole(v as UserRole)}>
                  <SelectTrigger className="text-xs h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USUARIO">Usuario (Operativo)</SelectItem>
                    <SelectItem value="ENCARGADO">Encargado (Jefe de Área)</SelectItem>
                    <SelectItem value="DIRECTOR">Director (Estratégico)</SelectItem>
                    <SelectItem value="ADMINISTRADOR">Administrador (Sistemas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Departamento Asignado</Label>
                <Select value={newUserDeptId} onValueChange={(v) => v && setNewUserDeptId(v)} required>
                  <SelectTrigger className="text-xs h-9 rounded-lg">
                    <SelectValue placeholder="Selecciona depto" />
                  </SelectTrigger>
                  <SelectContent>
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-lg"
              >
                Crear Usuario
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
