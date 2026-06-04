import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-servicio.component.html',
  styleUrl: './editar-servicio.component.css'
})
export class EditarServicioComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  // Carga reactiva de la lista de servicios desde el mock JSON
  private serviciosData = toSignal(this.http.get<any[]>('/mock-servicios.json'));

  name = signal('Cargando...');
  hours = signal<number | null>(0);
  minutes = signal<number | null>(0);
  price = signal<number | null>(0);
  description = signal('');
  imagePreview = signal<string | null>(null);
  isActive = signal(true);

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

  // Inicializar componente.
  ngOnInit(): void {
    this.http.get<any[]>('/mock-ciclo-agenda.json').subscribe((datos) => {
      this.ciclos.set(datos || []);
      const idParam = this.route.snapshot.queryParamMap.get('id');
      if (idParam) {
        const idServ = +idParam;
        const asociados = (datos || [])
          .filter((c) => c.serviciosIds && c.serviciosIds.includes(idServ))
          .map((c) => c.id);
        this.selectedCiclos.set(asociados);
      }
    });
  }

  // Cambiar selección de ciclo.
  toggleCiclo(id: number): void {
    this.selectedCiclos.update((lista) =>
      lista.includes(id) ? lista.filter((c) => c !== id) : [...lista, id]
    );
  }

  constructor() {
    // Sincronizar datos del servicio obtenido desde el mock
    effect(() => {
      const lista = this.serviciosData();
      if (lista && lista.length > 0) {
        const idParam = this.route.snapshot.queryParamMap.get('id');
        const serv = idParam ? (lista.find(s => s.idServicio === +idParam) || lista[0]) : lista[0];
        
        this.name.set(serv.nombre);
        
        const hrs = Math.floor(serv.duracionMinutos / 60);
        const mins = serv.duracionMinutos % 60;
        this.hours.set(hrs > 0 ? hrs : null);
        this.minutes.set(mins);
        
         this.price.set(serv.precio);
        this.description.set(serv.descripcion);
        this.imagePreview.set(serv.fotoUrl || null);
        this.isActive.set(serv.activo === 1);

        this.modalidad.set(serv.modalidad || 'presencial');
        this.direccion.set(serv.ubicacion?.direccion || '');
        this.ciudad.set(serv.ubicacion?.ciudad || '');
        this.proveedor.set(serv.videoSesion?.proveedor || '');
        this.urlAcceso.set(serv.videoSesion?.urlAcceso || '');
        this.nombreSala.set(serv.videoSesion?.nombreSala || '');
        
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

  // Eliminar foto del servicio.
  quitarFoto(): void {
    this.imagePreview.set(null);
  }

  toggleActive() {
    this.isActive.update(v => !v);
  }

  goBack() {
    this.router.navigate(['/configurar-servicios']);
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
      this.successMsg.set('¡Cambios guardados con éxito!');
      setTimeout(() => {
        this.successMsg.set('');
      }, 3000);
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
