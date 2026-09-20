export type EstadoEmergencia = 'PENDIENTE' | 'EN_PROCESO' | 'ATENDIDA' | 'CANCELADA';

export interface Emergencia {
  id_emergencia?: number;
  id_usuario: number;
  id_tipo: number;
  titulo: string;
  descripcion: string;
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
  estado?: EstadoEmergencia;
  fecha_creacion?: Date | string;
  fecha_actualizacion?: Date | string;
  tipo_nombre?: string;
  nivel_prioridad?: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  evidencias?: string[];
  id_local?: string;
  estado_sync?: 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';
  error_sync?: string;
}
