"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Department,
  Stage,
  Project,
  Notification,
  UrgencyLevel,
  DerivationHistoryItem,
  initialUsers,
  initialDepartments,
  initialStages,
  initialProjects,
  initialNotifications
} from '@/types/roadmap';

interface ProjectContextType {
  currentUser: User;
  users: User[];
  departments: Department[];
  stages: Stage[];
  projects: Project[];
  notifications: Notification[];
  activeView: 'board' | 'audit' | 'admin';
  setActiveView: (view: 'board' | 'audit' | 'admin') => void;
  unreadNotificationsCount: number;
  
  // Acciones de Usuario y Roles
  switchUser: (userId: string) => void;
  
  // Acciones sobre Proyectos y Flujo
  createProject: (data: {
    title: string;
    description: string;
    urgency: UrgencyLevel;
    targetDepartmentId: string;
    initialObservation?: string;
  }) => void;
  
  markAsCompleted: (projectId: string, observation?: string) => void;
  markAsControlled: (projectId: string) => void;
  deriveProject: (
    projectId: string,
    toStageId: string,
    toDepartmentId: string,
    observation: string
  ) => void;
  changeUrgency: (projectId: string, urgency: UrgencyLevel, reason: string) => void;
  
  // Acciones de Administrador
  updateStageTitle: (stageId: string, newTitle: string, newDescription?: string) => void;
  addDepartment: (name: string, code: string, color: string) => void;
  addUser: (name: string, email: string, role: UserRole, departmentId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole, newDepartmentId: string) => void;
  
