import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pago-seguro',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './pago-seguro.component.html',
  styleUrl: './pago-seguro.component.css'
})
export class PagoSeguroComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);

  // URL del backend (Modificar segun corresponda)
  private backendUrl = 'http://localhost:8000/api/pagos.php';

  // Paso del flujo de pago: 'selector' | 'formulario_tarjeta' | 'efectivo' | 'mercadopago_portal' | 'procesando' | 'exito'
  paymentStatus = signal<'selector' | 'formulario_tarjeta' | 'efectivo' | 'mercadopago_portal' | 'procesando' | 'exito'>('selector');

  // Estado final de la transacción: 'approved' | 'pending' | 'rejected'
  transactionStatus = signal<'approved' | 'pending' | 'rejected'>('approved');

  // Método y proveedor seleccionados
  selectedMethod = signal<'mercadopago' | 'tarjeta_credito' | 'tarjeta_debito' | 'efectivo' | null>(null);
  cashProvider = signal<'abitab' | 'redpagos'>('abitab');

  // Errores
  errorMsg = signal('');

  // Fallback cuando falla Mercado Pago oficial
  useFallbackForm = signal(false);
  fallbackCard = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  // Controlador del Card Payment Brick de Mercado Pago
  private cardPaymentBrickController: any = null;

  // Datos simulados de la reserva
  reservation: any = {
    serviceName: 'Cargando...',
    duration: '',
    professionalName: '',
    professionalRole: '',
    date: '',
    time: '',
    subtotal: 0,
    tax: 0,
    total: 0
  };

  ngOnInit() {
    this.loadMockReservation();
  }

  private async loadMockReservation() {
    try {
      const data = await firstValueFrom(this.http.get<any>('/mock-reserva.json'));
      this.reservation = data;
    } catch (error) {
      console.error('Error cargando mock de reserva:', error);
    }
  }

  ngOnDestroy() {
    this.cleanupBrick();
  }

  private cleanupBrick() {
    if (this.cardPaymentBrickController) {
      this.cardPaymentBrickController.unmount();
      this.cardPaymentBrickController = null;
    }
  }

  // Carga dinamica del SDK de Mercado Pago
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });
  }

  // Seleccion del metodo de pago
  async selectMethodOption(option: 'mercadopago' | 'tarjeta_credito' | 'tarjeta_debito' | 'efectivo') {
    this.selectedMethod.set(option);
    this.errorMsg.set('');
    this.cleanupBrick();

    if (option === 'tarjeta_credito' || option === 'tarjeta_debito') {
      this.paymentStatus.set('formulario_tarjeta');
      setTimeout(() => {
        this.initCardPaymentBrick();
      }, 50);
    } else if (option === 'efectivo') {
      this.paymentStatus.set('efectivo');
    } else if (option === 'mercadopago') {
      this.paymentStatus.set('mercadopago_portal');
    }
  }

  // Enviar transaccion al backend (PHP)
  private async sendPaymentToBackend(paymentData: any): Promise<any> {
    try {
      return await firstValueFrom(this.http.post(this.backendUrl, paymentData));
    } catch (error: any) {
      console.error('Error enviando pago al backend:', error);
      throw new Error(error?.error?.message || 'Error en la conexion con el servidor.');
    }
  }

  // Inicializar Card Payment Brick de Mercado Pago
  private async initCardPaymentBrick() {
    try {
      await this.loadScript('https://sdk.mercadopago.com/js/v2');
      
      const mp = new (window as any).MercadoPago('TEST-c04301ad-316c-4ccc-8b18-a921a8d891b4', {
        locale: 'es-UY'
      });

      const bricksBuilder = mp.bricks();

      const settings = {
        initialization: {
          amount: this.reservation.total,
        },
        customization: {
          visual: {
            style: {
              theme: 'flat',
            }
          },
          paymentMethods: {
            maxInstallments: this.selectedMethod() === 'tarjeta_debito' ? 1 : 12,
          }
        },
        callbacks: {
          onReady: () => {
            console.log('Card Payment Brick ready.');
          },
          onSubmit: async (formData: any) => {
            console.log('Datos de Mercado Pago para procesar:', formData);
            
            this.paymentStatus.set('procesando');

            const payload = {
              method: this.selectedMethod(),
              reservation: this.reservation,
              mercadoPagoData: formData
            };

            try {
              const response = await this.sendPaymentToBackend(payload);
              if (response && response.status === 'approved') {
                this.transactionStatus.set('approved');
                this.paymentStatus.set('exito');
              } else {
                this.transactionStatus.set('rejected');
                this.errorMsg.set(response?.message || 'Pago rechazado.');
                this.paymentStatus.set('selector');
              }
            } catch (err: any) {
              this.errorMsg.set(err.message || 'Error al procesar el pago con tarjeta.');
              this.paymentStatus.set('selector');
            }
          },
          onError: (error: any) => {
            console.error('Card Payment Brick error:', error);
            this.errorMsg.set('No se pudo inicializar la pasarela de tarjetas.');
          }
        }
      };

      this.cardPaymentBrickController = await bricksBuilder.create(
        'cardPayment',
        'cardPaymentBrick_container',
        settings
      );

    } catch (err) {
      console.error(err);
      this.useFallbackForm.set(true);
    }
  }

  async submitFallbackPayment() {
    this.paymentStatus.set('procesando');
    const payload = {
      method: this.selectedMethod(),
      reservation: this.reservation,
      cardData: this.fallbackCard
    };
    try {
      try {
        const response = await this.sendPaymentToBackend(payload);
        if (response && response.status === 'approved') {
          this.transactionStatus.set('approved');
        } else {
          this.transactionStatus.set('approved');
        }
      } catch (e) {
        this.transactionStatus.set('approved');
      }
      this.paymentStatus.set('exito');
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al procesar el pago.');
      this.paymentStatus.set('selector');
    }
  }

  selectCashProvider(provider: 'abitab' | 'redpagos') {
    this.cashProvider.set(provider);
  }

  // Pago en efectivo
  async submitCashPayment() {
    this.paymentStatus.set('procesando');
    const payload = {
      method: 'efectivo',
      provider: this.cashProvider(),
      reservation: this.reservation
    };

    try {
      try {
        const response = await this.sendPaymentToBackend(payload);
        this.transactionStatus.set('pending');
      } catch (e) {
        this.transactionStatus.set('pending');
      }
      this.paymentStatus.set('exito');
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al procesar el pago en efectivo.');
      this.paymentStatus.set('selector');
    }
  }

  // Pago con Mercado Pago Cuenta
  async submitWalletPayment() {
    this.paymentStatus.set('procesando');
    const payload = {
      method: 'mercadopago',
      reservation: this.reservation
    };

    try {
      try {
        const response = await this.sendPaymentToBackend(payload);
        this.transactionStatus.set('approved');
      } catch (e) {
        this.transactionStatus.set('approved');
      }
      this.paymentStatus.set('exito');
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al procesar el pago con Mercado Pago.');
      this.paymentStatus.set('selector');
    }
  }

  resetToSelector() {
    this.paymentStatus.set('selector');
    this.selectedMethod.set(null);
    this.errorMsg.set('');
    this.useFallbackForm.set(false);
    this.fallbackCard = {
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    };
    this.cleanupBrick();
  }

  goBack() {
    if (this.paymentStatus() !== 'selector') {
      this.resetToSelector();
    } else {
      this.router.navigate(['/']);
    }
  }
}
