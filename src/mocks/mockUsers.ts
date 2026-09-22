import { User } from '@/types/auth';

export interface MockUserAccount {
  user: User;
  passwordHash: string; // Para validación simulada en memoria
}

export const INITIAL_MOCK_USERS: MockUserAccount[] = [
  {
    user: {
      id: 'usr_prov_001',
      name: 'Dr. Carlos Mendoza',
      email: 'carlos.mendoza@clinicadelvalle.com',
      role: 'PROVIDER',
      phone: '+57 310 987 6543',
      businessName: 'Clínica Odontológica del Valle',
      businessCategory: 'ODONTOLOGIA',
      address: 'Av. Las Palmas #45-12, Consultorio 304',
      city: 'Medellín',
      documentNumber: '900854123-1',
      createdAt: '2025-01-15T08:00:00.000Z',
    },
    passwordHash: 'Demo1234',
  },
  {
    user: {
      id: 'usr_cli_001',
      name: 'Ana García',
      email: 'ana.garcia@gmail.com',
      role: 'CLIENT',
      phone: '+57 300 123 4567',
      city: 'Medellín',
      createdAt: '2025-02-01T10:30:00.000Z',
    },
    passwordHash: 'Demo1234',
  },
];
