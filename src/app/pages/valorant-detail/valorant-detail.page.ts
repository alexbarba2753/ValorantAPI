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
} from '@ionic/angular';
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

  ngOnInit(): void {
    this.category = this.route.snapshot.paramMap.get('category') || 'agents';
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadDetail();
  }

  /**
   * Carga el elemento específico según su categoría y UUID (Requisito R4)
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
    this.cdr.markForCheck();

    if (this.category === 'agents') {
      this.valorantService.getAgentById(this.id).subscribe({
        next: (agent) => {
          this.item = agent;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[ValorantDetail] Error al cargar agente:', err);
          this.errorMessage = 'No se pudo obtener el detalle del agente. Revisa tu conexión.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
    } else if (this.category === 'maps') {
      this.valorantService.getMapById(this.id).subscribe({
        next: (mapData) => {
          this.item = mapData;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[ValorantDetail] Error al cargar mapa:', err);
          this.errorMessage = 'No se pudo obtener el detalle del mapa. Revisa tu conexión.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.valorantService.getSkinById(this.id).subscribe({
        next: (skin) => {
          if (!skin) {
            this.errorMessage = 'Skin no encontrada en el catálogo.';
          } else {
            this.item = skin;
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[ValorantDetail] Error al cargar skin:', err);
          this.errorMessage = 'No se pudo obtener el detalle de la skin. Revisa tu conexión.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
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
