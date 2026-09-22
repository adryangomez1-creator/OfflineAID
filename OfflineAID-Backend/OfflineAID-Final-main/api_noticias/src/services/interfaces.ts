export type EmergencyLevel =
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

export interface EmergencyAlert {
  id: string;
  level: EmergencyLevel;
  title: string;
  location: string;
  createdAt: string;
  isUnread: boolean;
  description?: string;
  source?: string;
  url?: string;
  imageUrl?: string;
}
