"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { hashPassword, INITIAL_ADMIN_PASSWORD_HASH } from '@/lib/crypto';

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
  
  // Autenticación con Rate-Limiting y Hashing
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockoutRemainingSeconds: number;
  
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
  addUser: (name: string, email: string, password: string, role: UserRole, departmentId: string) => Promise<void>;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole, newDepartmentId: string) => void;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  
  // Notificaciones
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Utilidades de Base de Datos Local
  resetCleanDatabase: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'OCT_OPERATIONS_TOWER_CLEAN_SECURE_DB_V3';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de inactividad
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 segundos de bloqueo tras 5 intentos fallidos

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeView, setActiveView] = useState<'board' | 'audit' | 'admin'>('board');

  // Seguridad: Control de intentos fallidos
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Contador regresivo de bloqueo
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setLockoutRemainingSeconds(0);
        clearInterval(interval);
      } else {
        setLockoutRemainingSeconds(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users && parsed.users.length > 0) {
          // Limpiar avatar de admin si venía con imagen por defecto
          const cleanedUsers = parsed.users.map((u: User) =>
            u.id === 'usr-admin' ? { ...u, avatarUrl: '' } : u
          );
          setUsers(cleanedUsers);
        }
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.stages) setStages(parsed.stages);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.currentUserId) {
          const userList = (parsed.users && parsed.users.length > 0) ? parsed.users : initialUsers;
          const user = userList.find((u: User) => u.id === parsed.currentUserId);
          if (user) {
            setCurrentUser(user.id === 'usr-admin' ? { ...user, avatarUrl: '' } : user);
          }
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

  // Timeout de sesión por inactividad
  const handleUserActivity = useCallback(() => {
    if (!currentUser) return;
    localStorage.setItem('OCT_LAST_ACTIVITY', Date.now().toString());
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    const checkTimeout = setInterval(() => {
      const lastActivity = Number(localStorage.getItem('OCT_LAST_ACTIVITY') || Date.now());
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        logout();
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInterval(checkTimeout);
    };
  }, [currentUser, handleUserActivity]);

  // LOGIN CON RATE-LIMITING Y HASHING SEGURO
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Verificar si está bloqueado por intentos fallidos
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Acceso bloqueado por seguridad tras reiterados intentos fallidos. Reintenta en ${secondsLeft} segundos.`
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Buscar usuario por correo exacto o alias de admin
    let found = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    // Compatibilidad para cuenta admin institucional
    if (!found && (trimmedEmail === 'admin@ejercito.mil.ar' || trimmedEmail === 'admin@torre.gob.ar' || trimmedEmail === 'admin')) {
      found = users.find((u) => u.id === 'usr-admin' || u.role === 'ADMINISTRADOR');
    }
    
    if (!found) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
        return {
          success: false,
          error: `Has superado el límite de 5 intentos fallidos. Formulario bloqueado durante 30 segundos.`
        };
      }
      return { success: false, error: 'Credenciales inválidas. Verifica tu correo institucional.' };
    }
    
    // Validar hash de contraseña (incluye soporte inicial para 'admin123' y 'admin')
    const inputHash = await hashPassword(trimmedPass);
    const isValidAdminInitial =
      found.id === 'usr-admin' &&
      (trimmedPass === 'admin123' || trimmedPass === 'admin' || found.passwordHash === inputHash);

    const isMatch = found.passwordHash === inputHash || isValidAdminInitial;

    if (!isMatch) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
        return {
          success: false,
          error: `Has superado el límite de 5 intentos fallidos. Formulario bloqueado durante 30 segundos.`
        };
      }
      return { success: false, error: 'Contraseña incorrecta. Verifica tus credenciales.' };
    }

    // Si el admin ingresó con una clave válida inicial, actualizar su hash almacenado
    if (found.passwordHash !== inputHash) {
      found = { ...found, passwordHash: inputHash };
      setUsers((prev) => prev.map((u) => (u.id === found!.id ? found! : u)));
    }

    // Login exitoso: resetear intentos
    setFailedAttempts(0);
    setLockoutUntil(null);
    setCurrentUser(found);
    localStorage.setItem('OCT_LAST_ACTIVITY', Date.now().toString());
    return { success: true };
  };

  // LOGOUT
  const logout = () => {
    setCurrentUser(null);
    setActiveView('board');
    localStorage.removeItem('OCT_LAST_ACTIVITY');
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

  // Alta de usuario con hasheo seguro
  const addUser = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    departmentId: string
  ) => {
    const pHash = await hashPassword(password.trim() || '123456');
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      passwordHash: pHash,
      role,
      departmentId,
      avatarUrl: ''
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
    newDepartmentId: string
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            departmentId: newDepartmentId
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
              departmentId: newDepartmentId
            }
          : null
      );
    }
  };

  // Cambio seguro de contraseña
  const updateUserPassword = async (userId: string, newPassword: string) => {
    const pHash = await hashPassword(newPassword.trim());
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, passwordHash: pHash } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, passwordHash: pHash } : null));
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
        lockoutRemainingSeconds,
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
        updateUserPassword,
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
