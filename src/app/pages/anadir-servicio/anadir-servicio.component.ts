import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-anadir-servicio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './anadir-servicio.component.html',
  styleUrl: './anadir-servicio.component.css'
})
export class AnadirServicioComponent {
  private router = inject(Router);

  name = signal('');
  hours = signal<number | null>(null);
  minutes = signal<number | null>(null);
  price = signal<number | null>(null);
  description = signal('');
  imagePreview = signal<string | null>(null);

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
      this.successMsg.set('¡Servicio añadido con éxito!');
      this.resetFields();
      setTimeout(() => {
        this.successMsg.set('');
      }, 3000);
    }, 1000);
  }
}
