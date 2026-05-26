import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editar-servicio.component.html',
  styleUrl: './editar-servicio.component.css'
})
export class EditarServicioComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  // Carga reactiva de la lista de servicios desde el mock JSON
  private serviciosData = toSignal(this.http.get<any[]>('/mock-servicios.json'));

  name = signal('Cargando...');
  hours = signal<number | null>(0);
  minutes = signal<number | null>(0);
  price = signal<number | null>(0);
  description = signal('');
  imagePreview = signal<string | null>(null);
  isActive = signal(true);

  availableCategories = [
    'Barbería',
    'Peluquería',
    'Tratamientos',
    'Estética',
    'Manicura',
    'Masajes'
  ];
  selectedCategories = signal<string[]>(['Barbería']);
  selectedCategoryDropdown = '';

  loading = signal(false);
  deleting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  constructor() {
    // Sincronizar datos del servicio obtenido desde el mock
    effect(() => {
      const lista = this.serviciosData();
      if (lista && lista.length > 0) {
        const serv = lista[0]; // Cargar el primer servicio como demostración
        this.name.set(serv.nombre);
        
        const hrs = Math.floor(serv.duracionMinutos / 60);
        const mins = serv.duracionMinutos % 60;
        this.hours.set(hrs > 0 ? hrs : null);
        this.minutes.set(mins);
        
        this.price.set(serv.precio);
        this.description.set(serv.descripcion);
        this.isActive.set(serv.activo === 1);
        
        // Categorías asociadas según el tipo
        if (serv.modalidad === 'online') {
          this.selectedCategories.set(['Estética', 'Tratamientos']);
        } else {
          this.selectedCategories.set(['Barbería', 'Peluquería']);
        }
      }
    });
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

  toggleActive() {
    this.isActive.update(v => !v);
  }

  goBack() {
    this.router.navigate(['/']);
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

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('¡Cambios guardados con éxito!');
      setTimeout(() => {
        this.goBack();
      }, 1200);
    }, 1000);
  }

  onDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.deleting.set(true);
      this.errorMsg.set('');
      this.successMsg.set('');

      setTimeout(() => {
        this.deleting.set(false);
        this.successMsg.set('Servicio eliminado correctamente.');
        setTimeout(() => {
          this.goBack();
        }, 1200);
      }, 1000);
    }
  }
}
