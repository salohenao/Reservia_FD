import { Appointment, CreateAppointmentDto } from '@/types/appointment';
import { INITIAL_MOCK_APPOINTMENTS } from '@/mocks/mockAppointments';
import { apiClient, USE_MOCK } from './apiClient';

const STORAGE_APPOINTMENTS_KEY = 'mock_appointments_db';

class AppointmentService {
  private getStoredAppointments(): Appointment[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_APPOINTMENTS;
    const stored = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(INITIAL_MOCK_APPOINTMENTS));
      return INITIAL_MOCK_APPOINTMENTS;
    }
    try {
      const parsed: Appointment[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.some((a) => a.id === 'apt_001')) {
        localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(INITIAL_MOCK_APPOINTMENTS));
        return INITIAL_MOCK_APPOINTMENTS;
      }
      return parsed;
    } catch {
      return INITIAL_MOCK_APPOINTMENTS;
    }
  }

  private saveAppointments(appointments: Appointment[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  }

  async getClientAppointments(clientId: string): Promise<Appointment[]> {
    if (!USE_MOCK) {
      return await apiClient.get<Appointment[]>(`/appointments/client/${clientId}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.getStoredAppointments().filter((a) => a.clientId === clientId);
  }

  async getProviderAppointments(providerId: string): Promise<Appointment[]> {
    if (!USE_MOCK) {
      return await apiClient.get<Appointment[]>(`/appointments/provider/${providerId}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.getStoredAppointments().filter((a) => a.providerId === providerId);
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    if (!USE_MOCK) {
      return await apiClient.delete(`/appointments/${appointmentId}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const list = this.getStoredAppointments();
    const updated = list.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' as const } : a));
    this.saveAppointments(updated);
  }

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<Appointment> {
    if (!USE_MOCK) {
      return await apiClient.put<Appointment>(`/appointments/${appointmentId}`, { date: newDate, time: newTime });
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const list = this.getStoredAppointments();
    let updatedApp: Appointment | undefined;
    const updated = list.map((a) => {
      if (a.id === appointmentId) {
        updatedApp = {
          ...a,
          date: newDate,
          time: newTime,
          displayDate: newDate,
          displayTime: newTime,
          status: 'CONFIRMED' as const,
        };
        return updatedApp;
      }
      return a;
    });
    this.saveAppointments(updated);
    if (!updatedApp) throw new Error('Cita no encontrada');
    return updatedApp;
  }

  async createAppointment(
    dto: CreateAppointmentDto,
    service: { id: string; name: string; durationMinutes: number; price: number; providerId: string; providerName: string; imageUrl?: string },
    client: { id: string; name: string; email: string; phone?: string }
  ): Promise<Appointment> {
    if (!USE_MOCK) {
      return await apiClient.post<Appointment>('/appointments', {
        ...dto,
        serviceId: service.id,
        clientId: client.id,
      });
    }

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      providerId: service.providerId,
      providerName: service.providerName,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      date: dto.date,
      time: dto.time,
      displayDate: dto.date,
      displayTime: dto.time,
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: 'CONFIRMED',
      imageUrl: service.imageUrl,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    const appointments = this.getStoredAppointments();
    const updated = [newAppointment, ...appointments];
    this.saveAppointments(updated);
    return newAppointment;
  }
}

export const appointmentService = new AppointmentService();
