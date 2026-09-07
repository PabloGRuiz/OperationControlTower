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
import NewStageDialog from './NewStageDialog';
import ChangeOwnPasswordDialog from './ChangeOwnPasswordDialog';
import NotificationsDropdown from './NotificationsDropdown';
import AuditLogView from './AuditLogView';
import AdminPanel from './AdminPanel';
import ProjectListView from './ProjectListView';
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
  FolderPlus,
  KeyRound,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { filterProjectsForUser, isProjectCompetentForUser } from '@/lib/projectPermissions';

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
  const [isNewStageOpen, setIsNewStageOpen] = useState(false);
  const [defaultStageForNewProject, setDefaultStageForNewProject] = useState<string | undefined>();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Filtro de proyectos para Supervisores Globales (Administrador / Director)
  const [supervisorFilterMode, setSupervisorFilterMode] = useState<'all' | 'competent'>('all');

  // Formato de visualización de proyectos: Tarjetas por etapa vs Lista completa
  const [boardDisplayFormat, setBoardDisplayFormat] = useState<'cards' | 'list'>('cards');

  // Si no hay usuario autenticado, renderizar la pantalla de Login
  if (!currentUser) {
    return <LoginPage />;
  }

  const draggedProject = projects.find((p) => p.id === draggedProjectId) || null;
  const currentDept = departments.find((d) => d.id === currentUser.departmentId);

  const isSupervisorGlobal = currentUser.role === 'ADMINISTRADOR' || currentUser.role === 'DIRECTOR';
  const competentProjectsCount = projects.filter((p) => isProjectCompetentForUser(p, currentUser)).length;
  const allProjectsCount = projects.length;

  const visibleProjects = filterProjectsForUser(
    projects,
    currentUser,
    !isSupervisorGlobal ? true : supervisorFilterMode === 'competent'
  );

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

  const canCreateProject = Boolean(currentUser);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shrink-0 gap-2.5 sm:gap-4 shadow-xs z-20">
        {/* Lado Izquierdo: Título y Navegación */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-sky-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 border border-white/20">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Operations Control Tower
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Control de Gestión
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Trazabilidad, ciclo de vida por etapas y derivaciones interdepartamentales
              </p>
            </div>
          </div>

          {/* Pestañas de Navegación */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl text-xs font-bold text-slate-600 border border-slate-200/70 shadow-2xs">
            <button
              onClick={() => setActiveView('board')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeView === 'board'
                  ? 'bg-white text-blue-950 shadow-xs font-black border border-slate-200/70'
                  : 'hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Tablero de Etapas
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeView === 'audit'
                  ? 'bg-white text-blue-950 shadow-xs font-black border border-slate-200/70'
                  : 'hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              Auditoría y Pases
            </button>

            {currentUser.role === 'ADMINISTRADOR' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                  activeView === 'admin'
                    ? 'bg-white text-purple-950 shadow-xs font-black border border-purple-200/80'
                    : 'hover:text-purple-900 hover:bg-purple-50/60 text-purple-700'
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
              className="h-9 px-3.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl gap-1.5 shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
            <Avatar className="w-9 h-9 border-2 border-white shadow-2xs ring-2 ring-blue-100">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="text-xs font-bold bg-blue-50 text-blue-800">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {currentDept?.name || 'Administración Central'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(true)}
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl gap-1.5 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs border-slate-200"
              title="Cambiar Mi Contraseña"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Seguridad</span>
            </Button>

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

      {/* BANNER INFORMATIVO DINÁMICO SEGÚN ROL Y FILTRO DE COMPETENCIA */}
      <div
        className={`px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs border-b transition-colors gap-2 shrink-0 ${
          currentUser.role === 'USUARIO'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : currentUser.role === 'ENCARGADO'
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : currentUser.role === 'DIRECTOR'
            ? 'bg-slate-900 text-slate-100 border-slate-800'
            : 'bg-purple-50/80 border-purple-200 text-purple-900'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
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

        {/* Selector de Filtro o Indicador de Competencia */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Conmutador de Formato de Visualización */}
          <div className="flex items-center bg-white/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setBoardDisplayFormat('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                boardDisplayFormat === 'cards'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ver expedientes en columnas Kanban con tarjetas completas y espaciosas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas por Etapa</span>
            </button>
            <button
              onClick={() => setBoardDisplayFormat('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                boardDisplayFormat === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ver expedientes en formato lista completa sin restricciones de ancho"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Completa</span>
            </button>
          </div>

          {isSupervisorGlobal ? (
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSupervisorFilterMode('all')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  supervisorFilterMode === 'all'
                    ? currentUser.role === 'DIRECTOR'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'bg-white text-purple-950 shadow-2xs'
                    : currentUser.role === 'DIRECTOR'
                    ? 'text-slate-300 hover:text-white'
                    : 'text-purple-800 hover:text-purple-950'
                }`}
              >
                Todos ({allProjectsCount})
              </button>
              <button
                onClick={() => setSupervisorFilterMode('competent')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  supervisorFilterMode === 'competent'
                    ? currentUser.role === 'DIRECTOR'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'bg-white text-purple-950 shadow-2xs'
                    : currentUser.role === 'DIRECTOR'
                    ? 'text-slate-300 hover:text-white'
                    : 'text-purple-800 hover:text-purple-950'
                }`}
              >
                Solo los que me competen ({competentProjectsCount})
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs text-[11px] font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Expedientes que te competen ({visibleProjects.length})
              </span>
            </div>
          )}

          {/* Indicador de Drag en Progreso */}
          {draggedProject && (
            <div className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5 shrink-0 ml-1">
              <span>Derivando: {draggedProject.code}</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      {activeView === 'board' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {departments.length === 0 ? (
            /* Guía de Inicialización para Base Limpia */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="p-8 max-w-2xl mx-auto mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
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
            </div>
          ) : boardDisplayFormat === 'list' ? (
            <div className="flex-1 min-h-0 overflow-auto">
              <ProjectListView
                projects={visibleProjects}
                stages={stages}
                onOpenDetail={handleOpenDetail}
                onOpenDerivation={handleOpenDerivation}
                onOpenUrgency={handleOpenUrgency}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
              <div className="flex flex-row gap-4 sm:gap-5 p-3 sm:p-4 h-full items-stretch w-max">
                {stages.map((stage) => {
                  const stageProjects = visibleProjects.filter((p) => p.stageId === stage.id);
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

                {/* Botón para Agregar Nueva Etapa para Administradores */}
                {currentUser.role === 'ADMINISTRADOR' && (
                  <div className="flex flex-col w-[260px] sm:w-[280px] shrink-0 h-full">
                    <button
                      onClick={() => setIsNewStageOpen(true)}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/70 hover:border-purple-500 text-purple-700 transition-all group shadow-2xs hover:shadow-sm h-full max-h-[300px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 group-hover:bg-purple-600 group-hover:text-white text-purple-700 flex items-center justify-center transition-all shadow-2xs">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold block text-slate-900 group-hover:text-purple-900">
                          + Agregar Etapa / Columna
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                          Crea una nueva columna en el tablero
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'audit' && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AuditLogView />
        </div>
      )}

      {activeView === 'admin' && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AdminPanel />
        </div>
      )}

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

      <NewStageDialog
        isOpen={isNewStageOpen}
        setIsOpen={setIsNewStageOpen}
      />

      <ChangeOwnPasswordDialog
        isOpen={isChangePasswordOpen}
        setIsOpen={setIsChangePasswordOpen}
      />
    </div>
  );
}
