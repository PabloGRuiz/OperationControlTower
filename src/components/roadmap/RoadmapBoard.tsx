"use client";

import React, { useState } from 'react';
import { Project, Stage, UserRole } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import RoadmapColumn from './RoadmapColumn';
import DerivationDialog from './DerivationDialog';
import ProjectDetailDialog from './ProjectDetailDialog';
import ChangeUrgencyDialog from './ChangeUrgencyDialog';
import NewProjectDialog from './NewProjectDialog';
import NotificationsDropdown from './NotificationsDropdown';
import AuditLogView from './AuditLogView';
import AdminPanel from './AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  History,
  Settings,
  Shield,
  Layers,
  UserCheck,
  Building2,
  ChevronDown,
  Info,
  CheckCircle2,
  Sparkles,
  Flame,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function RoadmapBoard() {
  const {
    currentUser,
    users,
    departments,
    stages,
    projects,
    activeView,
    setActiveView,
    switchUser
  } = useProjectControlTower();

  // Estados de Drag and Drop
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

  // Estados de Modales
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedProjectForDerivation, setSelectedProjectForDerivation] = useState<Project | null>(null);
  const [targetStageIdForDerivation, setTargetStageIdForDerivation] = useState<string | null>(null);
  const [isDerivationOpen, setIsDerivationOpen] = useState(false);

  const [selectedProjectForUrgency, setSelectedProjectForUrgency] = useState<Project | null>(null);
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [defaultStageForNewProject, setDefaultStageForNewProject] = useState<string | undefined>();

  const draggedProject = projects.find((p) => p.id === draggedProjectId) || null;
  const currentDept = departments.find((d) => d.id === currentUser.departmentId);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectId(projectId);
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToStage = (projectId: string, stageId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Si se suelta en la misma etapa no hace falta derivación
    if (project.stageId === stageId) {
      setDraggedProjectId(null);
      return;
    }

    // Al soltar en otra etapa: se abre automáticamente el diálogo de Derivación Obligatoria
    setSelectedProjectForDerivation(project);
    setTargetStageIdForDerivation(stageId);
    setIsDerivationOpen(true);
    setDraggedProjectId(null);
  };

  // Modales helpers
  const handleOpenDetail = (project: Project) => {
    setSelectedProjectForDetail(project);
    setIsDetailOpen(true);
  };

  const handleOpenDerivation = (project: Project) => {
    setSelectedProjectForDerivation(project);
    setTargetStageIdForDerivation(null);
    setIsDerivationOpen(true);
  };

  const handleOpenUrgency = (project: Project) => {
    setSelectedProjectForUrgency(project);
    setIsUrgencyOpen(true);
  };

  const handleNewProjectInStage = (stageId: string) => {
    setDefaultStageForNewProject(stageId);
    setIsNewProjectOpen(true);
  };

  const canCreateProject = currentUser.role !== 'USUARIO';

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200/80 shrink-0 gap-4 shadow-2xs z-20">
        {/* Lado Izquierdo: Título y Navegación */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Operations Control Tower
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                <Shield className="w-3 h-3 text-blue-600" /> Control de Gestión
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Trazabilidad, ciclo de vida por etapas y derivaciones interdepartamentales
            </p>
          </div>

          {/* Pestañas de Navegación */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200/60">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'board'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Tablero de Etapas
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'audit'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              Auditoría y Pases
            </button>

            {currentUser.role === 'ADMINISTRADOR' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'admin'
                    ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                    : 'hover:text-purple-900 hover:bg-slate-200/50 text-purple-700'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-purple-600" />
                Administración
              </button>
            )}
          </nav>
        </div>

        {/* Lado Derecho: Selector de Usuario / Rol & Notificaciones */}
        <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
          {/* Botón Nuevo Proyecto */}
          {canCreateProject && (
            <Button
              size="sm"
              onClick={() => {
                setDefaultStageForNewProject(undefined);
                setIsNewProjectOpen(true);
              }}
              className="h-9 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Aperturar Proyecto
            </Button>
          )}

          {/* Centro de Notificaciones */}
          <NotificationsDropdown
            onSelectProject={(projectId) => {
              const proj = projects.find((p) => p.id === projectId);
              if (proj) handleOpenDetail(proj);
            }}
          />

          {/* SIMULADOR DE ROLES / SELECTOR DE USUARIO ACTIVO */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sesión Activa ({currentUser.role})
              </span>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                {currentDept?.name}
              </span>
            </div>

            <Select value={currentUser.id} onValueChange={(v) => v && switchUser(v)}>
              <SelectTrigger className="h-10 px-2.5 rounded-xl bg-slate-100/80 border-slate-200 hover:bg-slate-100 text-xs font-bold gap-2">
                <Avatar className="w-6 h-6 border border-white">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback className="text-[9px] font-bold">
                    {currentUser.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-xs font-bold text-slate-800">
                  Cambiar Rol Demo
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl w-64">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  Simular Usuario / Rol
                </div>
                {users.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  return (
                    <SelectItem key={u.id} value={u.id} className="text-xs py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={u.avatarUrl} />
                          <AvatarFallback className="text-[9px]">{u.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-blue-700 font-semibold">
                            {u.role} - {dept?.code}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* BANNER INFORMATIVO DINÁMICO SEGÚN ROL */}
      <div
        className={`px-6 py-2 flex items-center justify-between text-xs border-b transition-colors ${
          currentUser.role === 'USUARIO'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : currentUser.role === 'ENCARGADO'
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : currentUser.role === 'DIRECTOR'
            ? 'bg-slate-900 text-slate-100 border-slate-800'
            : 'bg-purple-50/80 border-purple-200 text-purple-900'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {currentUser.role === 'USUARIO' && (
            <>
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Rol Usuario ({currentDept?.name}):</strong> Trabajas en los proyectos de tu área. Al finalizar, presiona <strong>"Marcar Completada"</strong> para elevar el aviso a tu Encargado. <em>(No tienes permisos para arrastrar o derivar proyectos)</em>.
              </span>
            </>
          )}

          {currentUser.role === 'ENCARGADO' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Rol Encargado ({currentDept?.name}):</strong> Responsable de revisar tareas completadas, marcarlas como <strong>Controladas</strong> y <strong>derivar proyectos</strong> (arrastrando tarjetas o con el botón Derivar) registrando observaciones obligatorias.
              </span>
            </>
          )}

          {currentUser.role === 'DIRECTOR' && (
            <>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Rol Dirección General:</strong> Supervisión global estratégica de todas las etapas. Tienes potestad para <strong>modificar niveles de urgencia</strong> (notificando a los equipos) y aperturar nuevos expedientes gubernamentales.
              </span>
            </>
          )}

          {currentUser.role === 'ADMINISTRADOR' && (
            <>
              <Settings className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Rol Administrador Maestro:</strong> Control total. Puedes renombrar columnas/etapas en la pestaña <strong>Administración</strong>, crear departamentos y asignar roles a funcionarios.
              </span>
            </>
          )}
        </div>

        {/* Indicador de Drag en Progreso */}
        {draggedProject && (
          <div className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5 shrink-0 ml-2">
            <span>Derivando: {draggedProject.code}</span>
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      {activeView === 'board' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex flex-row gap-5 p-6 min-h-full items-start w-max">
            {stages.map((stage) => {
              const stageProjects = projects.filter((p) => p.stageId === stage.id);
              return (
                <RoadmapColumn
                  key={stage.id}
                  stage={stage}
                  projects={stageProjects}
                  draggedProject={draggedProject}
                  isDraggingAnywhere={Boolean(draggedProjectId)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDropToStage={handleDropToStage}
                  onNewProjectInStage={handleNewProjectInStage}
                  onOpenDetail={handleOpenDetail}
                  onOpenDerivation={handleOpenDerivation}
                  onOpenUrgency={handleOpenUrgency}
                />
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'audit' && <AuditLogView />}

      {activeView === 'admin' && <AdminPanel />}

      {/* MODALES GLOBALES */}
      <DerivationDialog
        isOpen={isDerivationOpen}
        setIsOpen={setIsDerivationOpen}
        project={selectedProjectForDerivation}
        targetStageId={targetStageIdForDerivation}
      />

      <ProjectDetailDialog
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        project={selectedProjectForDetail}
      />

      <ChangeUrgencyDialog
        isOpen={isUrgencyOpen}
        setIsOpen={setIsUrgencyOpen}
        project={selectedProjectForUrgency}
      />

      <NewProjectDialog
        isOpen={isNewProjectOpen}
        setIsOpen={setIsNewProjectOpen}
        defaultDepartmentId={defaultStageForNewProject}
      />
    </div>
  );
}
