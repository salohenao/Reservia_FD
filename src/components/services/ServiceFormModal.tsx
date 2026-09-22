'use client';

import React, { useState } from 'react';
import { CreateServiceDto, ServiceCategory } from '@/types/service';
import { X, PlusCircle, Clock, DollarSign, Tag, FileText, Loader2, AlertCircle } from 'lucide-react';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceDto) => Promise<void>;
}

export default function ServiceFormModal({ isOpen, onClose, onSubmit }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    durationMinutes: 30,
    price: 50000,
    category: 'SALUD',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'El nombre del servicio es obligatorio.';
    } else if (formData.name.trim().length < 4) {
      errs.name = 'El nombre debe tener al menos 4 caracteres.';
    }

    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      errs.durationMinutes = 'La duración debe ser mayor a 0 minutos.';
    } else if (formData.durationMinutes > 480) {
      errs.durationMinutes = 'La duración máxima permitida es de 480 minutos (8 horas).';
    }

    if (formData.price === undefined || formData.price === null || formData.price < 0) {
      errs.price = 'El costo referencial no puede ser negativo.';
    }

    if (!formData.category) {
      errs.category = 'Debes seleccionar una categoría válida.';
    }

    if (!formData.description.trim()) {
      errs.description = 'La descripción es obligatoria para informar a los clientes.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        durationMinutes: 30,
        price: 50000,
        category: 'SALUD',
        description: '',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el servicio.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Registrar Nuevo Servicio</h2>
              <p className="text-xs text-slate-500">Publica un servicio médico o estético en tu catálogo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Nombre del Servicio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre del Servicio <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Profilaxis Dental Avanzada o Limpieza Facial"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          {/* Categoría y Duración */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-teal-600" />
                <span>Categoría <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="SALUD">Salud & Clínicas</option>
                <option value="ODONTOLOGIA">Odontología</option>
                <option value="BELLEZA">Belleza & Estética</option>
                <option value="BIENESTAR">Spa & Bienestar</option>
                <option value="FISIOTERAPIA">Fisioterapia</option>
                <option value="OTRO">Otro Servicio</option>
              </select>
              {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>Duración (minutos) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                placeholder="45"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.durationMinutes
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
                }`}
              />
              {errors.durationMinutes && <p className="mt-1 text-xs text-rose-600">{errors.durationMinutes}</p>}
            </div>
          </div>

          {/* Costo Referencial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-teal-600" />
              <span>Costo Referencial (COP) <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="120000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                errors.price
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
              }`}
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>Descripción Detallada <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe en qué consiste el procedimiento, preparación previa si aplica y beneficios para el paciente..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Registrar Servicio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
