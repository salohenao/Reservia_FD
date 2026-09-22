import { CreateServiceDto, Service, ServiceFiltersState } from '@/types/service';
import { INITIAL_MOCK_SERVICES } from '@/mocks/mockServices';
import { apiClient, USE_MOCK } from './apiClient';

const STORAGE_SERVICES_KEY = 'mock_services_db';

class ServiceService {
  private getStoredServices(): Service[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_SERVICES;
    const stored = localStorage.getItem(STORAGE_SERVICES_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(INITIAL_MOCK_SERVICES));
      return INITIAL_MOCK_SERVICES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_SERVICES;
    }
  }

  private saveServices(services: Service[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services));
  }

  async getAllServices(filters?: ServiceFiltersState): Promise<Service[]> {
    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: GET /api/services?category=...&search=...
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.search) queryParams.append('search', filters.search);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await apiClient.get<Service[]>(`/services${query}`);
    }

    // Simulación en memoria para Sprint 1:
    await new Promise((resolve) => setTimeout(resolve, 250));
    let services = this.getStoredServices();

    if (filters?.category && filters.category !== 'ALL') {
      services = services.filter((s) => s.category.toUpperCase() === filters.category?.toUpperCase());
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.providerName.toLowerCase().includes(q)
      );
    }

    return services;
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: GET /api/services/provider/{providerId}
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      return await apiClient.get<Service[]>(`/services/provider/${providerId}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = this.getStoredServices();
    return all.filter((s) => s.providerId === providerId);
  }

  async createService(
    dto: CreateServiceDto,
    provider: { id: string; businessName?: string; name: string; city?: string }
  ): Promise<Service> {
    // Validaciones de negocio
    if (!dto.name.trim()) throw new Error('El nombre del servicio es obligatorio.');
    if (dto.durationMinutes <= 0) throw new Error('La duración debe ser mayor a 0 minutos.');
    if (dto.price < 0) throw new Error('El costo referencial no puede ser negativo.');
    if (!dto.category) throw new Error('Debes seleccionar una categoría.');

    // -------------------------------------------------------------
    // Conexión real con Spring Boot 3.x:
    // Endpoint previsto: POST /api/services
    // -------------------------------------------------------------
    if (!USE_MOCK) {
      return await apiClient.post<Service>('/services', {
        ...dto,
        providerId: provider.id,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
    const services = this.getStoredServices();

    const newService: Service = {
      id: `srv_${Date.now()}`,
      name: dto.name.trim(),
      description: dto.description?.trim() || 'Servicio profesional certificado.',
      durationMinutes: Number(dto.durationMinutes),
      price: Number(dto.price),
      category: dto.category,
      providerId: provider.id,
      providerName: provider.businessName || provider.name,
      providerLocation: provider.city || 'Medellín',
      rating: 5.0,
      reviewsCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newService, ...services];
    this.saveServices(updated);

    return newService;
  }

  async toggleServiceStatus(serviceId: string): Promise<Service> {
    const services = this.getStoredServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Servicio no encontrado');

    service.isActive = !service.isActive;
    this.saveServices(services);
    return service;
  }
}

export const serviceService = new ServiceService();
