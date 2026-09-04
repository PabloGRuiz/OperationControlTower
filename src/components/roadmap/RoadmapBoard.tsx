"use client";

import React, { useState } from 'react';
import { Project, Stage, UserRole } from '@/types/roadmap';
import { useProjectControlTower } from '@/context/ProjectContext';
import LoginPage from '@/components/auth/LoginPage';
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
  Building2,
  Info,
  CheckCircle2,
  Flame,
  LogOut,
  ArrowRight,
  FolderPlus
} from 'lucide-react';

export default function RoadmapBoard() {
  const {
    currentUser,
    departments,
    stages,
    projects,
    activeView,
    setActiveView,
    logout
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

  // Si no hay usuario autenticado, renderizar la pantalla de Login
  if (!currentUser) {
    return <LoginPage />;
  }

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

        {/* Lado Derecho: Acciones, Notificaciones y Perfil */}
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

          {/* PERFIL DE USUARIO ACTIVO Y LOGOUT */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Avatar className="w-9 h-9 border-2 border-white shadow-2xs ring-1 ring-slate-200">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-800">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {currentDept?.name || 'Administración Central'}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('¿Deseas cerrar tu sesión actual?')) {
                  logout();
                }
              }}
              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
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
                <strong>Rol Usuario ({currentDept?.name || 'Operativo'}):</strong> Trabajas en los proyectos de tu área. Al finalizar una tarea, presiona <strong>"Marcar Completada"</strong> para notificar a tu Encargado.
              </span>
            </>
          )}

          {currentUser.role === 'ENCARGADO' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Rol Encargado ({currentDept?.name || 'Área'}):</strong> Responsable de controlar tareas completadas y <strong>derivar proyectos</strong> entre etapas y departamentos con observación obligatoria.
              </span>
            </>
          )}

          {currentUser.role === 'DIRECTOR' && (
            <>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Rol Dirección General:</strong> Supervisión global estratégica. Puedes modificar el <strong>nivel de urgencia</strong> de expedientes y aperturar nuevos proyectos gubernamentales.
              </span>
            </>
          )}

          {currentUser.role === 'ADMINISTRADOR' && (
            <>
              <Settings className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Rol Administrador Maestro:</strong> Control total. Puedes dar de alta Departamentos, crear Cuentas de Funcionarios y personalizar los nombres de las Columnas en la pestaña <strong>Administración</strong>.
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
          {departments.length === 0 ? (
            /* Guía de Inicialización para Base Limpia */
            <div className="p-8 max-w-2xl mx-auto mt-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  ¡Base de Datos Limpia Inicializada!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Para comenzar a aperturar proyectos y habilitar derivaciones, el Administrador debe dar de alta los departamentos oficiales de la organización.
                </p>
              </div>

              {currentUser.role === 'ADMINISTRADOR' ? (
                <Button
                  onClick={() => setActiveView('admin')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl h-10 px-5 gap-2 shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                  Ir a Panel de Administración y Crear Departamentos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <p className="text-xs font-semibold text-slate-400">
                  Contacta al Administrador del Sistema para la configuración inicial de departamentos.
                </p>
              )}
            </div>
          ) : (
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
          )}
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
