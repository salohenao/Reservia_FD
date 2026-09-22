'use client';

import React, { useState } from 'react';
import { Service } from '@/types/service';
import BusinessCard from '@/components/services/BusinessCard';
import { Search, Sparkles, SlidersHorizontal, CheckCircle2, Calendar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services/appointmentService';

interface FeaturedServicesSectionProps {
  services: Service[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onServiceCreated?: () => void;
}

export default function FeaturedServicesSection({
  services,
  selectedCategory,
  onSelectCategory,
}: FeaturedServicesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-20');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Filter in real time
  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === 'ALL' || !selectedCategory
        ? true
        : s.category.toUpperCase() === selectedCategory.toUpperCase();

    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.providerName.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  const handleBookClick = (service: Service) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBookingService(service);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService || !user) return;

    setIsSubmitting(true);
    try {
      await appointmentService.createAppointment(
        {
          serviceId: bookingService.id,
          date: selectedDate,
          time: selectedTime,
          notes,
        },
        {
          id: bookingService.id,
          name: bookingService.name,
          durationMinutes: bookingService.durationMinutes,
          price: bookingService.price,
          providerId: bookingService.providerId,
          providerName: bookingService.providerName,
        },
        {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      );

      setBookingSuccess(`¡Cita agendada con éxito para ${bookingService.name}!`);
      setBookingService(null);
      setTimeout(() => setBookingSuccess(null), 5000);
    } catch {
      alert('Ocurrió un error al confirmar la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = [
    { id: 'ALL', label: 'Todos los Servicios' },
    { id: 'SALUD', label: 'Clínicas y Salud' },
    { id: 'ODONTOLOGIA', label: 'Odontología' },
    { id: 'BELLEZA', label: 'Belleza y Estética' },
    { id: 'BIENESTAR', label: 'Bienestar y Spa' },
    { id: 'FISIOTERAPIA', label: 'Centros Deportivos' },
  ];

  return (
    <section id="servicios" className="py-20 bg-[#fafafa] border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eafaf5] px-3.5 py-1 text-xs font-semibold text-[#025a4e]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Catálogo Disponible</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-2 tracking-tight">
              Servicios Destacados
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Revisa precios, duración y agenda tu cita con clínicas y salones certificados.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar servicio o negocio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-xs focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Success alert */}
        {bookingSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#eafaf5] p-4 text-sm font-semibold text-[#025a4e] border border-teal-200 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-[#025a4e] shrink-0" />
            <span>{bookingSuccess} Puedes revisarla en tu panel de citas.</span>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#025a4e] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#025a4e] hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <BusinessCard
                key={service.id}
                service={service}
                onBook={handleBookClick}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <SlidersHorizontal className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron servicios</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o selecciona otra categoría para explorar más opciones.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('ALL');
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#eafaf5] px-4 py-2 text-xs font-semibold text-[#025a4e] hover:bg-teal-100"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Quick booking modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#025a4e]" />
                <h3 className="text-base font-bold text-slate-900 font-serif">Confirmar Reserva de Cita</h3>
              </div>
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <p className="text-xs text-slate-500">Servicio seleccionado:</p>
              <h4 className="text-sm font-bold text-slate-900">{bookingService.name}</h4>
              <p className="text-xs text-[#025a4e] font-medium">{bookingService.providerName}</p>
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
                <span>Duración: {bookingService.durationMinutes} min</span>
                <span>Costo: ${bookingService.price.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#025a4e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#025a4e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas o comentarios para el especialista (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Primera cita, requerimiento especial..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#025a4e]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#025a4e] px-5 py-2 text-xs font-bold text-white hover:bg-[#03483e] shadow-md shadow-teal-900/20"
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
