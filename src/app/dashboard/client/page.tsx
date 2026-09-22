'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { appointmentService } from '@/services/appointmentService';
import { Appointment, HistoryAppointment } from '@/types/appointment';
import {
  Calendar,
  Check,
  Building2,
  Plus,
  AlertCircle,
  X,
  CheckCircle2,
  Upload,
  CalendarDays,
  Clock,
  User,
} from 'lucide-react';

type TabType = 'citas' | 'historial' | 'perfil';

function ClientDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State derived directly from searchParams
  const tabParam = searchParams.get('tab') as TabType;
  const activeTab: TabType = ['citas', 'historial', 'perfil'].includes(tabParam)
    ? tabParam
    : 'citas';

  const handleTabChange = (tab: TabType) => {
    router.replace(`/dashboard/client?tab=${tab}`, { scroll: false });
  };

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // El historial se deriva de las citas reales del usuario (COMPLETED/CANCELLED),
  // en vez de datos de ejemplo fijos que aparecían para cualquier cuenta.
  const historyList: HistoryAppointment[] = appointments
    .filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED')
    .map((a) => ({
      id: a.id,
      providerName: a.providerName,
      serviceName: a.serviceName,
      date: a.displayDate || a.date,
      totalPrice: a.price,
      status: a.status === 'COMPLETED' ? 'Completada' : 'Cancelada',
    }));

  // Modals & Feedback
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || 'Ana García',
    email: user?.email || 'ana.garcia@gmail.com',
    phone: '+57 310 4567890',
    birthDate: '14 / 05 / 1992',
    city: 'Bogotá',
    gender: 'Femenino',
  });

  // Notification Preferences State
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        const data = await appointmentService.getClientAppointments(user.id);
        if (isMounted) {
          setAppointments(data);
        }
      } catch (err) {
        console.error('Error cargando citas del cliente:', err);
      }
    };

    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Appointment Actions
  const handleCancelAppointment = async () => {
    if (!cancelModalApt) return;
    try {
      await appointmentService.cancelAppointment(cancelModalApt.id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === cancelModalApt.id ? { ...a, status: 'CANCELLED' } : a))
      );
      setFeedbackMessage({
        type: 'success',
        text: `Tu cita en ${cancelModalApt.providerName} ha sido cancelada correctamente.`,
      });
      setCancelModalApt(null);
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Ocurrió un error al intentar cancelar la cita.',
      });
    }
  };

  const handleRescheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalApt || !newDate || !newTime) return;
    try {
      const updated = await appointmentService.rescheduleAppointment(
        rescheduleModalApt.id,
        newDate,
        newTime
      );
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setFeedbackMessage({
        type: 'success',
        text: `Cita reprogramada con éxito para el ${newDate} a las ${newTime}.`,
      });
      setRescheduleModalApt(null);
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Ocurrió un error al reprogramar la cita.',
      });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage({
      type: 'success',
      text: '¡Datos personales y preferencias guardados exitosamente!',
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedbackMessage({
        type: 'error',
        text: 'La nueva contraseña y la confirmación no coinciden.',
      });
      return;
    }
    setFeedbackMessage({
      type: 'success',
      text: '¡Contraseña actualizada correctamente!',
    });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const activeAppointmentsCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  ).length;

  const completedAppointmentsCount = appointments.filter(
    (a) => a.status === 'COMPLETED'
  ).length;

  const visitedBusinessesCount = new Set(
    appointments
      .filter((a) => a.status === 'COMPLETED')
      .map((a) => a.providerId)
  ).size;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AG';

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
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

        {/* Header Profile Section - Exact Figma Design */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#025a4e] text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {profileForm.fullName || 'Ana García'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal">
                Panel de cliente
              </p>
            </div>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-1.5 bg-[#025a4e] hover:bg-[#03483e] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva reserva</span>
          </Link>
        </div>

        {/* Metric Cards - 3 Columns (Exact Figma Design) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Card 1: Citas activas */}
          <button
            onClick={() => handleTabChange('citas')}
            className={`bg-white border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'citas' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#eef6ff] flex items-center justify-center text-[#3b82f6] mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-serif text-4xl font-bold text-slate-900 mb-1">
              {activeAppointmentsCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Citas activas
            </span>
          </button>

          {/* Card 2: Completadas */}
          <button
            onClick={() => handleTabChange('historial')}
            className={`bg-white border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'historial' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#eafaf5] flex items-center justify-center text-[#10b981] mb-3">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-serif text-4xl font-bold text-slate-900 mb-1">
              {completedAppointmentsCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Completadas
            </span>
          </button>

          {/* Card 3: Negocios visitados */}
          <button
            onClick={() => handleTabChange('historial')}
            className={`bg-white border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
              activeTab === 'historial' ? 'border-[#025a4e]/40 ring-2 ring-[#025a4e]/10' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#8b5cf6] mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-serif text-4xl font-bold text-slate-900 mb-1">
              {visitedBusinessesCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Negocios visitados
            </span>
          </button>
        </div>

        {/* Tab Switcher Selector */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => handleTabChange('citas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'citas'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mis citas ({activeAppointmentsCount})</span>
          </button>

          <button
            onClick={() => handleTabChange('historial')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'historial'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Historial ({historyList.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('perfil')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'perfil'
                ? 'bg-[#025a4e] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mi perfil</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: MIS CITAS (Upcoming Appointments Stack)
           ======================================================== */}
        {activeTab === 'citas' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 w-full sm:w-auto">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          apt.imageUrl ||
                          'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop'
                        }
                        alt={apt.providerName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {apt.providerName}
                        </h3>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                          {apt.serviceName}
                        </p>

                        {/* Date, Time, Duration and Price */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-normal mt-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>
                            {apt.displayDate || apt.date} ·{' '}
                            {apt.displayTime || apt.time} · {apt.durationMinutes} min
                          </span>
                          <span className="font-bold text-slate-900 ml-1">
                            ${apt.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {apt.status !== 'CANCELLED' ? (
                        <div className="flex items-center gap-2 mt-3.5">
                          <button
                            onClick={() => setCancelModalApt(apt)}
                            className="text-xs font-normal text-rose-500 hover:text-rose-600 border border-rose-200 hover:bg-rose-50/50 rounded-lg px-3 py-1 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              setRescheduleModalApt(apt);
                              setNewDate(apt.date || '2026-09-15');
                              setNewTime(apt.displayTime || '10:00 AM');
                            }}
                            className="text-xs font-normal text-slate-600 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1 transition-colors"
                          >
                            Reprogramar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3.5">
                          <span className="text-xs text-rose-500 italic">
                            Esta reserva ha sido cancelada
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Badge */}
                  <div className="sm:self-start mt-1 sm:mt-0">
                    {apt.status === 'CONFIRMED' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#eafaf5] text-[#025a4e]">
                        Confirmada
                      </span>
                    )}
                    {apt.status === 'PENDING' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#b45309]">
                        Pendiente
                      </span>
                    )}
                    {apt.status === 'CANCELLED' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                        Cancelada
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
                  No tienes reservas programadas
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  Explora nuestros servicios disponibles y agenda tu próxima cita.
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 bg-[#025a4e] hover:bg-[#03483e] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Explorar servicios</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: HISTORIAL (Exact Table from Figma media_1789091155232)
           ======================================================== */}
        {activeTab === 'historial' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="py-4 px-6">
                      Proveedor
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Servicio
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Fecha
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Total
                    </th>
                    <th scope="col" className="py-4 px-6 text-right">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {historyList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Proveedor */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.providerName}
                      </td>

                      {/* Servicio */}
                      <td className="py-4 px-6 text-slate-400 font-normal">
                        {item.serviceName}
                      </td>

                      {/* Fecha */}
                      <td className="py-4 px-6 text-slate-400 font-normal">
                        {item.date}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ${item.totalPrice.toLocaleString('es-CO')}
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6 text-right">
                        {item.status === 'Completada' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Completada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-500">
                            Cancelada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MI PERFIL (Exact 2-Column Form from Figma media_1789091155262)
           ======================================================== */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left Column: Avatar & Cambiar Contraseña */}
            <div className="space-y-6">
              {/* Avatar Profile Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                {/* Avatar with upload badge */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-[#025a4e] text-white flex items-center justify-center font-bold text-2xl tracking-tight shadow-sm">
                    {initials}
                  </div>
                  <button
                    title="Subir foto de perfil"
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#025a4e] text-white border-2 border-white flex items-center justify-center hover:bg-[#03483e] transition-colors shadow-sm"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                  {profileForm.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  {profileForm.email}
                </p>

                <span className="inline-block bg-[#eafaf5] text-[#025a4e] text-[11px] font-semibold px-3 py-0.5 rounded-full mt-2.5">
                  Cliente
                </span>

                <button
                  type="button"
                  onClick={() => alert('Selector de foto de perfil')}
                  className="w-full mt-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cambiar foto
                </button>
              </div>

              {/* Cambiar Contraseña Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <h3 className="font-serif text-sm font-bold text-slate-900 mb-3.5">
                  Cambiar contraseña
                </h3>

                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Confirmar nueva
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1c1917] hover:bg-black text-white rounded-xl py-2.5 text-xs font-semibold transition-colors mt-2 shadow-sm"
                  >
                    Actualizar contraseña
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Datos personales & Preferencias de notificación */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Datos personales Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <h3 className="font-serif text-base font-bold text-slate-900 mb-4">
                    Datos personales
                  </h3>

                  <div className="space-y-4">
                    {/* Nombre completo */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>

                    {/* Correo y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, email: e.target.value })
                          }
                          className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                        />
                      </div>
                    </div>

                    {/* Fecha de nacimiento y Ciudad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                          Fecha de nacimiento
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profileForm.birthDate}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, birthDate: e.target.value })
                            }
                            className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e] pr-10"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, city: e.target.value })
                          }
                          className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                        />
                      </div>
                    </div>

                    {/* Género */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                        Género
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, gender: e.target.value })
                        }
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      >
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decir">Prefiero no decir</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preferencias de notificación Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <h3 className="font-serif text-base font-bold text-slate-900 mb-4">
                    Preferencias de notificación
                  </h3>

                  <div className="space-y-4">
                    {/* Recordatorios por correo */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEmailReminders(!emailReminders)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                          emailReminders ? 'bg-[#025a4e]' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            emailReminders ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          Recordatorios por correo
                        </p>
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                          Recibe confirmaciones y recordatorios de tus citas vía email
                        </p>
                      </div>
                    </div>

                    {/* Recordatorios por SMS */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSmsReminders(!smsReminders)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                          smsReminders ? 'bg-[#025a4e]' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            smsReminders ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          Recordatorios por SMS
                        </p>
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                          Recibe mensajes de texto 1 hora antes de cada cita
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guardar cambios Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#025a4e] hover:bg-[#03483e] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Confirm Cancel */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
              ¿Cancelar tu reserva?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Estás a punto de cancelar tu cita de{' '}
              <strong className="text-slate-800 font-semibold">{cancelModalApt.serviceName}</strong> en{' '}
              <strong className="text-slate-800 font-semibold">{cancelModalApt.providerName}</strong> programada para el {cancelModalApt.displayDate || cancelModalApt.date}.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
              >
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reschedule */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Reprogramar reserva
              </h3>
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Selecciona una nueva fecha y horario para tu cita en{' '}
              <strong className="text-slate-800 font-semibold">{rescheduleModalApt.providerName}</strong>.
            </p>

            <form onSubmit={handleRescheduleAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva fecha
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nuevo horario
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                >
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:30 AM">9:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApt(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#025a4e] hover:bg-[#03483e] text-white shadow-sm transition-colors"
                >
                  Confirmar nueva fecha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <AuthGuard allowedRoles={['CLIENT']}>
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
          </div>
        }
      >
        <ClientDashboardContent />
      </React.Suspense>
    </AuthGuard>
  );
}
