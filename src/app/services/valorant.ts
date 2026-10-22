import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponse, Agent, ValorantMap, WeaponSkin } from '../models/valorant.models';

@Injectable({
  providedIn: 'root'
})
export class ValorantService {
  private readonly baseUrl = 'https://valorant-api.com/v1';
  private http = inject(HttpClient);

  /**
   * Obtiene la lista de agentes jugables
   */
  getAgents(): Observable<Agent[]> {
    console.log('[ValorantService] Solicitando agentes...');
    return this.http
      .get<ApiResponse<Agent[]>>(`${this.baseUrl}/agents?isPlayableCharacter=true`)
      .pipe(
        tap((res) => console.log('[ValorantService] Respuesta recibida de agentes:', res?.data?.length)),
        map((response) => (response?.data || []).filter((agent) => agent && agent.isPlayableCharacter))
      );
  }

  /**
   * Obtiene un agente por su UUID (Dejado listo para la siguiente fase)
   */
  getAgentById(agentUuid: string): Observable<Agent> {
    return this.http
      .get<ApiResponse<Agent>>(`${this.baseUrl}/agents/${agentUuid}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Obtiene la lista de mapas
   */
  getMaps(): Observable<ValorantMap[]> {
    console.log('[ValorantService] Solicitando mapas...');
    return this.http
      .get<ApiResponse<ValorantMap[]>>(`${this.baseUrl}/maps`)
      .pipe(
        tap((res) => console.log('[ValorantService] Respuesta recibida de mapas:', res?.data?.length)),
        map((response) => response?.data || [])
      );
  }

  /**
   * Obtiene un mapa por su UUID (Dejado listo para la siguiente fase)
   */
  getMapById(mapUuid: string): Observable<ValorantMap> {
    return this.http
      .get<ApiResponse<ValorantMap>>(`${this.baseUrl}/maps/${mapUuid}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Obtiene la lista de skins de armas, filtrando aquellas que tengan imagen válida
   */
  getSkins(): Observable<WeaponSkin[]> {
    console.log('[ValorantService] Solicitando skins...');
    return this.http
      .get<ApiResponse<WeaponSkin[]>>(`${this.baseUrl}/weapons/skins`)
      .pipe(
        tap((res) => console.log('[ValorantService] Respuesta recibida de skins:', res?.data?.length)),
        map((response) =>
          (response?.data || []).filter(
            (skin) =>
              !!skin &&
              !!skin.displayIcon &&
              !(skin.displayName && skin.displayName.toLowerCase().includes('standard'))
          )
        )
      );
  }
}