  // Notificaciones
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Utilidades Demo
  resetDemoData: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'OCT_OPERATIONS_TOWER_STATE_V1';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]); // Valeria Castro (Encargada) por defecto
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeView, setActiveView] = useState<'board' | 'audit' | 'admin'>('board');

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.stages) setStages(parsed.stages);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.currentUserId) {
          const user = parsed.users?.find((u: User) => u.id === parsed.currentUserId) || initialUsers[1];
          setCurrentUser(user);
        }
      }
    } catch (e) {
      console.error('Error al cargar estado de localStorage:', e);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          departments,
          stages,
          projects,
          notifications,
          currentUserId: currentUser.id
        })
      );
    } catch (e) {
      console.error('Error al guardar estado:', e);
    }
  }, [users, departments, stages, projects, notifications, currentUser, isClient]);

  // Cambiar usuario simulado activo
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Crear proyecto (Director, Encargado o Admin)
  const createProject = (data: {
    title: string;
    description: string;
    urgency: UrgencyLevel;
    targetDepartmentId: string;
    initialObservation?: string;
  }) => {
    const newCode = `PRJ-2026-${String(projects.length + 1).padStart(3, '0')}`;
    const targetDept = departments.find((d) => d.id === data.targetDepartmentId);
    const observation = data.initialObservation?.trim() || 'Proyecto aperturado formalmente y derivado a su etapa inicial.';
    
    const initialHistory: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: stages[0].id,
      toStageId: stages[0].id,
      fromDepartmentId: currentUser.departmentId,
      toDepartmentId: data.targetDepartmentId,
      performedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl
      },
      observation: observation,
      actionType: 'CREACION'
    };

    const newProject: Project = {
      id: `p-${Date.now()}`,
      code: newCode,
      title: data.title,
      description: data.description,
      stageId: stages[0].id,
      currentDepartmentId: data.targetDepartmentId,
      urgency: data.urgency,
      status: 'EN_PROCESO',
      createdBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastObservation: observation,
      history: [initialHistory]
    };

    setProjects((prev) => [newProject, ...prev]);

    // Notificar a todos los usuarios del departamento de destino
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: data.targetDepartmentId,
      title: 'Nuevo Proyecto Asignado',
      message: `${currentUser.name} (${currentUser.role}) abrió el proyecto "${data.title}" y lo asignó a ${targetDept?.name || 'su área'}.`,
      projectId: newProject.id,
      projectTitle: newProject.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'NUEVO_PROYECTO'
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Marcar como completada por el Usuario
  const markAsCompleted = (projectId: string, observationText?: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const observation = observationText?.trim() || `El auxiliar ${currentUser.name} marcó la tarea como completada. Requiere revisión y pase por el Encargado.`;

    const historyItem: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: project.stageId,
      toStageId: project.stageId,
      fromDepartmentId: project.currentDepartmentId,
      toDepartmentId: project.currentDepartmentId,
      performedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl
      },
      observation,
      actionType: 'COMPLETADO'
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'COMPLETADO_POR_USUARIO',
              lastObservation: observation,
              updatedAt: new Date().toISOString(),
              history: [historyItem, ...p.history]
            }
          : p
      )
    );

    // Notificar a los encargados del área
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: project.currentDepartmentId,
      recipientRole: 'ENCARGADO',
      title: 'Tarea Completada - Requiere Control',
      message: `${currentUser.name} marcó como completada la etapa de "${project.title}". Pendiente de control y elevación.`,
      projectId: project.id,
      projectTitle: project.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'COMPLETADO'
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Marcar como controlado (Encargado o Admin)
  const markAsControlled = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const observation = `Revisado y CONTROLADO formalmente por ${currentUser.name} (${currentUser.role}). Listo para derivación a la siguiente etapa.`;

    const historyItem: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: project.stageId,
      toStageId: project.stageId,
      fromDepartmentId: project.currentDepartmentId,
      toDepartmentId: project.currentDepartmentId,
      performedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl
      },
      observation,
      actionType: 'CONTROLADO'
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: 'CONTROLADO',
              lastObservation: observation,
              updatedAt: new Date().toISOString(),
              history: [historyItem, ...p.history]
            }
          : p
      )
    );

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: project.currentDepartmentId,
      title: 'Proyecto Controlado',
      message: `${currentUser.name} validó y marcó como CONTROLADO el proyecto "${project.title}".`,
      projectId: project.id,
      projectTitle: project.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'CONTROLADO'
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Derivar proyecto a otra etapa y departamento con observación
  const deriveProject = (
    projectId: string,
    toStageId: string,
    toDepartmentId: string,
    observation: string
  ) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const fromStage = stages.find((s) => s.id === project.stageId)?.title || project.stageId;
    const toStage = stages.find((s) => s.id === toStageId)?.title || toStageId;
    const toDept = departments.find((d) => d.id === toDepartmentId)?.name || toDepartmentId;

    const historyItem: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: project.stageId,
      toStageId,
      fromDepartmentId: project.currentDepartmentId,
      toDepartmentId,
      performedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl
      },
      observation: observation.trim(),
      actionType: 'DERIVACION'
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stageId: toStageId,
              currentDepartmentId: toDepartmentId,
              status: 'EN_PROCESO', // Se reinicia el ciclo de proceso para la nueva área
              lastObservation: observation.trim(),
              updatedAt: new Date().toISOString(),
              history: [historyItem, ...p.history]
            }
          : p
      )
    );

    // Notificar masivamente a todos los usuarios que pertenezcan a dicho departamento
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: toDepartmentId,
      title: 'Proyecto Derivado a tu Departamento',
      message: `${currentUser.name} (${currentUser.role}) derivó "${project.title}" a ${toDept} en la etapa "${toStage}". Observación: "${observation.trim()}"`,
      projectId: project.id,
      projectTitle: project.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'DERIVACION'
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Cambiar urgencia (Director o Admin)
  const changeUrgency = (projectId: string, urgency: UrgencyLevel, reason: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const observation = `Cambio de urgencia a ${urgency} dictaminado por ${currentUser.name} (${currentUser.role}). Motivo: "${reason.trim()}"`;

    const historyItem: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: project.stageId,
      toStageId: project.stageId,
      fromDepartmentId: project.currentDepartmentId,
      toDepartmentId: project.currentDepartmentId,
      performedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl
      },
      observation,
      actionType: 'CAMBIO_URGENCIA'
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              urgency,
              lastObservation: observation,
              updatedAt: new Date().toISOString(),
              history: [historyItem, ...p.history]
            }
          : p
      )
    );

    // Notificar a todos los usuarios del departamento actualmente responsable
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: project.currentDepartmentId,
      title: `Prioridad modificada a ${urgency}`,
      message: `La Dirección modificó el nivel de urgencia de "${project.title}" a ${urgency}. Motivo: "${reason.trim()}"`,
      projectId: project.id,
      projectTitle: project.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'URGENCIA'
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Acciones de Administrador
  const updateStageTitle = (stageId: string, newTitle: string, newDescription?: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, title: newTitle, description: newDescription || s.description }
          : s
      )
    );
  };

  const addDepartment = (name: string, code: string, color: string) => {
    const newDept: Department = {
      id: `dep-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      color: color || 'bg-slate-100 text-slate-800 border-slate-300'
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const addUser = (name: string, email: string, role: UserRole, departmentId: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      departmentId,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUserRole = (userId: string, newRole: UserRole, newDepartmentId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole, departmentId: newDepartmentId } : u
      )
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole, departmentId: newDepartmentId }));
    }
  };

  // Notificaciones
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[1]);
    setDepartments(initialDepartments);
    setStages(initialStages);
    setProjects(initialProjects);
    setNotifications(initialNotifications);
    setActiveView('board');
  };

  // Notificaciones no leídas pertinentes al usuario actual (por depto, rol o generales)
  const unreadNotificationsCount = notifications.filter(
    (n) =>
      !n.read &&
      (!n.recipientDepartmentId || n.recipientDepartmentId === currentUser.departmentId) &&
      (!n.recipientRole || n.recipientRole === currentUser.role)
  ).length;

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        users,
        departments,
        stages,
        projects,
        notifications,
        activeView,
        setActiveView,
        unreadNotificationsCount,
        switchUser,
        createProject,
        markAsCompleted,
        markAsControlled,
        deriveProject,
        changeUrgency,
        updateStageTitle,
        addDepartment,
        addUser,
        updateUserRole,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDemoData
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectControlTower() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectControlTower debe ser usado dentro de un ProjectProvider');
  }
  return context;
}
