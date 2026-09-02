export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Department = 'Sistemas' | 'Licitaciones' | 'Operaciones' | 'Legal';

export interface Task {
  id: string;
  title: string;
  department: Department;
  priority: Priority;
  assignedTo: {
    name: string;
    avatarUrl: string;
  };
  columnId: 'month-1' | 'month-2' | 'month-3' | 'done';
}

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Licitación de insumos médicos',
    department: 'Licitaciones',
    priority: 'HIGH',
    assignedTo: { name: 'Ana Silva', avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
    columnId: 'month-1'
  },
  {
    id: 't2',
    title: 'Renovación de servidores',
    department: 'Sistemas',
    priority: 'HIGH',
    assignedTo: { name: 'Carlos Gomez', avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
    columnId: 'month-1'
  },
  {
    id: 't3',
    title: 'Auditoría legal trimestral',
    department: 'Legal',
    priority: 'MEDIUM',
    assignedTo: { name: 'Laura Paz', avatarUrl: 'https://i.pravatar.cc/150?u=laura' },
    columnId: 'month-2'
  },
  {
    id: 't4',
    title: 'Mantenimiento de flota de vehículos',
    department: 'Operaciones',
    priority: 'LOW',
    assignedTo: { name: 'Jorge Ruiz', avatarUrl: 'https://i.pravatar.cc/150?u=jorge' },
    columnId: 'month-2'
  },
  {
    id: 't5',
    title: 'Actualización de software contable',
    department: 'Sistemas',
    priority: 'MEDIUM',
    assignedTo: { name: 'Ana Silva', avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
    columnId: 'month-3'
  },
  {
    id: 't6',
    title: 'Contrato de nuevos proveedores',
    department: 'Licitaciones',
    priority: 'HIGH',
    assignedTo: { name: 'Carlos Gomez', avatarUrl: 'https://i.pravatar.cc/150?u=carlos' },
    columnId: 'month-3'
  },
  {
    id: 't7',
    title: 'Capacitación en seguridad',
    department: 'Operaciones',
    priority: 'LOW',
    assignedTo: { name: 'Laura Paz', avatarUrl: 'https://i.pravatar.cc/150?u=laura' },
    columnId: 'done'
  },
  {
    id: 't8',
    title: 'Revisión de normativas ISO',
    department: 'Legal',
    priority: 'MEDIUM',
    assignedTo: { name: 'Jorge Ruiz', avatarUrl: 'https://i.pravatar.cc/150?u=jorge' },
    columnId: 'done'
  }
];
