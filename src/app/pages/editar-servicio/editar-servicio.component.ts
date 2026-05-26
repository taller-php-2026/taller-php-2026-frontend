import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editar-servicio.component.html',
  styleUrl: './editar-servicio.component.css'
})
export class EditarServicioComponent {
  private router = inject(Router);

  name = signal('Corte de Cabello');
  hours = signal<number | null>(1);
  minutes = signal<number | null>(45);
  price = signal<number | null>(25.00);
  description = signal('Incluye lavado con champú premium, corte personalizado y peinado final con productos de alta gama.');
  imagePreview = signal<string | null>('https://lh3.googleusercontent.com/aida-public/AB6AXuCEspn20-vaUjouNvQfQDskzF3tBzSvh7u5f0woZSjfJLp9fwt8_P0ichHg2FPxOlrzQhoxjiXGDLD68fCrDEiNovNdAH_18Z7IGE7de3U3UEKFjKMh9-P5ko-mEF4DxeQpqPXGnjulAq1Ffl2166G-0x9mWDrT6QJ348cxhenjh6_pUcjy9FzXO3tCjAyYjK5W2DITfdKI6tY1BCtHXIm-WfKY_e0hEo0w_wyu9a6tE4GyrhqzSulTrKVL-MB7lkGuoE72BFbQujbi');
  isActive = signal(true);

  availableCategories = [
    'Barbería',
    'Peluquería',
    'Tratamientos',
    'Estética',
    'Manicura',
    'Masajes'
  ];
  selectedCategories = signal<string[]>(['Barbería', 'Tratamientos']);
  selectedCategoryDropdown = '';

  loading = signal(false);
  deleting = signal(false);
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
