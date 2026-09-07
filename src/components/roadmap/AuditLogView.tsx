"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Building2,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Flame,
  UserCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { isProjectCompetentForUser } from '@/lib/projectPermissions';

export default function AuditLogView() {
  const { projects, stages, departments, currentUser } = useProjectControlTower();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const isSupervisorGlobal = currentUser?.role === 'ADMINISTRADOR' || currentUser?.role === 'DIRECTOR';
  const relevantProjects = isSupervisorGlobal
    ? projects
    : projects.filter((p) => isProjectCompetentForUser(p, currentUser));

  // Aplanar todos los historiales de los proyectos correspondientes y ordenarlos por fecha descendente
  const allLogs = relevantProjects.flatMap((project) =>
    project.history.map((item) => ({
      ...item,
      projectCode: project.code,
      projectTitle: project.title,
      projectId: project.id
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      log.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(search.toLowerCase()) ||
      log.observation.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' ||
      log.fromDepartmentId === selectedDept ||
      log.toDepartmentId === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Registro Activo de Auditoría y Trazabilidad
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Historial inmutable de pases, derivaciones interdepartamentales, controles y observaciones oficiales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs px-3 py-1 font-bold bg-slate-50">
            {filteredLogs.length} movimientos registrados
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código de expediente, título de proyecto, funcionario u observación..."
            className="pl-10 h-11 rounded-xl bg-white text-sm"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedDept} onValueChange={(v) => v && setSelectedDept(v)}>
            <SelectTrigger className="h-11 rounded-xl bg-white text-sm">
              <SelectValue placeholder="Filtrar por Departamento" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Todos los Departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Expediente</th>
                <th className="py-3.5 px-4">Funcionario Responsable</th>
                <th className="py-3.5 px-4">Pase / Derivación</th>
                <th className="py-3.5 px-4">Observación Oficial Registrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const toStageTitle = stages.find((s) => s.id === log.toStageId)?.title;
                const toDept = departments.find((d) => d.id === log.toDepartmentId);

                const dateObj = new Date(log.timestamp);
                const formattedDate = dateObj.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      <div className="font-bold text-slate-800">{formattedDate}</div>
                      <div className="text-[11px] text-slate-400">{formattedTime} hs</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                        {log.projectCode}
                      </span>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                        {log.projectTitle}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 border border-slate-200">
                          <AvatarImage src={log.performedBy.avatarUrl} alt={log.performedBy.name} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {log.performedBy.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {log.performedBy.name}
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700">
                            {log.performedBy.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{toStageTitle}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${toDept?.color}`}>
                          {toDept?.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700 font-sans max-w-md">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 italic leading-relaxed">
                        "{log.observation}"
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
