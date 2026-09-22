export interface ProviderUpcomingAppointment {
  id: string;
  initials: string;
  clientName: string;
  serviceName: string;
  dayLabel: string;
  timeLabel: string;
  status: 'Confirmada' | 'Pendiente';
}

export interface ProviderCatalogService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  reservationsCount: number;
  isActive: boolean;
}

export interface DaySchedule {
  dayName: string;
  isEnabled: boolean;
  blocks: {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
    color: 'blue' | 'amber';
  }[];
}

export const INITIAL_PROVIDER_APPOINTMENTS: ProviderUpcomingAppointment[] = [
  {
    id: 'p_apt_1',
    initials: 'AG',
    clientName: 'Ana García',
    serviceName: 'Limpieza dental',
    dayLabel: 'Hoy',
    timeLabel: '2:00 PM',
    status: 'Confirmada',
  },
  {
    id: 'p_apt_2',
    initials: 'LH',
    clientName: 'Luis Herrera',
    serviceName: 'Blanqueamiento dental',
    dayLabel: 'Hoy',
    timeLabel: '4:30 PM',
    status: 'Confirmada',
  },
  {
    id: 'p_apt_3',
    initials: 'MR',
    clientName: 'María Ramos',
    serviceName: 'Ortodoncia',
    dayLabel: 'Mañana',
    timeLabel: '9:00 AM',
    status: 'Pendiente',
  },
  {
    id: 'p_apt_4',
    initials: 'JP',
    clientName: 'Juan Pérez',
    serviceName: 'Limpieza dental',
    dayLabel: 'Mañana',
    timeLabel: '11:00 AM',
    status: 'Confirmada',
  },
  {
    id: 'p_apt_5',
    initials: 'CT',
    clientName: 'Catalina Torres',
    serviceName: 'Blanqueamiento dental',
    dayLabel: 'Mié 4 sept',
    timeLabel: '3:00 PM',
    status: 'Confirmada',
  },
];

export const INITIAL_PROVIDER_SERVICES: ProviderCatalogService[] = [
  {
    id: 'prov_srv_1',
    name: 'Limpieza dental profesional',
    durationMinutes: 45,
    price: 80000,
    reservationsCount: 42,
    isActive: true,
  },
  {
    id: 'prov_srv_2',
    name: 'Blanqueamiento dental',
    durationMinutes: 60,
    price: 180000,
    reservationsCount: 28,
    isActive: true,
  },
  {
    id: 'prov_srv_3',
    name: 'Consulta de ortodoncia',
    durationMinutes: 30,
    price: 60000,
    reservationsCount: 15,
    isActive: false,
  },
  {
    id: 'prov_srv_4',
    name: 'Radiografía panorámica',
    durationMinutes: 20,
    price: 45000,
    reservationsCount: 33,
    isActive: true,
  },
];

export const INITIAL_WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayName: 'Lunes',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '08:00 a. m.', endTime: '12:00 p. m.', color: 'blue' },
      { id: 'b2', label: 'Bloque 2', startTime: '02:00 p. m.', endTime: '06:00 p. m.', color: 'amber' },
    ],
  },
  {
    dayName: 'Martes',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '08:00 a. m.', endTime: '12:00 p. m.', color: 'blue' },
      { id: 'b2', label: 'Bloque 2', startTime: '02:00 p. m.', endTime: '06:00 p. m.', color: 'amber' },
    ],
  },
  {
    dayName: 'Miércoles',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '08:00 a. m.', endTime: '12:00 p. m.', color: 'blue' },
      { id: 'b2', label: 'Bloque 2', startTime: '02:00 p. m.', endTime: '05:00 p. m.', color: 'amber' },
    ],
  },
  {
    dayName: 'Jueves',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '08:00 a. m.', endTime: '12:00 p. m.', color: 'blue' },
      { id: 'b2', label: 'Bloque 2', startTime: '02:00 p. m.', endTime: '06:00 p. m.', color: 'amber' },
    ],
  },
  {
    dayName: 'Viernes',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '08:00 a. m.', endTime: '12:00 p. m.', color: 'blue' },
      { id: 'b2', label: 'Bloque 2', startTime: '02:00 p. m.', endTime: '05:00 p. m.', color: 'amber' },
    ],
  },
  {
    dayName: 'Sábado',
    isEnabled: true,
    blocks: [
      { id: 'b1', label: 'Bloque 1', startTime: '09:00 a. m.', endTime: '01:00 p. m.', color: 'blue' },
    ],
  },
  {
    dayName: 'Domingo',
    isEnabled: false,
    blocks: [],
  },
];
