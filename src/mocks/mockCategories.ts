import { CategoryInfo } from '@/types/service';

export const MOCK_CATEGORIES: CategoryInfo[] = [
  {
    id: 'SALUD',
    name: 'Salud & Clínicas',
    description: 'Consultas médicas, chequeos preventivos y especialistas certificados.',
    iconName: 'Stethoscope',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'ODONTOLOGIA',
    name: 'Odontología',
    description: 'Higiene dental, ortodoncia, blanqueamiento y diseño de sonrisa.',
    iconName: 'Smile',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'BELLEZA',
    name: 'Belleza & Estética',
    description: 'Tratamientos faciales, estilismo, corte, colorimetría y barbería.',
    iconName: 'Sparkles',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'BIENESTAR',
    name: 'Spa & Bienestar',
    description: 'Masajes relajantes, descontracturantes, hidroterapia y aromaterapia.',
    iconName: 'HeartPulse',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'FISIOTERAPIA',
    name: 'Fisioterapia',
    description: 'Rehabilitación deportiva, terapia física y recuperación muscular.',
    iconName: 'Activity',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'OTRO',
    name: 'Otros Servicios',
    description: 'Servicios especializados y atenciones personalizadas a domicilio.',
    iconName: 'Layers',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
];
