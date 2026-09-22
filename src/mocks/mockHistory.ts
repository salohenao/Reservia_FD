import { HistoryAppointment } from '@/types/appointment';

export const INITIAL_MOCK_HISTORY: HistoryAppointment[] = [
  {
    id: 'hist_001',
    providerName: 'Spa Serenity',
    serviceName: 'Masaje relajante',
    date: '18 ago 2026',
    totalPrice: 120000,
    status: 'Completada',
  },
  {
    id: 'hist_002',
    providerName: 'Centro Médico Norte',
    serviceName: 'Medicina general',
    date: '10 ago 2026',
    totalPrice: 50000,
    status: 'Completada',
  },
  {
    id: 'hist_003',
    providerName: 'Salón Elara',
    serviceName: 'Corte de cabello',
    date: '28 jul 2026',
    totalPrice: 45000,
    status: 'Cancelada',
  },
  {
    id: 'hist_004',
    providerName: 'FitZone Gym',
    serviceName: 'Clase de Yoga',
    date: '15 jul 2026',
    totalPrice: 35000,
    status: 'Completada',
  },
];
