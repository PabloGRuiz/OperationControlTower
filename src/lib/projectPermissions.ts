import { Project, User } from '@/types/roadmap';

export type ProjectUserRelationship =
  | 'ASSIGNED_CURRENT'    // Asignado actualmente a su departamento o al usuario
  | 'DERIVED_PREVIOUSLY'  // Derivado previamente por el usuario o por su departamento a otra área
  | 'CREATED_BY_USER'     // Creado/iniciado por el usuario
  | 'SUPERVISOR_GLOBAL'   // Visión global por rol Administrador o Director
  | 'NONE';

/**
 * Evalúa el tipo de relación/competencia entre un usuario y un proyecto.
 */
export function getProjectUserRelationship(
  project: Project,
  user: User | null
): ProjectUserRelationship {
  if (!user) return 'NONE';

  // 1. Asignado actualmente al área del usuario o específicamente al usuario
  const isDirectUser = Boolean(project.assignedUserId && project.assignedUserId === user.id);
  const isCurrentDept = Boolean(user.departmentId && project.currentDepartmentId === user.departmentId);
  if (isDirectUser || isCurrentDept) {
    return 'ASSIGNED_CURRENT';
  }

  // 2. Derivado previamente a otro departamento (por el usuario o por su departamento)
  const hasDerived = Boolean(
    project.history &&
      project.history.some((h) => {
        const isPerformer = h.performedBy && h.performedBy.id === user.id;
        const isFromUserDept = Boolean(user.departmentId && h.fromDepartmentId === user.departmentId);
        const isDerivation = h.actionType === 'DERIVACION';
        const isToOtherDept = user.departmentId ? h.toDepartmentId !== user.departmentId : true;
        return (isPerformer || isFromUserDept) && (isDerivation || isToOtherDept);
      })
  );

  if (hasDerived) {
    return 'DERIVED_PREVIOUSLY';
  }

  // 3. Creado por el usuario (si aún no fue asignado a su área o si se envió directo a otra)
  if (project.createdBy && project.createdBy.id === user.id) {
    return 'CREATED_BY_USER';
  }

  // 4. Roles directivos con supervisión global (Administrador y Director)
  if (user.role === 'ADMINISTRADOR' || user.role === 'DIRECTOR') {
    return 'SUPERVISOR_GLOBAL';
  }

  return 'NONE';
}

/**
 * Determina si un proyecto le compete al usuario (asignado o derivado previamente).
 */
export function isProjectCompetentForUser(
  project: Project,
  user: User | null
): boolean {
  if (!user) return false;
  const rel = getProjectUserRelationship(project, user);
  return rel !== 'NONE';
}

/**
 * Filtra los proyectos visibles para el usuario según su rol y modo de filtro.
 */
export function filterProjectsForUser(
  projects: Project[],
  user: User | null,
  forceFilterCompetent: boolean = false
): Project[] {
  if (!user) return [];

  // Si se fuerza el filtro de competencia o si el usuario es USUARIO o ENCARGADO
  const shouldFilterCompetent =
    forceFilterCompetent || user.role === 'USUARIO' || user.role === 'ENCARGADO';

  if (!shouldFilterCompetent) {
    // Administrador o Director en modo global
    return projects;
  }

  return projects.filter((project) => isProjectCompetentForUser(project, user));
}
