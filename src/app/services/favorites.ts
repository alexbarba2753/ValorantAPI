import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { FavoriteItem } from '../models/valorant.models';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'valorant_favorites';
  private favoriteIdsSet = new Set<string>();

  constructor() {
    this.refreshCache();
  }

  /**
   * Refresca el conjunto de UUIDs en memoria para verificaciones instantáneas
   */
  async refreshCache(): Promise<void> {
    const list = await this.getFavorites();
    this.favoriteIdsSet = new Set(list.map((item) => item.uuid));
  }

  /**
   * Obtiene todos los favoritos guardados desde Capacitor Preferences (Requisito R6)
   */
  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (!value) return [];
      return JSON.parse(value) as FavoriteItem[];
    } catch (err) {
      console.error('[FavoritesService] Error al leer favoritos:', err);
      return [];
    }
  }

  /**
   * Comprueba de forma síncrona/rápida si un elemento ya está en favoritos
   */
  isFavorite(uuid: string): boolean {
    return this.favoriteIdsSet.has(uuid);
  }

  /**
   * Alterna un elemento entre guardado y no guardado en favoritos
   * @returns true si se agregó, false si se quitó
   */
  async toggleFavorite(item: FavoriteItem): Promise<boolean> {
    const list = await this.getFavorites();
    const index = list.findIndex((fav) => fav.uuid === item.uuid);

    let isAdded = false;
    if (index >= 0) {
      // Si ya existe, lo eliminamos
      list.splice(index, 1);
      this.favoriteIdsSet.delete(item.uuid);
      isAdded = false;
    } else {
      // Si no existe, lo agregamos al inicio
      list.unshift(item);
      this.favoriteIdsSet.add(item.uuid);
      isAdded = true;
    }

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(list),
    });

    return isAdded;
  }

  /**
   * Elimina un elemento de favoritos por su UUID
   */
  async removeFavorite(uuid: string): Promise<void> {
    const list = await this.getFavorites();
    const updated = list.filter((fav) => fav.uuid !== uuid);
    this.favoriteIdsSet.delete(uuid);
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(updated),
    });
  }
}
