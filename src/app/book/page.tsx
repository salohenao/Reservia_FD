'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services/appointmentService';
import { INITIAL_MOCK_SERVICES } from '@/mocks/mockServices';
import {
  Check,
  Star,
  MapPin,
  ArrowLeft,
} from 'lucide-react';

interface BookableService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

const DENTAL_SERVICES: BookableService[] = [
  {
    id: 'bs_1',
    name: 'Limpieza dental profesional',
    durationMinutes: 45,
    price: 80000,
  },
  {
    id: 'bs_2',
    name: 'Blanqueamiento dental',
    durationMinutes: 60,
    price: 180000,
  },
  {
    id: 'bs_3',
    name: 'Consulta de ortodoncia',
    durationMinutes: 30,
    price: 60000,
  },
];

const AVAILABLE_DAYS = [2, 3, 4, 5, 6, 7];

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

const TIME_SLOTS: TimeSlot[] = [
  { time: '8:00 AM', isAvailable: true },
  { time: '9:00 AM', isAvailable: false },
  { time: '10:00 AM', isAvailable: true },
  { time: '11:00 AM', isAvailable: false },
  { time: '1:00 PM', isAvailable: true },
  { time: '2:00 PM', isAvailable: true },
  { time: '3:30 PM', isAvailable: true },
  { time: '4:30 PM', isAvailable: false },
  { time: '5:00 PM', isAvailable: true },
];

function BookingWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const serviceId = searchParams.get('serviceId') || searchParams.get('id') || 'srv_001';
  
  // Find business from mock services
  const business = useMemo(() => {
    const found = INITIAL_MOCK_SERVICES.find((s) => s.id === serviceId);
    return found || INITIAL_MOCK_SERVICES[0];
  }, [serviceId]);

  // Steps: 1 = Servicio, 2 = Horario, 3 = Confirmar, 4 = Exito
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selection states
  const [selectedService, setSelectedService] = useState<BookableService>(DENTAL_SERVICES[0]);
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [selectedTime, setSelectedTime] = useState<string>('2:00 PM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatted strings for date
  const displayDateText = `Septiembre ${selectedDay}, 2026`;
  const displayDateShort = `Sept. ${selectedDay}, 2026`;

  // Submit booking
  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      await appointmentService.createAppointment(
        {
          serviceId: selectedService.id,
          date: `2026-09-0${selectedDay}`,
          time: selectedTime,
          notes,
        },
        {
          id: selectedService.id,
          name: selectedService.name,
          durationMinutes: selectedService.durationMinutes,
          price: selectedService.price,
          providerId: business.providerId,
          providerName: business.name,
          imageUrl: business.imageUrl,
        },
        {
          id: user?.id || 'usr_cli_001',
          name: user?.name || 'Ana García',
          email: user?.email || 'ana.garcia@gmail.com',
          phone: user?.phone || '+57 300 123 4567',
        }
      );

      setStep(4);
    } catch {
      alert('Error al confirmar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Step 4: Full-width Centered Confirmation Screen */}
        {step === 4 ? (
          <div className="mx-auto max-w-lg animate-in zoom-in-95 duration-300">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-center">
              {/* Checkmark Icon */}
              <div className="w-16 h-16 rounded-full bg-[#eafaf5] text-[#025a4e] flex items-center justify-center mx-auto mb-5 shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              {/* Header Title */}
              <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                ¡Reserva confirmada!
              </h1>
              <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto">
                Tu cita en <strong className="text-slate-800 font-semibold">{business.name}</strong> ha sido confirmada exitosamente.
              </p>

              {/* Summary Details Box */}
              <div className="bg-[#fafafa] rounded-2xl p-5 mb-8 text-xs text-left divide-y divide-slate-100/80 border border-slate-100">
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400 font-normal">Servicio</span>
                  <span className="font-bold text-slate-900">{selectedService.name}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400 font-normal">Duración</span>
                  <span className="font-bold text-slate-900">{selectedService.durationMinutes} min</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400 font-normal">Fecha</span>
                  <span className="font-bold text-slate-900">{displayDateShort}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400 font-normal">Hora</span>
                  <span className="font-bold text-slate-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400 font-normal">Valor estimado</span>
                  <span className="font-bold text-slate-900">${selectedService.price.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/dashboard/client?tab=citas"
                  className="w-full inline-block bg-[#025a4e] hover:bg-[#03483e] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                >
                  Ver mis citas
                </Link>

                <Link
                  href="/services"
                  className="w-full inline-block border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                >
                  Explorar más servicios
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Steps 1, 2, 3: Two-Column Layout */
          <div>
            {/* Top Back Link */}
            <div className="mb-4">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a resultados</span>
              </button>
            </div>

            {/* Stepper Progress Bar (Exact Figma Design) */}
            <div className="flex items-center gap-4 mb-8">
              {/* Step 1: Servicio */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step > 1
                      ? 'bg-[#025a4e] text-white'
                      : 'border-2 border-[#025a4e] text-[#025a4e]'
                  }`}
                >
                  {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </div>
                <span className="text-xs font-bold text-[#025a4e]">Servicio</span>
              </div>

              {/* Connecting Line 1 */}
              <div className={`h-[2px] w-12 sm:w-16 ${step >= 2 ? 'bg-[#025a4e]' : 'bg-slate-200'}`} />

              {/* Step 2: Horario */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step > 2
                      ? 'bg-[#025a4e] text-white'
                      : step === 2
                      ? 'border-2 border-[#025a4e] text-[#025a4e]'
                      : 'border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </div>
                <span className={`text-xs font-semibold ${step >= 2 ? 'text-[#025a4e]' : 'text-slate-400'}`}>
                  Horario
                </span>
              </div>

              {/* Connecting Line 2 */}
              <div className={`h-[2px] w-12 sm:w-16 ${step >= 3 ? 'bg-[#025a4e]' : 'bg-slate-200'}`} />

              {/* Step 3: Confirmar */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 3
                      ? 'border-2 border-[#025a4e] text-[#025a4e]'
                      : 'border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span className={`text-xs font-semibold ${step === 3 ? 'text-[#025a4e]' : 'text-slate-400'}`}>
                  Confirmar
                </span>
              </div>
            </div>

            {/* Main Booking Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Active Step Card (Col 7) */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                {/* ----------------------------------------------------
                    STEP 1: ELIGE EL SERVICIO
                   ---------------------------------------------------- */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Elige el servicio
                      </h2>
                      <p className="text-xs text-slate-400 font-normal mt-1">
                        Selecciona qué deseas reservar en {business.name}
                      </p>
                    </div>

                    {/* Services Radio List */}
                    <div className="space-y-3">
                      {DENTAL_SERVICES.map((srv) => {
                        const isSelected = selectedService.id === srv.id;
                        return (
                          <div
                            key={srv.id}
                            onClick={() => setSelectedService(srv)}
                            className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'border-2 border-[#025a4e] bg-[#f0faf7]'
                                : 'border border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Custom Radio Button */}
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? 'border-[#025a4e] bg-[#025a4e]'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>

                              <div>
                                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                                  {srv.name}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                                  {srv.durationMinutes} min
                                </p>
                              </div>
                            </div>

                            <span className="text-sm font-bold text-[#025a4e]">
                              ${srv.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-[#025a4e] hover:bg-[#03483e] text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all"
                    >
                      Continuar →
                    </button>
                  </div>
                )}

                {/* ----------------------------------------------------
                    STEP 2: ELIGE LA FECHA Y HORA
                   ---------------------------------------------------- */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Elige la fecha y hora
                      </h2>
                      <p className="text-xs text-slate-400 font-normal mt-1">
                        Selecciona un horario disponible —{' '}
                        <strong className="text-[#025a4e] font-semibold">verde = disponible</strong>
                      </p>
                    </div>

                    {/* Month Label */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
                        SEPTIEMBRE 2026
                      </span>

                      {/* Day Selectors Grid */}
                      <div className="grid grid-cols-6 gap-2">
                        {AVAILABLE_DAYS.map((day) => {
                          const isSelected = selectedDay === day;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedDay(day)}
                              className={`py-3 rounded-xl text-xs font-bold text-center transition-all ${
                                isSelected
                                  ? 'bg-[#025a4e] text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-800 hover:border-[#025a4e]'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots Section */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
                        HORAS DISPONIBLES — SEPT. {selectedDay}
                      </span>

                      <div className="grid grid-cols-3 gap-2.5">
                        {TIME_SLOTS.map((slot, index) => {
                          const isSelected = selectedTime === slot.time && slot.isAvailable;
                          return (
                            <button
                              key={index}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                              className={`py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                                !slot.isAvailable
                                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent'
                                  : isSelected
                                  ? 'bg-[#025a4e] text-white shadow-sm border border-[#025a4e]'
                                  : 'bg-white border border-slate-200 text-slate-800 hover:border-[#025a4e]'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 bg-[#025a4e] hover:bg-[#03483e] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                      >
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------
                    STEP 3: CONFIRMA TU RESERVA
                   ---------------------------------------------------- */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Confirma tu reserva
                      </h2>
                      <p className="text-xs text-slate-400 font-normal mt-1">
                        Revisa los detalles antes de confirmar
                      </p>
                    </div>

                    {/* Details Box */}
                    <div className="bg-[#fafafa] rounded-2xl p-4 sm:p-5 text-xs divide-y divide-slate-100/80 border border-slate-100 space-y-1">
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Proveedor</span>
                        <span className="font-bold text-slate-900">{business.name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Servicio</span>
                        <span className="font-bold text-slate-900">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Duración</span>
                        <span className="font-bold text-slate-900">{selectedService.durationMinutes} min</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Fecha</span>
                        <span className="font-bold text-slate-900">{displayDateText}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Hora</span>
                        <span className="font-bold text-slate-900">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-normal">Valor estimado</span>
                        <span className="font-bold text-slate-900">${selectedService.price.toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    {/* Optional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Notas para el proveedor (opcional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Alergias, indicaciones especiales, preferencias..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>

                    {/* Cancellation Policy Alert */}
                    <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-[11px] font-medium p-3.5 rounded-xl">
                      Política de cancelación: cancela con 24 h de anticipación sin costo.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirmReservation}
                        className="flex-1 bg-[#025a4e] hover:bg-[#03483e] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                      >
                        {isSubmitting ? 'Confirmando...' : 'Confirmar reserva'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Business Summary Card (Col 5) */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] sticky top-28">
                {/* Image */}
                <div className="w-full h-44 bg-slate-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={business.imageUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop'}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Business Info */}
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                    {business.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{business.providerLocation || 'Chapinero, Bogotá'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{business.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">calificación</span>
                  </div>

                  {/* Selected Service Card Box */}
                  <div className="bg-[#eafaf5] rounded-2xl p-4 mt-5">
                    <p className="text-xs font-bold text-[#025a4e] leading-tight">
                      {selectedService.name}
                    </p>
                    <p className="text-[11px] text-[#025a4e]/80 font-medium mt-1">
                      {selectedService.durationMinutes} min · ${selectedService.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
        </div>
      }
    >
      <BookingWizardContent />
    </React.Suspense>
  );
}
