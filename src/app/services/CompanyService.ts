import { Injectable } from '@angular/core';

const SERVICES = [
  {
    id: '1',
    name: 'Servicio 1',
    description: 'Descripción del servicio 1',
    duration: '30 mins',
    price: '50',
  },
  {
    id: '2',
    name: 'Servicio 2',
    description: 'Descripción del servicio 2',
    duration: '45 mins',
    price: '75',
  },
  {
    id: '3',
    name: 'Servicio 3',
    description: 'Descripción del servicio 3',
    duration: '60 mins',
    price: '100',
  },
  {
    id: '4',
    name: 'Servicio 4',
    description: 'Descripción del servicio 4',
    duration: '90 mins',
    price: '150',
  },
  {
    id: '5',
    name: 'Servicio 5',
    description: 'Descripción del servicio 5',
    duration: '120 mins',
    price: '200',
  },
  {
    id: '6',
    name: 'Servicio 6',
    description: 'Descripción del servicio 6',
    duration: '15 mins',
    price: '25',
  },
];

@Injectable({ providedIn: 'root' })
export class CompanyService {
  getServicesByCompanyId = (companyId: string) => {
    return SERVICES;
  };
}
