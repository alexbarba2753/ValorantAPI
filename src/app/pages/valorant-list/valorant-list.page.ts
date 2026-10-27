import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonChip,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonText,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  searchOutline,
  refreshOutline,
  alertCircleOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { ValorantService } from '../../services/valorant';
import { FavoritesService } from '../../services/favorites';
import { FavoriteItem } from '../../models/valorant.models';

export type ValorantCategory = 'agents' | 'maps' | 'skins' | 'favorites';

@Component({
  selector: 'app-valorant-list',
  templateUrl: './valorant-list.page.html',
  styleUrls: ['./valorant-list.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSearchbar,
    IonChip,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonText,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
  ],
})
export class ValorantListPage implements OnInit {
  private valorantService = inject(ValorantService);
  private favoritesService = inject(FavoritesService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private toastController = inject(ToastController);

  // Categoría seleccionada por el usuario (Agentes, Mapas, Skins o Favoritos)
  selectedCategory: ValorantCategory = 'agents';

  // Término de búsqueda y opciones de filtro (Requisito R3)
  searchTerm: string = '';
  selectedFilter: string = 'Todos';
  availableFilters: string[] = [];

  // Datos completos de la API, filtrados por búsqueda y mostrados en pantalla
  allItems: any[] = [];
  filteredItems: any[] = [];
  displayedItems: any[] = [];

  // Variables de control de estado para el Infinite Scroll (Requisito R2) y Estados (Requisito R5)
  pageSize: number = 6;
  currentPage: number = 1;
  hasMore: boolean = true;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  errorMessage: string = '';
  isNetworkError: boolean = false;

  constructor() {
    addIcons({
      cloudOfflineOutline,
      searchOutline,
      refreshOutline,
      alertCircleOutline,
      star,
      starOutline,
    });
  }

  ngOnInit(): void {
    this.loadCategoryData();
  }

  async ionViewDidEnter(): Promise<void> {
    await this.favoritesService.refreshCache();
    if (this.selectedCategory === 'favorites') {
      this.loadCategoryData();
    } else if (this.allItems.length === 0 && !this.isLoading) {
      this.loadCategoryData();
    } else {
      this.cdr.markForCheck();
    }
  }

  /**
   * Carga los datos remotos usando el servicio HTTP o favoritos locales (Requisitos R5, R6 y R7)
   */
  async loadCategoryData(refresherEvent?: any): Promise<void> {
    if (!refresherEvent) {
      this.isLoading = true;
    }
    this.errorMessage = '';
    this.isNetworkError = false;
    this.allItems = [];
    this.filteredItems = [];
    this.displayedItems = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.cdr.markForCheck();

    // Caso de categoría Favoritos (Requisito R6)
    if (this.selectedCategory === 'favorites') {
      try {
        const favs = await this.favoritesService.getFavorites();
        this.allItems = favs;
        this.updateAvailableFilters();
        this.applyFilter();
      } catch (err) {
        console.error('[ValorantListPage] Error al leer favoritos:', err);
        this.errorMessage = 'No se pudieron recuperar los favoritos locales.';
      } finally {
        this.isLoading = false;
        if (refresherEvent) {
          refresherEvent.target.complete();
        }
        this.cdr.markForCheck();
      }
      return;
    }

    // Caso de categorías remotas (Agentes, Mapas, Skins)
    let request$: Observable<any[]>;
    if (this.selectedCategory === 'agents') {
      request$ = this.valorantService.getAgents();
    } else if (this.selectedCategory === 'maps') {
      request$ = this.valorantService.getMaps();
    } else {
      request$ = this.valorantService.getSkins();
    }

    request$.subscribe({
      next: (data: any[]) => {
        this.allItems = data || [];
        this.updateAvailableFilters();
        this.applyFilter();
        this.isLoading = false;
        if (refresherEvent) {
          refresherEvent.target.complete();
        }
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('[ValorantListPage] Error al consultar Valorant API:', error);
        this.isNetworkError = !navigator.onLine || error.status === 0;
        this.errorMessage = this.isNetworkError
          ? 'Error de red: No se pudo conectar con el servidor de Valorant. Revisa tu conexión.'
          : 'Ocurrió un error al cargar la información. Intenta de nuevo.';
        this.isLoading = false;
        this.hasMore = false;
        if (refresherEvent) {
          refresherEvent.target.complete();
        }
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Permite recargar los datos mediante gesto Pull-To-Refresh (Requisito R5 y Extensión)
   */
  handleRefresh(event: any): void {
    this.loadCategoryData(event);
  }

  /**
   * Muestra un mensaje Toast flotante no bloqueante (Requisito R5)
   */
  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  /**
   * Comprueba si un UUID está marcado en favoritos (Requisito R6)
   */
  isFavorite(uuid: string): boolean {
    return this.favoritesService.isFavorite(uuid);
  }

  /**
   * Alterna el estado de favorito de un elemento con Capacitor Preferences (Requisito R6)
   */
  async toggleFavorite(event: Event, item: any): Promise<void> {
    event.stopPropagation();

    let category: 'agents' | 'maps' | 'skins' = 'agents';
    let subtitle = '';
    let imageUrl = '';

    if (this.selectedCategory === 'favorites') {
      category = item.category || 'agents';
      subtitle = item.subtitle || '';
      imageUrl = item.imageUrl || '';
    } else if (this.selectedCategory === 'agents') {
      category = 'agents';
      subtitle = item.role?.displayName || 'Agente';
      imageUrl = item.fullPortrait || item.displayIcon || '';
    } else if (this.selectedCategory === 'maps') {
      category = 'maps';
      subtitle = item.tacticalDescription || item.coordinates || 'Mapa';
      imageUrl = item.splash || item.displayIcon || '';
    } else if (this.selectedCategory === 'skins') {
      category = 'skins';
      subtitle = 'Aspecto de Arma';
      imageUrl = item.displayIcon || item.wallpaper || '';
    }

    const favItem: FavoriteItem = {
      uuid: item.uuid,
      category,
      displayName: item.displayName,
      subtitle,
      imageUrl,
      extraInfo: item.description || item.narrativeDescription || '',
    };

    const isAdded = await this.favoritesService.toggleFavorite(favItem);

    if (this.selectedCategory === 'favorites') {
      await this.loadCategoryData();
    }

    await this.showToast(isAdded ? '★ Agregado a favoritos' : '☆ Eliminado de favoritos');
    this.cdr.markForCheck();
  }

  /**
   * Genera las opciones disponibles para filtrar según la categoría activa
   */
  updateAvailableFilters(): void {
    if (this.selectedCategory === 'agents') {
      const roles = Array.from(
        new Set(
          this.allItems
            .map((item) => item.role?.displayName)
            .filter((role): role is string => !!role)
        )
      ).sort();
      this.availableFilters = ['Todos', ...roles];
      this.selectedFilter = 'Todos';
    } else if (this.selectedCategory === 'maps') {
      const sites = Array.from(
        new Set(
          this.allItems
            .map((item) => item.tacticalDescription)
            .filter((desc): desc is string => !!desc)
        )
      ).sort();
      this.availableFilters = ['Todos', ...sites];
      this.selectedFilter = 'Todos';
    } else if (this.selectedCategory === 'skins') {
      this.availableFilters = ['Todas', 'Vandal', 'Phantom', 'Operator', 'Sheriff', 'Ghost', 'Spectre', 'Knife'];
      this.selectedFilter = 'Todas';
    } else if (this.selectedCategory === 'favorites') {
      this.availableFilters = ['Todos', 'Agentes', 'Mapas', 'Skins'];
      this.selectedFilter = 'Todos';
    }
  }

  /**
   * Selecciona una opción de filtro rápida (Chips)
   */
  selectFilter(filterOption: string): void {
    this.selectedFilter = filterOption;
    this.applyFilter();
  }

  /**
   * Filtra los elementos según el término de búsqueda y el filtro seleccionado (Requisito R3)
   */
  applyFilter(): void {
    const query = this.searchTerm.trim().toLowerCase();
    const filter = this.selectedFilter;

    this.filteredItems = this.allItems.filter((item) => {
      // 1. Coincidencia con el filtro de opción (chip)
      let matchesFilter = true;
      if (this.selectedCategory === 'agents' && filter !== 'Todos') {
        matchesFilter = item.role?.displayName === filter;
      } else if (this.selectedCategory === 'maps' && filter !== 'Todos') {
        matchesFilter = item.tacticalDescription === filter;
      } else if (this.selectedCategory === 'skins' && filter !== 'Todas') {
        matchesFilter = (item.displayName || '').toLowerCase().includes(filter.toLowerCase());
      } else if (this.selectedCategory === 'favorites' && filter !== 'Todos') {
        if (filter === 'Agentes') matchesFilter = item.category === 'agents';
        else if (filter === 'Mapas') matchesFilter = item.category === 'maps';
        else if (filter === 'Skins') matchesFilter = item.category === 'skins';
      }

      if (!matchesFilter) {
        return false;
      }

      // 2. Coincidencia con el texto ingresado en el buscador
      if (!query) {
        return true;
      }
      const name = (item.displayName || '').toLowerCase();
      const role = (item.role?.displayName || item.subtitle || '').toLowerCase();
      const tactical = (item.tacticalDescription || item.extraInfo || '').toLowerCase();
      return name.includes(query) || role.includes(query) || tactical.includes(query);
    });

    // Reiniciar paginación para la nueva consulta (Criterio R3)
    this.currentPage = 1;
    this.displayedItems = [];
    this.hasMore = true;
    this.appendNextBatch();
  }

  /**
   * Manejador de evento al escribir en el ion-searchbar (Requisito R3)
   */
  onSearch(event: any): void {
    this.searchTerm = event.detail.value || '';
    this.applyFilter();
  }

  /**
   * Limpia la búsqueda actual
   */
  onClearSearch(): void {
    this.searchTerm = '';
    this.selectedFilter = this.availableFilters[0] || 'Todos';
    this.applyFilter();
  }

  /**
   * Anexa el siguiente bloque de elementos a la lista sin duplicados (Requisito R2)
   */
  appendNextBatch(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const batch = this.filteredItems.slice(startIndex, endIndex);

    // Anexamos elementos al acumulador
    this.displayedItems = [...this.displayedItems, ...batch];

    // Si ya mostramos todos los elementos filtrados disponibles, detenemos el infinite scroll
    if (this.displayedItems.length >= this.filteredItems.length) {
      this.hasMore = false;
    }
    this.cdr.markForCheck();
  }

  /**
   * Manejador del evento de ion-infinite-scroll (Requisito R2 y R5)
   * Garantiza llamar complete() incluso ante fallos para no bloquear la interfaz.
   */
  loadMore(event: any): void {
    // Evitar solicitudes simultáneas si ya está cargando o no hay más
    if (this.isLoadingMore || !this.hasMore) {
      event.target.complete();
      return;
    }

    this.isLoadingMore = true;

    // Retardo breve de 500ms para simular la carga progresiva
    setTimeout(() => {
      try {
        this.currentPage++;
        this.appendNextBatch();
      } catch (err) {
        console.error('[ValorantListPage] Error en carga incremental:', err);
        this.showToast('No se pudieron cargar más elementos.');
      } finally {
        this.isLoadingMore = false;
        this.cdr.markForCheck();
        event.target.complete();
      }
    }, 500);
  }

  /**
   * Cambia la categoría al tocar el ion-segment y reinicia la paginación y búsqueda
   */
  onSegmentChange(event: any): void {
    const value = event.detail.value as ValorantCategory;
    if (value && value !== this.selectedCategory) {
      this.selectedCategory = value;
      this.searchTerm = '';
      this.loadCategoryData();
    }
  }

  /**
   * Navega a la vista de detalle del elemento seleccionado (Requisito R4)
   */
  goToDetail(item: any): void {
    if (!item?.uuid) return;
    const cat = this.selectedCategory === 'favorites' ? (item.category || 'agents') : this.selectedCategory;
    this.router.navigate(['/detail', cat, item.uuid]);
  }
}
