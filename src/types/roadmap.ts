import { INITIAL_ADMIN_PASSWORD_HASH, INITIAL_ADMIN123_PASSWORD_HASH } from '@/lib/crypto';

export type UserRole = 'USUARIO' | 'ENCARGADO' | 'DIRECTOR' | 'ADMINISTRADOR';

export type UrgencyLevel = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type ProjectStatus = 'EN_PROCESO' | 'COMPLETADO_POR_USUARIO' | 'CONTROLADO';

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string; // Clases Tailwind para badges
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Almacenamiento seguro con hash SHA-256 + Salt
  role: UserRole;
  departmentId: string;
  avatarUrl: string;
}

export interface Stage {
  id: string;
  title: string;
  order: number;
  description: string;
}

export interface DerivationHistoryItem {
  id: string;
  timestamp: string;
  fromStageId: string;
  toStageId: string;
  fromDepartmentId: string;
  toDepartmentId: string;
  performedBy: {
    id: string;
    name: string;
    role: UserRole;
    avatarUrl: string;
  };
  observation: string;
  actionType: 'CREACION' | 'DERIVACION' | 'COMPLETADO' | 'CONTROLADO' | 'CAMBIO_URGENCIA';
}

export interface Project {
  id: string;
  code: string; // ej: PRJ-2026-001
  title: string;
  description: string;
  stageId: string;
  currentDepartmentId: string;
  assignedUserId?: string;
  urgency: UrgencyLevel;
  status: ProjectStatus;
  createdBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
  lastObservation: string;
  history: DerivationHistoryItem[];
}

export interface Notification {
  id: string;
  recipientDepartmentId?: string;
  recipientRole?: UserRole;
  recipientUserId?: string;
  title: string;
  message: string;
  projectId: string;
  projectTitle: string;
  timestamp: string;
  read: boolean;
  type: 'DERIVACION' | 'COMPLETADO' | 'CONTROLADO' | 'URGENCIA' | 'NUEVO_PROYECTO';
}

// -------------------------------------------------------------
// BASE DE DATOS INICIAL LIMPIA Y SEGURA (ADMIN CON PASSWORD HASH)
// -------------------------------------------------------------

export const initialStages: Stage[] = [
  { id: 'stage-1', title: '1. Apertura e Iniciación', order: 1, description: 'Apertura formal de expediente y asignación de área' },
  { id: 'stage-2', title: '2. Evaluación y Presupuesto', order: 2, description: 'Cálculo de partidas y viabilidad financiera' },
  { id: 'stage-3', title: '3. Dictamen Legal y Pliegos', order: 3, description: 'Confección y validación jurídica de pliegos' },
  { id: 'stage-4', title: '4. Licitación y Adjudicación', order: 4, description: 'Publicación, apertura de sobres y adjudicación' },
  { id: 'stage-5', title: '5. Ejecución Operativa', order: 5, description: 'Implementación, entrega de bienes o prestación' },
  { id: 'stage-6', title: '6. Cierre y Rendición', order: 6, description: 'Auditoría final, recepción definitiva y balance' }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'Administrador General',
    email: 'admin@ejercito.mil.ar',
    passwordHash: INITIAL_ADMIN123_PASSWORD_HASH,
    role: 'ADMINISTRADOR',
    departmentId: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  }
];

export const initialDepartments: Department[] = [];

export const initialProjects: Project[] = [];

export const initialNotifications: Notification[] = [];
