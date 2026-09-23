'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { appointmentService } from '@/services/appointmentService';
import { serviceService } from '@/services/serviceService';
import { Appointment } from '@/types/appointment';
import { Service } from '@/types/service';
import {
  INITIAL_PROVIDER_SERVICES,
  INITIAL_WEEKLY_SCHEDULE,
  ProviderCatalogService,
  DaySchedule,
} from '@/mocks/mockProviderData';
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  BarChart3,
  TrendingUp,
  Star,
  Settings,
  ListTodo,
} from 'lucide-react';

type ProviderTabType = 'agenda' | 'servicios' | 'horarios' | 'reportes' | 'perfil';

function ProviderDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State derived cleanly from searchParams
  const tabParam = searchParams.get('tab') as ProviderTabType;
  const activeTab: ProviderTabType = ['agenda', 'servicios', 'horarios', 'reportes', 'perfil'].includes(tabParam)
    ? tabParam
    : 'agenda';

  const handleTabChange = (tab: ProviderTabType) => {
    router.replace(`/dashboard/provider?tab=${tab}`, { scroll: false });
  };

  const currentDateLabel = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Feedback Notification
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Agenda State
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const data = await appointmentService.getProviderAppointments(user.id);
        if (isMounted) {
          setAppointments(data);
        }
      } catch (err) {
        console.error('Error cargando citas del proveedor:', err);
      }
    };

    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Services Catalog State
  const [services, setServices] = useState<ProviderCatalogService[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      if (!user) return;
      try {
        const data = await serviceService.getServicesByProvider(user.id);
        if (isMounted) {
          setServices(
            data.map((service: Service): ProviderCatalogService => ({
              id: service.id,
              name: service.name,
              durationMinutes: service.durationMinutes,
              price: service.price,
              reservationsCount: 0,
              isActive: service.isActive,
            }))
          );
        }
      } catch (err) {
        console.error('Error cargando servicios del proveedor:', err);
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(45);
  const [newServicePrice, setNewServicePrice] = useState(75000);

  // Schedule State
  const [schedules, setSchedules] = useState<DaySchedule[]>(INITIAL_WEEKLY_SCHEDULE);

  // Provider Profile Form State
  const [businessProfile, setBusinessProfile] = useState({
    businessName: 'Clínica Dental Del Valle',
    category: 'Salud',
    city: 'Bogotá',
    description:
      'Somos una clínica dental de alto nivel con más de 15 años de experiencia en Bogotá. Ofrecemos servicios de limpieza, ortodoncia y estética dental con tecnología de punta.',
    address: 'Carrera 13 #93-40, Chapinero, Bogotá',
    email: 'carlos.mendoza@clinicadelvalle.com',
    landline: '+57 601 234 5678',
    whatsapp: '+57 310 987 6543',
    website: 'www.clinicadelvalle.com',
    cancellationPolicy: '24 horas de anticipación',
  });

  // Services Handlers
  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setFeedbackMessage({
      type: 'success',
      text: 'Servicio eliminado del catálogo correctamente.',
    });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !user) return;

    try {
      const created = await serviceService.createService(
        {
          name: newServiceName,
          description: 'Servicio profesional certificado.',
          durationMinutes: newServiceDuration,
          price: newServicePrice,
          category: businessProfile.category || 'OTRO',
        },
        {
          id: user.id,
          name: user.name,
          businessName: user.businessName,
          city: user.city,
        }
      );

      setServices((prev) => [
        {
          id: created.id,
          name: created.name,
          durationMinutes: created.durationMinutes,
          price: created.price,
          reservationsCount: 0,
          isActive: created.isActive,
        },
        ...prev,
      ]);
      setFeedbackMessage({
        type: 'success',
        text: `Servicio "${created.name}" agregado exitosamente al catálogo.`,
      });
      setNewServiceName('');
      setIsAddServiceModalOpen(false);
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Ocurrió un error al guardar el servicio.',
      });
    }
  };

  // Schedule Handlers
  const handleToggleDay = (dayName: string) => {
    setSchedules((prev) =>
      prev.map((d) => (d.dayName === dayName ? { ...d, isEnabled: !d.isEnabled } : d))
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage({
      type: 'success',
      text: '¡Cambios del perfil guardados con éxito! Ya se reflejan en el catálogo.',
    });
  };

  const activeServicesCount = services.filter((s) => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Toast Notification */}
        {feedbackMessage && (
          <div
            className={`mb-6 flex items-center justify-between p-4 rounded-xl text-xs font-semibold transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Banner - Exact Figma Design */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center bg-[#025a4e] text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              CD
            </span>
            <span className="text-xs text-slate-400 font-medium">Panel de proveedor</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {user?.businessName || businessProfile.businessName}
              </h1>
              <p className="text-xs text-slate-400 font-normal mt-1">
                {currentDateLabel}
              </p>
            </div>

            <Link
              href="/services"
              className="text-xs text-slate-400 hover:text-[#025a4e] transition-colors self-start sm:self-auto font-medium"
            >
              Ver como cliente →
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards - Exact Figma Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Citas hoy */}
          <button
            onClick={() => handleTabChange('agenda')}
            className={`bg-white border rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'agenda' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mb-2">
              Citas hoy
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              0
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              0 confirmadas · 0 pendientes
            </p>
          </button>

          {/* Card 2: Esta semana */}
          <button
            onClick={() => handleTabChange('agenda')}
            className={`bg-white border rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'agenda' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-2">
              Esta semana
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              0
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ↑ 0% vs semana anterior
            </p>
          </button>

          {/* Card 3: Ingresos est. */}
          <button
            onClick={() => handleTabChange('reportes')}
            className={`bg-white border rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'reportes' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mb-2">
              Ingresos est.
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              $0K
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Citas confirmadas hoy
            </p>
          </button>

          {/* Card 4: Servicios activos */}
          <button
            onClick={() => handleTabChange('servicios')}
            className={`bg-white border rounded-2xl p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'servicios' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mb-2">
              Servicios activos
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {activeServicesCount}/{services.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              en catálogo
            </p>
          </button>
        </div>

        {/* Tab Navigation Selector Pills */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 pb-3 overflow-x-auto">
          <button
            onClick={() => handleTabChange('agenda')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'agenda'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Agenda ({appointments.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('servicios')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'servicios'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Servicios ({services.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('horarios')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'horarios'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Horarios</span>
          </button>

          <button
            onClick={() => handleTabChange('reportes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'reportes'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reportes</span>
          </button>

          <button
            onClick={() => handleTabChange('perfil')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'perfil'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Mi perfil</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: AGENDA (media_1789091549628)
           ======================================================== */}
        {activeTab === 'agenda' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-slate-900">
                Próximas citas
              </h2>
              <span className="text-xs text-slate-400">
                {appointments.length} agendadas
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-slate-50">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left: Avatar & Client info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#eafaf5] text-[#025a4e] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {apt.clientName
                        .split(' ')
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">
                        {apt.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-normal">
                        {apt.serviceName}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date / Time & Status */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {apt.displayDate || apt.date}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal">
                        {apt.displayTime || apt.time}
                      </p>
                    </div>

                    {apt.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#eafaf5] text-[#025a4e]">
                        Confirmada
                      </span>
                    ) : apt.status === 'PENDING' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309]">
                        Pendiente
                      </span>
                    ) : apt.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600">
                        Cancelada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        Completada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: SERVICIOS (media_1789091549671)
           ======================================================== */}
        {activeTab === 'servicios' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-slate-900">
                Catálogo de servicios
              </h2>
              <button
                onClick={() => setIsAddServiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#025a4e] hover:bg-[#03483e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Agregar servicio</span>
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-4 px-6">
                        Servicio
                      </th>
                      <th scope="col" className="py-4 px-6">
                        Duración
                      </th>
                      <th scope="col" className="py-4 px-6">
                        Precio
                      </th>
                      <th scope="col" className="py-4 px-6">
                        Reservas
                      </th>
                      <th scope="col" className="py-4 px-6 text-center">
                        Activo
                      </th>
                      <th scope="col" className="py-4 px-6 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Servicio */}
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {srv.name}
                        </td>

                        {/* Duración */}
                        <td className="py-4 px-6 text-slate-400 font-normal">
                          {srv.durationMinutes} min
                        </td>

                        {/* Precio */}
                        <td className="py-4 px-6 font-bold text-[#025a4e]">
                          ${srv.price.toLocaleString('es-CO')}
                        </td>

                        {/* Reservas */}
                        <td className="py-4 px-6 text-slate-400 font-normal">
                          {srv.reservationsCount} reservas
                        </td>

                        {/* Activo Toggle */}
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleService(srv.id)}
                            className={`w-10 h-5 inline-flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                              srv.isActive ? 'bg-[#025a4e]' : 'bg-slate-200'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                                srv.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Acciones: Delete */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            title="Eliminar servicio"
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: HORARIOS (media_1789091549660)
           ======================================================== */}
        {activeTab === 'horarios' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-serif text-base font-bold text-slate-900">
                Bloques de disponibilidad semanal
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Define hasta 3 bloques de atención por día (ej. mañana y tarde)
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
              {schedules.map((day) => (
                <div
                  key={day.dayName}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  {/* Left: Toggle & Day name */}
                  <div className="flex items-center gap-3 w-32 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(day.dayName)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                        day.isEnabled ? 'bg-[#025a4e]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          day.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-bold ${day.isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                      {day.dayName}
                    </span>
                  </div>

                  {/* Right: Blocks List */}
                  {day.isEnabled ? (
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      {day.blocks.map((b) => (
                        <div key={b.id} className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.color === 'blue'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.label}
                          </span>

                          <div className="flex items-center gap-1.5 bg-[#fafafa] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                            <span>{b.startTime}</span>
                            <Clock className="w-3 h-3 text-slate-400" />
                          </div>

                          <span className="text-slate-300 text-xs">→</span>

                          <div className="flex items-center gap-1.5 bg-[#fafafa] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                            <span>{b.endTime}</span>
                            <Clock className="w-3 h-3 text-slate-400" />
                          </div>

                          <button
                            title="Quitar bloque"
                            className="text-slate-300 hover:text-rose-500 text-xs px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {day.blocks.length < 3 && (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-[#025a4e] hover:underline cursor-pointer"
                        >
                          + Agregar bloque
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 text-xs text-slate-400 italic">
                      Cerrado todo el día
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: REPORTES (Executive Financial & Operational Analytics)
           ======================================================== */}
        {activeTab === 'reportes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900">
                  Reportes y métricas del negocio
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Resumen de facturación, citas y rendimiento operativo
                </p>
              </div>

              <span className="text-xs font-semibold text-[#025a4e] bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                Septiembre 2026
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Facturación</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-serif text-2xl font-bold text-slate-900">$3.480.000</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ 14% vs mes anterior</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Citas Completadas</span>
                  <CalendarDays className="w-4 h-4 text-[#025a4e]" />
                </div>
                <p className="font-serif text-2xl font-bold text-slate-900">118</p>
                <p className="text-[11px] text-slate-400 mt-1">94% tasa de asistencia</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Ocupación</span>
                  <Clock className="w-4 h-4 text-sky-600" />
                </div>
                <p className="font-serif text-2xl font-bold text-slate-900">87%</p>
                <p className="text-[11px] text-sky-600 font-medium mt-1">Óptima productividad</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Satisfacción</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <p className="font-serif text-2xl font-bold text-slate-900">4.9 / 5.0</p>
                <p className="text-[11px] text-slate-400 mt-1">218 opiniones de clientes</p>
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-sm font-bold text-slate-900 mb-4">
                Desglose por servicio más demandado
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Limpieza dental profesional (42 citas)</span>
                    <span className="text-[#025a4e]">$3.360.000 (38%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#025a4e] h-full rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Blanqueamiento dental (28 citas)</span>
                    <span className="text-[#025a4e]">$5.040.000 (32%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Radiografía panorámica (33 citas)</span>
                    <span className="text-[#025a4e]">$1.485.000 (18%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span>Consulta de ortodoncia (15 citas)</span>
                    <span className="text-[#025a4e]">$900.000 (12%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: MI PERFIL (media_1789091549616 & media_1789091549590)
           ======================================================== */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
            {/* Card 1: Logo o foto del negocio */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-sm font-bold text-slate-900">
                Logo o foto del negocio
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5 mb-4">
                Aparece como avatar en tu perfil y en las confirmaciones de cita. Recomendado: 400×400 px.
              </p>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#eafaf5] text-[#025a4e] font-bold text-xl flex items-center justify-center shadow-sm">
                    CD
                  </div>
                  <button
                    type="button"
                    title="Editar logo"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#025a4e] text-white flex items-center justify-center shadow-sm"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => alert('Selector de archivo')}
                    className="text-xs font-bold text-[#025a4e] hover:underline"
                  >
                    Subir imagen
                  </button>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG o JPG · máx. 2 MB · cuadrada
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Datos del negocio */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-sm font-bold text-slate-900 mb-4">
                Datos del negocio
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nombre del negocio
                  </label>
                  <input
                    type="text"
                    value={businessProfile.businessName}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, businessName: e.target.value })
                    }
                    className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={businessProfile.category}
                      onChange={(e) =>
                        setBusinessProfile({ ...businessProfile, category: e.target.value })
                      }
                      className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                    >
                      <option value="Salud">🏥 Salud</option>
                      <option value="Belleza">✂️ Belleza</option>
                      <option value="Deportes">🏋️ Deportes</option>
                      <option value="Bienestar">🧘 Bienestar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={businessProfile.city}
                      onChange={(e) =>
                        setBusinessProfile({ ...businessProfile, city: e.target.value })
                      }
                      className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Descripción del negocio
                  </label>
                  <textarea
                    rows={3}
                    value={businessProfile.description}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, description: e.target.value })
                    }
                    className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={businessProfile.address}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, address: e.target.value })
                    }
                    className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Datos de contacto */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-sm font-bold text-slate-900">
                Datos de contacto
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5 mb-4">
                Visibles para clientes que tengan citas confirmadas.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={businessProfile.email}
                        onChange={(e) =>
                          setBusinessProfile({ ...businessProfile, email: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Teléfono fijo
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={businessProfile.landline}
                        onChange={(e) =>
                          setBusinessProfile({ ...businessProfile, landline: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      WhatsApp
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={businessProfile.whatsapp}
                        onChange={(e) =>
                          setBusinessProfile({ ...businessProfile, whatsapp: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Sitio Web
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={businessProfile.website}
                        onChange={(e) =>
                          setBusinessProfile({ ...businessProfile, website: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Política de cancelación */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-sm font-bold text-slate-900">
                Política de cancelación
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5 mb-3">
                Los clientes podrán cancelar sin cargo hasta este tiempo antes de la cita.
              </p>

              <select
                value={businessProfile.cancellationPolicy}
                onChange={(e) =>
                  setBusinessProfile({ ...businessProfile, cancellationPolicy: e.target.value })
                }
                className="w-full sm:w-72 bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
              >
                <option value="12 horas de anticipación">12 horas de anticipación</option>
                <option value="24 horas de anticipación">24 horas de anticipación</option>
                <option value="48 horas de anticipación">48 horas de anticipación</option>
              </select>
            </div>

            {/* Footer Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-400">
                Los cambios en el perfil se reflejan en el catálogo en minutos.
              </span>
              <button
                type="submit"
                className="bg-[#025a4e] hover:bg-[#03483e] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all self-end sm:self-auto"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal: Agregar Servicio */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Agregar nuevo servicio
              </h3>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Limpieza dental profunda"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    step={5}
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#025a4e] hover:bg-[#03483e] text-white shadow-sm transition-colors"
                >
                  Guardar servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <AuthGuard allowedRoles={['PROVIDER']}>
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
          </div>
        }
      >
        <ProviderDashboardContent />
      </React.Suspense>
    </AuthGuard>
  );
}
