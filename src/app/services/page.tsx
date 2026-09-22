'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/types/service';
import { serviceService } from '@/services/serviceService';
import BusinessCard from '@/components/services/BusinessCard';
import { Search, X, Calendar, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services/appointmentService';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados para modal de reserva
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const data = await serviceService.getAllServices();
        if (isMounted) {
          setServices(data);
        }
      } catch (err) {
        console.error('Error cargando servicios:', err);
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoriesList = [
    { id: 'TODAS', label: 'Todas', emoji: '' },
    { id: 'SALUD', label: 'Salud', emoji: '🏥' },
    { id: 'BELLEZA', label: 'Belleza', emoji: '✂️' },
    { id: 'DEPORTES', label: 'Deportes', emoji: '🏋️' },
    { id: 'BIENESTAR', label: 'Bienestar', emoji: '🧘' },
  ];

  // Filtrado reactivo en tiempo real
  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === 'TODAS' ||
      s.category.toUpperCase() === selectedCategory.toUpperCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.providerName.toLowerCase().includes(q) ||
      s.providerLocation?.toLowerCase().includes(q) ||
      s.tags?.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleBookClick = (service: Service) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/book?serviceId=${service.id}`);
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

      setBookingSuccess(
        `¡Cita confirmada en ${bookingService.name}! Puedes verla en tu panel.`
      );
      setBookingService(null);
      setTimeout(() => setBookingSuccess(null), 5000);
    } catch {
      alert('Ocurrió un error al confirmar la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-white pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Barra Superior: Buscador y Píldoras de Categorías (Exacto a Figma) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-8">
          {/* Buscador de servicios o negocios */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Busca por servicio o nombre de negocio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] pl-11 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtros de Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#025a4e] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerta de confirmación de cita */}
        {bookingSuccess && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-[#eafaf5] p-4 text-sm font-semibold text-[#025a4e] border border-teal-200 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-[#025a4e] shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {/* Contador de Resultados */}
        <div className="mb-6 text-xs sm:text-sm font-medium text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>

        {/* Grilla de 6 Tarjetas (2 filas x 3 columnas) */}
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No encontramos negocios ni servicios para tu búsqueda
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta buscar por otro término o selecciona la categoría &ldquo;Todas&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('TODAS');
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#eafaf5] px-4 py-2 text-xs font-semibold text-[#025a4e] hover:bg-teal-100"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal interactivo de reserva de cita */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#025a4e]" />
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Confirmar Reserva de Cita
                </h3>
              </div>
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <p className="text-xs text-slate-500">Establecimiento:</p>
              <h4 className="text-sm font-bold text-slate-900">{bookingService.name}</h4>
              <p className="text-xs text-[#025a4e] font-medium">{bookingService.providerLocation}</p>
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
                <span>Duración: {bookingService.durationMinutes} min</span>
                <span>Costo ref: ${bookingService.price.toLocaleString('es-CO')} COP</span>
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
                  placeholder="Ej: Primera cita, motivo de consulta, requerimiento especial..."
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
    </div>
  );
}
