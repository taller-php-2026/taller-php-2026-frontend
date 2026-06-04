import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anadir-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './anadir-servicio.component.html',
  styleUrl: './anadir-servicio.component.css'
})
export class AnadirServicioComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  name = signal('');
  hours = signal<number | null>(null);
  minutes = signal<number | null>(null);
  price = signal<number | null>(null);
  description = signal('');
  imagePreview = signal<string | null>(null);

  // Modalidad de servicio.
  modalidad = signal<'presencial' | 'online'>('presencial');
  direccion = signal('');
  ciudad = signal('');
  proveedor = signal('');
  urlAcceso = signal('');
  nombreSala = signal('');

  // Listar ciclos.
  ciclos = signal<any[]>([]);

  // Listar ciclos seleccionados.
  selectedCiclos = signal<number[]>([]);

  availableCategories = [
    'Peluquería',
    'Manicura',
    'Masajes',
    'Tratamientos Faciales',
    'Barbería',
    'Maquillaje'
  ];
  selectedCategories = signal<string[]>([]);
  selectedCategoryDropdown = '';

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Inicializar componente.
  ngOnInit(): void {
    this.http.get<any[]>('/mock-ciclo-agenda.json').subscribe((datos) => {
      this.ciclos.set(datos || []);
    });
  }

  // Cambiar selección de ciclo.
  toggleCiclo(id: number): void {
    this.selectedCiclos.update((lista) =>
      lista.includes(id) ? lista.filter((c) => c !== id) : [...lista, id]
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  addCategory(category: string) {
    if (category && !this.selectedCategories().includes(category)) {
      this.selectedCategories.update(cats => [...cats, category]);
    }
    this.selectedCategoryDropdown = '';
  }

  removeCategory(category: string) {
    this.selectedCategories.update(cats => cats.filter(c => c !== category));
  }

  goBack() {
    this.router.navigate(['/configurar-servicios']);
  }

  resetFields() {
    this.name.set('');
    this.hours.set(null);
    this.minutes.set(null);
    this.price.set(null);
    this.description.set('');
    this.imagePreview.set(null);
    this.selectedCategories.set([]);
    this.selectedCategoryDropdown = '';
    this.selectedCiclos.set([]);
    this.modalidad.set('presencial');
    this.direccion.set('');
    this.ciudad.set('');
    this.proveedor.set('');
    this.urlAcceso.set('');
    this.nombreSala.set('');
  }

  onSubmit() {
    if (!this.name().trim()) {
      this.errorMsg.set('El nombre del servicio es requerido.');
      return;
    }
    if (this.selectedCategories().length === 0) {
      this.errorMsg.set('Debes seleccionar al menos una categoría.');
      return;
    }
    if (this.price() === null || this.price()! <= 0) {
      this.errorMsg.set('El precio debe ser mayor a 0.');
      return;
    }
    if (this.selectedCiclos().length === 0) {
      this.errorMsg.set('Debes seleccionar al menos un ciclo de agenda.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('¡Servicio añadido con éxito!');
      this.resetFields();
      setTimeout(() => {
        this.successMsg.set('');
      }, 3000);
    }, 1000);
  }
}
