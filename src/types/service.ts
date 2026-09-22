export type ServiceCategory =
  | 'TODAS'
  | 'SALUD'
  | 'BELLEZA'
  | 'DEPORTES'
  | 'BIENESTAR'
  | 'ODONTOLOGIA'
  | 'FISIOTERAPIA'
  | 'OTRO';

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  description: string;
  iconName: string;
  badgeColor: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory | string;
  providerId: string;
  providerName: string;
  providerLocation?: string;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  nextAvailableTime?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory | string;
  imageUrl?: string;
  tags?: string[];
  nextAvailableTime?: string;
}

export interface ServiceFiltersState {
  category?: string;
  search?: string;
  maxPrice?: number;
}
