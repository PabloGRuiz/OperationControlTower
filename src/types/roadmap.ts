export type UserRole = 'USUARIO' | 'ENCARGADO' | 'DIRECTOR' | 'ADMINISTRADOR';

export type UrgencyLevel = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type ProjectStatus = 'EN_PROCESO' | 'COMPLETADO_POR_USUARIO' | 'CONTROLADO';

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color classes for badges
}

export interface User {
  id: string;
  name: string;
  email: string;
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
// DATOS INICIALES REALISTAS PARA LA DEMO
// -------------------------------------------------------------

export const initialDepartments: Department[] = [
  { id: 'dep-dir', name: 'Dirección General de Proyectos', code: 'DIR_GRAL', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { id: 'dep-pres', name: 'Presupuesto y Finanzas', code: 'PRESUPUESTO', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'dep-leg', name: 'Dictamen Legal y Pliegos', code: 'LEGAL', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'dep-lic', name: 'Licitaciones y Contratos', code: 'LICITACIONES', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'dep-ops', name: 'Operaciones y Logística', code: 'OPERACIONES', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'dep-sis', name: 'Sistemas y Tecnología', code: 'SISTEMAS', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
];

export const initialStages: Stage[] = [
  { id: 'stage-1', title: '1. Apertura e Iniciación', order: 1, description: 'Alta en Dirección General y asignación inicial' },
  { id: 'stage-2', title: '2. Evaluación y Presupuesto', order: 2, description: 'Cálculo de partidas y viabilidad financiera' },
  { id: 'stage-3', title: '3. Dictamen Legal y Pliegos', order: 3, description: 'Confección y validación jurídica de pliegos' },
  { id: 'stage-4', title: '4. Licitación y Adjudicación', order: 4, description: 'Publicación, apertura de sobres y adjudicación' },
  { id: 'stage-5', title: '5. Ejecución Operativa', order: 5, description: 'Despliegue e implementación de insumos/servicios' },
  { id: 'stage-6', title: '6. Cierre y Rendición', order: 6, description: 'Auditoría final, recepción definitiva y balance' }
];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@torre.gob.ar',
    role: 'USUARIO',
    departmentId: 'dep-pres',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-2',
    name: 'Valeria Castro',
    email: 'valeria.castro@torre.gob.ar',
    role: 'ENCARGADO',
    departmentId: 'dep-pres',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-3',
    name: 'Dr. Roberto Varela',
    email: 'roberto.varela@torre.gob.ar',
    role: 'DIRECTOR',
    departmentId: 'dep-dir',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-4',
    name: 'Admin Sistemas',
    email: 'admin.operaciones@torre.gob.ar',
    role: 'ADMINISTRADOR',
    departmentId: 'dep-sis',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-5',
    name: 'Dra. Silvina Ramos',
    email: 'silvina.ramos@torre.gob.ar',
    role: 'ENCARGADO',
    departmentId: 'dep-leg',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-6',
    name: 'Ing. Lucas Benítez',
    email: 'lucas.benitez@torre.gob.ar',
    role: 'ENCARGADO',
    departmentId: 'dep-lic',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const initialProjects: Project[] = [
  {
    id: 'p-1',
    code: 'PRJ-2026-001',
    title: 'Adquisición de Insumos Críticos Hospitalarios',
    description: 'Licitación pública nacional para la compra de material descartable y equipamiento de terapia.',
    stageId: 'stage-2',
    currentDepartmentId: 'dep-pres',
    urgency: 'URGENTE',
    status: 'EN_PROCESO',
    createdBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR' },
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T14:30:00Z',
    lastObservation: 'Se remite para revisión presupuestaria y asignación de partida urgente 2026.',
    history: [
      {
        id: 'h-1',
        timestamp: '2026-08-20T10:00:00Z',
        fromStageId: 'stage-1',
        toStageId: 'stage-1',
        fromDepartmentId: 'dep-dir',
        toDepartmentId: 'dep-dir',
        performedBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        observation: 'Apertura formal de expediente prioritario por directiva ministerial.',
        actionType: 'CREACION'
      },
      {
        id: 'h-2',
        timestamp: '2026-08-22T11:15:00Z',
        fromStageId: 'stage-1',
        toStageId: 'stage-2',
        fromDepartmentId: 'dep-dir',
        toDepartmentId: 'dep-pres',
        performedBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        observation: 'Se remite para revisión presupuestaria y asignación de partida urgente 2026.',
        actionType: 'DERIVACION'
      }
    ]
  },
  {
    id: 'p-2',
    code: 'PRJ-2026-002',
    title: 'Modernización del Datacenter Central y Servidores Cloud',
    description: 'Renovación de infraestructura de cómputo, storage y licencias corporativas de contingencia.',
    stageId: 'stage-2',
    currentDepartmentId: 'dep-pres',
    urgency: 'ALTA',
    status: 'COMPLETADO_POR_USUARIO',
    createdBy: { id: 'usr-2', name: 'Valeria Castro', role: 'ENCARGADO' },
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-09-03T16:20:00Z',
    lastObservation: 'El auxiliar Carlos Mendoza finalizó el informe de partidas estimadas. Pendiente de control por el Encargado.',
    history: [
      {
        id: 'h-3',
        timestamp: '2026-08-25T09:00:00Z',
        fromStageId: 'stage-1',
        toStageId: 'stage-2',
        fromDepartmentId: 'dep-sis',
        toDepartmentId: 'dep-pres',
        performedBy: { id: 'usr-4', name: 'Admin Sistemas', role: 'ADMINISTRADOR', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
        observation: 'Pase a Presupuesto para validar compatibilidad con el techo fiscal anual.',
        actionType: 'DERIVACION'
      },
      {
        id: 'h-4',
        timestamp: '2026-09-03T16:20:00Z',
        fromStageId: 'stage-2',
        toStageId: 'stage-2',
        fromDepartmentId: 'dep-pres',
        toDepartmentId: 'dep-pres',
        performedBy: { id: 'usr-1', name: 'Carlos Mendoza', role: 'USUARIO', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        observation: 'Estimación presupuestaria terminada: $48.500.000 proyectados con cotizaciones preliminares.',
        actionType: 'COMPLETADO'
      }
    ]
  },
  {
    id: 'p-3',
    code: 'PRJ-2026-003',
    title: 'Pliego Licitatorio para Mantenimiento de Flota de Ambulancias',
    description: 'Servicio integral de mecánica preventiva y repuestos oficiales para vehículos operativos.',
    stageId: 'stage-3',
    currentDepartmentId: 'dep-leg',
    urgency: 'MEDIA',
    status: 'CONTROLADO',
    createdBy: { id: 'usr-2', name: 'Valeria Castro', role: 'ENCARGADO' },
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-01T17:45:00Z',
    lastObservation: 'Presupuesto validó partida presupuestaria. Se remite al área Legal para elaboración y control del pliego de bases y condiciones.',
    history: [
      {
        id: 'h-5',
        timestamp: '2026-09-01T17:45:00Z',
        fromStageId: 'stage-2',
        toStageId: 'stage-3',
        fromDepartmentId: 'dep-pres',
        toDepartmentId: 'dep-leg',
        performedBy: { id: 'usr-2', name: 'Valeria Castro', role: 'ENCARGADO', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
        observation: 'Presupuesto validó partida presupuestaria. Se remite al área Legal para elaboración y control del pliego de bases y condiciones.',
        actionType: 'DERIVACION'
      }
    ]
  },
  {
    id: 'p-4',
    code: 'PRJ-2026-004',
    title: 'Licitación Pública de Servicio de Seguridad Edilicia',
    description: 'Contratación de vigilancia física y monitoreo electrónico para 12 edificios del complejo gubernamental.',
    stageId: 'stage-4',
    currentDepartmentId: 'dep-lic',
    urgency: 'ALTA',
    status: 'EN_PROCESO',
    createdBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR' },
    createdAt: '2026-07-15T08:30:00Z',
    updatedAt: '2026-08-28T10:10:00Z',
    lastObservation: 'Pliego legal aprobado sin objeciones. Publicar llamado a licitación y fijar fecha de apertura de ofertas.',
    history: [
      {
        id: 'h-6',
        timestamp: '2026-08-28T10:10:00Z',
        fromStageId: 'stage-3',
        toStageId: 'stage-4',
        fromDepartmentId: 'dep-leg',
        toDepartmentId: 'dep-lic',
        performedBy: { id: 'usr-5', name: 'Dra. Silvina Ramos', role: 'ENCARGADO', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
        observation: 'Pliego legal aprobado sin objeciones. Publicar llamado a licitación y fijar fecha de apertura de ofertas.',
        actionType: 'DERIVACION'
      }
    ]
  },
  {
    id: 'p-5',
    code: 'PRJ-2026-005',
    title: 'Despliegue de Red Troncal de Fibra Óptica Interministerial',
    description: 'Tendido de 18 km de fibra subterránea para alta velocidad y enlace de respaldo.',
    stageId: 'stage-5',
    currentDepartmentId: 'dep-ops',
    urgency: 'BAJA',
    status: 'EN_PROCESO',
    createdBy: { id: 'usr-4', name: 'Admin Sistemas', role: 'ADMINISTRADOR' },
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-08-15T15:00:00Z',
    lastObservation: 'Contrato firmado con la adjudicataria. Fase de inicio de obra civil en vía pública.',
    history: [
      {
        id: 'h-7',
        timestamp: '2026-08-15T15:00:00Z',
        fromStageId: 'stage-4',
        toStageId: 'stage-5',
        fromDepartmentId: 'dep-lic',
        toDepartmentId: 'dep-ops',
        performedBy: { id: 'usr-6', name: 'Ing. Lucas Benítez', role: 'ENCARGADO', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
        observation: 'Contrato firmado con la adjudicataria. Fase de inicio de obra civil en vía pública.',
        actionType: 'DERIVACION'
      }
    ]
  },
  {
    id: 'p-6',
    code: 'PRJ-2026-006',
    title: 'Auditoría y Certificación de Normas ISO 9001:2015',
    description: 'Recepción del dictamen de auditoría de procesos de control de gestión y cierre contable.',
    stageId: 'stage-6',
    currentDepartmentId: 'dep-dir',
    urgency: 'BAJA',
    status: 'CONTROLADO',
    createdBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR' },
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
    lastObservation: 'Proyecto finalizado exitosamente con certificación extendida por 3 años.',
    history: [
      {
        id: 'h-8',
        timestamp: '2026-08-01T11:00:00Z',
        fromStageId: 'stage-5',
        toStageId: 'stage-6',
        fromDepartmentId: 'dep-ops',
        toDepartmentId: 'dep-dir',
        performedBy: { id: 'usr-3', name: 'Dr. Roberto Varela', role: 'DIRECTOR', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        observation: 'Proyecto finalizado exitosamente con certificación extendida por 3 años.',
        actionType: 'DERIVACION'
      }
    ]
  }
];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    recipientDepartmentId: 'dep-pres',
    title: 'Nuevo Proyecto Derivado',
    message: 'El Dr. Roberto Varela derivó "Adquisición de Insumos Críticos Hospitalarios" a Presupuesto y Finanzas.',
    projectId: 'p-1',
    projectTitle: 'Adquisición de Insumos Críticos Hospitalarios',
    timestamp: '2026-09-02T14:30:00Z',
    read: false,
    type: 'DERIVACION'
  },
  {
    id: 'notif-2',
    recipientRole: 'ENCARGADO',
    recipientDepartmentId: 'dep-pres',
    title: 'Tarea Marcada como Completada',
    message: 'El usuario Carlos Mendoza marcó como completada la etapa de cálculo para "Modernización del Datacenter Central". Requiere control.',
    projectId: 'p-2',
    projectTitle: 'Modernización del Datacenter Central y Servidores Cloud',
    timestamp: '2026-09-03T16:20:00Z',
    read: false,
    type: 'COMPLETADO'
  },
  {
    id: 'notif-3',
    recipientDepartmentId: 'dep-pres',
    title: 'Urgencia Actualizada a URGENTE',
    message: 'La Dirección General elevó la prioridad a URGENTE para el proyecto PRJ-2026-001.',
    projectId: 'p-1',
    projectTitle: 'Adquisición de Insumos Críticos Hospitalarios',
    timestamp: '2026-09-04T08:00:00Z',
    read: true,
    type: 'URGENCIA'
  }
];
