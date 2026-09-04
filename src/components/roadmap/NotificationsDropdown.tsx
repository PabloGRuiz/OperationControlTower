"use client";

import React, { useState } from 'react';
import { useProjectControlTower } from '@/context/ProjectContext';
import {
  Bell,
  CheckCheck,
  Building2,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsDropdownProps {
  onSelectProject?: (projectId: string) => void;
}

export default function NotificationsDropdown({ onSelectProject }: NotificationsDropdownProps) {
  const {
    notifications,
    currentUser,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useProjectControlTower();

  const [isOpen, setIsOpen] = useState(false);

  // Filtrar notificaciones dirigidas al depto del usuario, a su rol o globales
  const relevantNotifications = notifications.filter(
    (n) =>
      (!currentUser || !n.recipientDepartmentId || n.recipientDepartmentId === currentUser.departmentId) &&
      (!currentUser || !n.recipientRole || n.recipientRole === currentUser.role)
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'DERIVACION':
        return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case 'COMPLETADO':
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      case 'CONTROLADO':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'URGENCIA':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'NUEVO_PROYECTO':
        return <FolderPlus className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-4.5 h-4.5 text-slate-700" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white shadow-xs animate-in zoom-in-50">
            {unreadNotificationsCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header del centro de notificaciones */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Notificaciones de Área</span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadNotificationsCount} nuevas
                  </span>
                )}
              </div>

              {relevantNotifications.length > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar leídas
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {relevantNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600">No hay notificaciones</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Las derivaciones dirigidas a tu departamento aparecerán aquí.
                  </p>
                </div>
              ) : (
                relevantNotifications.map((notif) => {
                  const formattedTime = new Date(notif.timestamp).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (onSelectProject) onSelectProject(notif.projectId);
                        setIsOpen(false);
                      }}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h5 className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {formattedTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
