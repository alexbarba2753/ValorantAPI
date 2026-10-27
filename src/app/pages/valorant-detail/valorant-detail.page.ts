import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSpinner,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonChip,
  IonLabel,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { ValorantService } from '../../services/valorant';

@Component({
  selector: 'app-valorant-detail',
  templateUrl: './valorant-detail.page.html',
  styleUrls: ['./valorant-detail.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonSpinner,
    IonText,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonChip,
    IonLabel,
    IonIcon,
  ],
})
export class ValorantDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private valorantService = inject(ValorantService);
  private cdr = inject(ChangeDetectorRef);

  category: string = 'agents';
  id: string = '';
  item: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  isNetworkError: boolean = false;

  constructor() {
    addIcons({
      cloudOfflineOutline,
      alertCircleOutline,
    });
  }

  ngOnInit(): void {
    this.category = this.route.snapshot.paramMap.get('category') || 'agents';
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadDetail();
  }

  /**
   * Carga el elemento específico según su categoría y UUID (Requisitos R4 y R5)
   */
  loadDetail(): void {
    if (!this.id) {
      this.errorMessage = 'Identificador no válido.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.isNetworkError = false;
    this.cdr.markForCheck();

    const handleError = (err: any) => {
      console.error('[ValorantDetail] Error al cargar detalle:', err);
      this.isNetworkError = !navigator.onLine || err.status === 0;
      this.errorMessage = this.isNetworkError
        ? 'Error de red: No se pudo conectar con el servidor. Revisa tu conexión.'
        : 'No se pudo obtener el detalle solicitado. Intenta nuevamente.';
      this.isLoading = false;
      this.cdr.markForCheck();
    };

    if (this.category === 'agents') {
      this.valorantService.getAgentById(this.id).subscribe({
        next: (agent) => {
          this.item = agent;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: handleError,
      });
    } else if (this.category === 'maps') {
      this.valorantService.getMapById(this.id).subscribe({
        next: (mapData) => {
          this.item = mapData;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: handleError,
      });
    } else {
      this.valorantService.getSkinById(this.id).subscribe({
        next: (skin) => {
          if (!skin) {
            this.errorMessage = 'Aspecto (skin) no encontrado en el catálogo.';
          } else {
            this.item = skin;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: handleError,
      });
    }
  }

  getCategoryTitle(): string {
    switch (this.category) {
      case 'agents':
        return 'Detalle del Agente';
      case 'maps':
        return 'Detalle del Mapa';
      case 'skins':
        return 'Detalle del Aspecto';
      default:
        return 'Detalle';
    }
  }
}
