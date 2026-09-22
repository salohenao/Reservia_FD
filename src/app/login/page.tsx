'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, Loader2, AlertCircle, User, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleRoleToggle = (selectedRole: 'CLIENT' | 'PROVIDER') => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === 'PROVIDER') {
      setEmail('');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email, password });

      // Redirección condicionada por rol según los requerimientos
      if (loggedUser.role === 'PROVIDER') {
        router.push('/dashboard/provider');
      } else {
        router.push('/dashboard/client');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas. Por favor verifica tus datos.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-white">
      {/* Columna Izquierda: Imagen y Testimonio Clínico (Exacto a Figma) */}
      <div className="relative hidden lg:block lg:w-1/2 min-h-[680px] xl:min-h-[760px] bg-slate-900">
        <Image
          src="/images/clinic_reception.jpg"
          alt="Recepción de clínica médica moderna"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Gradiente oscuro inferior para máxima legibilidad del texto blanco */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Overlay con Testimonio */}
        <div className="absolute bottom-10 left-10 right-10 z-10 space-y-2.5 max-w-xl">
          {/* 5 Estrellas Doradas */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>

          {/* Cita */}
          <p className="text-2xl xl:text-[26px] font-bold font-serif text-white leading-snug tracking-tight">
            &ldquo;Nuestra ocupación aumentó un 40% desde que adoptamos Reservia.&rdquo;
          </p>

          {/* Autor */}
          <p className="text-xs sm:text-sm text-teal-200/90 font-medium">
            — Dr. Andrés Villa, Clínica Santa Lucía
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Inicio de Sesión Centrado */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Título y Enlace a Registro */}
          <div className="text-left space-y-1.5">
            <h1 className="text-3xl sm:text-[34px] font-bold font-serif text-slate-900 tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link
                href={role === 'PROVIDER' ? '/register/provider' : '/register/client'}
                className="font-semibold text-[#025a4e] hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Selector de Rol Segmentado (Pills) */}
          <div className="bg-[#f3f4f6] p-1 rounded-xl grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleRoleToggle('CLIENT')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'CLIENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#025a4e]" />
              <span>Soy cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleToggle('PROVIDER')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'PROVIDER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-[#025a4e]" />
              <span>Soy proveedor</span>
            </button>
          </div>

          {/* Mensaje de Error si aplica */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>

            {/* Campo Contraseña con Enlace "¿Olvidaste tu contraseña?" */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <a
                  href="#olvide-contrasena"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Para el demo, utiliza la contraseña predeterminada: Demo1234');
                  }}
                  className="text-xs font-medium text-[#027a6a] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>

            {/* Botón Principal Iniciar Sesión */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#025a4e] py-3.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#03483e] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>

          {/* Separador "o continúa con" */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="absolute bg-white px-3 text-xs text-slate-400">
              o continúa con
            </span>
          </div>

          {/* Botones de Inicio Social: Google y Facebook */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail('');
                setPassword('');
              }}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-xs"
            >
              {/* Google G Logo SVG */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('');
                setPassword('');
              }}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-xs"
            >
              {/* Facebook Logo SVG */}
              <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
