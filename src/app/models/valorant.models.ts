// Interfaces para la API de Valorant (Requisito R7)

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export interface AgentRole {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface AgentAbility {
  slot: string;
  displayName: string;
  description: string;
  displayIcon?: string;
}

export interface Agent {
  uuid: string;
  displayName: string;
  description: string;
  developerName?: string;
  displayIcon?: string;
  fullPortrait?: string;
  isPlayableCharacter: boolean;
  role?: AgentRole;
  abilities?: AgentAbility[];
}

export interface ValorantMap {
  uuid: string;
  displayName: string;
  narrativeDescription?: string;
  tacticalDescription?: string;
  coordinates?: string;
  displayIcon?: string;
  listViewIcon?: string;
  splash?: string;
}

export interface SkinChroma {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  fullRender?: string;
}

export interface SkinLevel {
  uuid: string;
  displayName: string;
  levelItem?: string;
  displayIcon?: string;
}

export interface WeaponSkin {
  uuid: string;
  displayName: string;
  themeUuid?: string;
  contentTierUuid?: string;
  displayIcon?: string;
  wallpaper?: string;
  chromas?: SkinChroma[];
  levels?: SkinLevel[];
}

// Interfaz para la persistencia de favoritos con Capacitor Preferences (Requisito R6)
export interface FavoriteItem {
  uuid: string;
  category: 'agents' | 'maps' | 'skins';
  displayName: string;
  subtitle?: string;
  imageUrl?: string;
  extraInfo?: string;
}
