export type NivelNoticia =
  | 'ACCIDENTE'
  | 'AYUDA'
  | 'RESCATE'
  | 'INCENDIO'
  | 'SISMO'
  | 'INUNDACION'
  | 'DERRUMBE'
  | 'TRANSITO'
  | 'CLIMA'
  | 'PREVENCION';

export interface Noticia {
  id: string;
  level: NivelNoticia;
  title: string;
  location: string;
  createdAt: string;
  isUnread: boolean;
  description?: string;
  source?: string;
  url?: string;
  imageUrl?: string;
}

export interface RespuestaNoticias {
  unreadCount: number;
  count: number;
  country: string;
  source: string;
  alerts: Noticia[];
}
