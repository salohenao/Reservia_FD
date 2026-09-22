export interface Review {
  id: string;
  authorName: string;
  authorRole: string;
  clinicName: string;
  rating: number;
  comment: string;
  avatarUrl: string;
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_001',
    authorName: 'María González',
    authorRole: 'Paciente',
    clinicName: 'Clínica Dental Del Valle',
    rating: 5,
    comment:
      'Antes llamaba 3 veces para conseguir una cita. Ahora reservo en 2 minutos desde mi teléfono, a cualquier hora del día.',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'rev_002',
    authorName: 'Carlos Mendoza',
    authorRole: 'Propietario',
    clinicName: 'FitZone Gym',
    rating: 5,
    comment:
      'Eliminamos el 90% de las cancelaciones de último minuto. Los recordatorios automáticos cambiaron todo para nuestro negocio.',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'rev_003',
    authorName: 'Andrea Ríos',
    authorRole: 'Cliente',
    clinicName: 'Salón Elara',
    rating: 5,
    comment:
      'Agendo mi turno viendo la disponibilidad real. Sin esperas, sin llamadas, sin incertidumbre. Perfecto.',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
  },
];
