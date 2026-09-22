export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  displayDate?: string; // e.g. "Mar, 3 sept 2026"
  displayTime?: string; // e.g. "11:00 AM"
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentDto {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface HistoryAppointment {
  id: string;
  providerName: string;
  serviceName: string;
  date: string;
  totalPrice: number;
  status: 'Completada' | 'Cancelada';
}

