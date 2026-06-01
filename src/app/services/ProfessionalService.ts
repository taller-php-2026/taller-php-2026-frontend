import { Injectable } from '@angular/core';

const PROFESSIONALS = [
  {
    id: '1',
    name: 'Juan Pérez',
    specialty: 'Barbero',
    rating: 4.5,
    reviews: 120,
  },
  {
    id: '2',
    name: 'María García',
    specialty: 'Peluquera',
    rating: 4.8,
    reviews: 95,
  },
  {
    id: '3',
    name: 'Carlos López',
    specialty: 'Masajista',
    rating: 4.6,
    reviews: 110,
  },
  {
    id: '4',
    name: 'Ana Martínez',
    specialty: 'Estilista',
    rating: 4.7,
    reviews: 85,
  },
  {
    id: '5',
    name: 'Luis Rodríguez',
    specialty: 'Manicurista',
    rating: 4.5,
    reviews: 100,
  },
  {
    id: '6',
    name: 'Sofía Fernández',
    specialty: 'Dermatologa',
    rating: 4.8,
    reviews: 90,
  },
];

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  getProfessionalsByCompanyService = (companyId: string, serviceId: string) => {
    return PROFESSIONALS;
  };
}
