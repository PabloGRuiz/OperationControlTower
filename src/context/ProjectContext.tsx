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
  currentUser: User | null;
  users: User[];
  departments: Department[];
  stages: Stage[];
  projects: Project[];
  notifications: Notification[];
  activeView: 'board' | 'audit' | 'admin';
  setActiveView: (view: 'board' | 'audit' | 'admin') => void;
  unreadNotificationsCount: number;
  
  // Autenticación
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  
  // Acciones sobre Proyectos y Flujo
  createProject: (data: {
    title: string;
    description: string;
    urgency: UrgencyLevel;
    targetDepartmentId: string;
    initialObservation?: string;
  }) => { success: boolean; error?: string };
  
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
  deleteDepartment: (deptId: string) => void;
  addUser: (name: string, email: string, password: string, role: UserRole, departmentId: string) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole, newDepartmentId: string, newPassword?: string) => void;
  
  // Notificaciones
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Utilidades de Base de Datos Local
  resetCleanDatabase: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'OCT_OPERATIONS_TOWER_CLEAN_DB_V2';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
        if (parsed.users && parsed.users.length > 0) setUsers(parsed.users);
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.stages) setStages(parsed.stages);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.currentUserId) {
          const userList = (parsed.users && parsed.users.length > 0) ? parsed.users : initialUsers;
          const user = userList.find((u: User) => u.id === parsed.currentUserId);
          if (user) setCurrentUser(user);
        }
      }
    } catch (e) {
      console.error('Error al cargar base de datos local:', e);
    }
  }, []);

  // Sincronizar en localStorage
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
          currentUserId: currentUser?.id || null
        })
      );
    } catch (e) {
      console.error('Error al persistir base de datos local:', e);
    }
  }, [users, departments, stages, projects, notifications, currentUser, isClient]);

  // LOGIN
  const login = (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    
    if (!found) {
      return { success: false, error: 'Usuario no encontrado con ese correo institucional.' };
    }
    
    // Si tiene contraseña configurada la validamos, de lo contrario default 'admin'
    const expectedPassword = found.password || 'admin';
    if (expectedPassword !== password.trim()) {
      return { success: false, error: 'Contraseña incorrecta. Verifica tus credenciales.' };
    }

    setCurrentUser(found);
    return { success: true };
  };

  // LOGOUT
  const logout = () => {
    setCurrentUser(null);
    setActiveView('board');
  };

  // CREAR PROYECTO
  const createProject = (data: {
    title: string;
    description: string;
    urgency: UrgencyLevel;
    targetDepartmentId: string;
    initialObservation?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'Sesión no iniciada' };
    
    const newCode = `PRJ-2026-${String(projects.length + 1).padStart(3, '0')}`;
    const targetDept = departments.find((d) => d.id === data.targetDepartmentId);
    const observation = data.initialObservation?.trim() || 'Apertura formal de expediente y pase inicial.';
    
    const initialHistory: DerivationHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStageId: stages[0]?.id || 'stage-1',
      toStageId: stages[0]?.id || 'stage-1',
      fromDepartmentId: currentUser.departmentId || data.targetDepartmentId,
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
      stageId: stages[0]?.id || 'stage-1',
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

    // Notificar al departamento asignado
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: data.targetDepartmentId,
      title: 'Nuevo Proyecto Asignado',
      message: `${currentUser.name} (${currentUser.role}) aperturó el proyecto "${data.title}" y lo derivó a ${targetDept?.name || 'tu área'}.`,
      projectId: newProject.id,
      projectTitle: newProject.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'NUEVO_PROYECTO'
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return { success: true };
  };

  // MARCAR COMO COMPLETADA
  const markAsCompleted = (projectId: string, observationText?: string) => {
    if (!currentUser) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const observation = observationText?.trim() || `El auxiliar ${currentUser.name} marcó la tarea como completada. Requiere control del Encargado.`;

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

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientDepartmentId: project.currentDepartmentId,
      recipientRole: 'ENCARGADO',
      title: 'Tarea Completada - Requiere Control',
      message: `${currentUser.name} completó su tarea en "${project.title}". Pendiente de control y pase por el Encargado.`,
      projectId: project.id,
      projectTitle: project.title,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'COMPLETADO'
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // MARCAR COMO CONTROLADO
  const markAsControlled = (projectId: string) => {
    if (!currentUser) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const observation = `Validado y CONTROLADO formalmente por ${currentUser.name} (${currentUser.role}). Listo para su derivación.`;

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

  // DERIVAR PROYECTO
  const deriveProject = (
    projectId: string,
    toStageId: string,
    toDepartmentId: string,
    observation: string
  ) => {
    if (!currentUser) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

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
              status: 'EN_PROCESO',
              lastObservation: observation.trim(),
              updatedAt: new Date().toISOString(),
              history: [historyItem, ...p.history]
            }
          : p
      )
    );

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

  // CAMBIAR URGENCIA
  const changeUrgency = (projectId: string, urgency: UrgencyLevel, reason: string) => {
    if (!currentUser) return;
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

  // ADMINISTRADOR: GESTIÓN DE CONFIGURACIÓN
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

  const deleteDepartment = (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
  };

  const addUser = (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    departmentId: string
  ) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      password: password.trim() || '123456',
      role,
      departmentId,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&auto=format&fit=crop&q=80`
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const deleteUser = (userId: string) => {
    if (userId === 'usr-admin') return; // Proteger cuenta admin
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateUserRole = (
    userId: string,
    newRole: UserRole,
    newDepartmentId: string,
    newPassword?: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            departmentId: newDepartmentId,
            ...(newPassword?.trim() ? { password: newPassword.trim() } : {})
          };
        }
        return u;
      })
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              role: newRole,
              departmentId: newDepartmentId,
              ...(newPassword?.trim() ? { password: newPassword.trim() } : {})
            }
          : null
      );
    }
  };

  // NOTIFICACIONES
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // RESET A BASE LIMPIA (SOLO ADMIN)
  const resetCleanDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(initialUsers);
    setDepartments(initialDepartments);
    setStages(initialStages);
    setProjects(initialProjects);
    setNotifications(initialNotifications);
    setCurrentUser(initialUsers[0]);
    setActiveView('board');
  };

  // Notificaciones no leídas pertinentes
  const unreadNotificationsCount = currentUser
    ? notifications.filter(
        (n) =>
          !n.read &&
          (!n.recipientDepartmentId || n.recipientDepartmentId === currentUser.departmentId) &&
          (!n.recipientRole || n.recipientRole === currentUser.role)
      ).length
    : 0;

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
        login,
        logout,
        createProject,
        markAsCompleted,
        markAsControlled,
        deriveProject,
        changeUrgency,
        updateStageTitle,
        addDepartment,
        deleteDepartment,
        addUser,
        deleteUser,
        updateUserRole,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetCleanDatabase
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
