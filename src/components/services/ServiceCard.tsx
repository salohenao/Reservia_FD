import React from 'react';
import { Service } from '@/types/service';
import { Clock, Star, Building2, Calendar, CheckCircle2 } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
  isProviderView?: boolean;
}

export default function ServiceCard({ service, onBook, isProviderView = false }: ServiceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'ODONTOLOGIA':
        return { label: 'Odontología', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SALUD':
        return { label: 'Salud & Clínicas', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'BELLEZA':
        return { label: 'Belleza & Estética', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'BIENESTAR':
        return { label: 'Spa & Bienestar', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FISIOTERAPIA':
        return { label: 'Fisioterapia', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Especializado', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const badge = getCategoryBadge(service.category);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300">
      <div>
        {/* Top bar: Category and Rating / Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badge.bg}`}
          >
            {badge.label}
          </span>
          {isProviderView ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Activo
            </span>
          ) : (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal">({service.reviewsCount})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
          {service.name}
        </h3>

        {/* Provider info */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Building2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span className="font-medium text-slate-700 truncate">{service.providerName}</span>
          {service.providerLocation && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate">{service.providerLocation}</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
          {service.description}
        </p>
      </div>

      {/* Card Footer: Metadata and Action */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            <span>{service.durationMinutes} min</span>
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Costo referencial</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatPrice(service.price)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {!isProviderView ? (
          <button
            onClick={() => onBook?.(service)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Agendar Cita</span>
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>ID: <code className="font-mono text-[11px] text-slate-700">{service.id}</code></span>
            <span className="text-teal-600 font-medium">Disponible para reserva</span>
          </div>
        )}
      </div>
    </div>
  );
}
