import { v4 as uuidv4 } from 'uuid';

export enum EstadoTarea {
  PENDIENTE = 1,
  EN_CURSO = 2,
  TERMINADA = 3,
  CANCELADA = 4
}

export enum DificultadTarea {
  DIFICIL = 1,
  MEDIO = 2,
  FACIL = 3
}

export enum PrioridadTarea {
  BAJA = 1,
  MEDIA = 2,
  ALTA = 3,
  URGENTE = 4
}

export type Tarea = Readonly<{
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  dificultad: DificultadTarea;
  prioridad: PrioridadTarea;
  fechaCreacion: number;
  fechaUltimaEdicion: number;
  fechaVencimiento: number | null;
  tareasRelacionadas: ReadonlyArray<string>;
  eliminada: boolean;
}>;

const generarId = (): string => {
  return uuidv4();
};

export const crearTarea = (
  titulo: string,
  descripcion: string = "",
  estado: EstadoTarea = EstadoTarea.PENDIENTE,
  dificultad: DificultadTarea = DificultadTarea.FACIL,
  prioridad: PrioridadTarea = PrioridadTarea.MEDIA,
  fechaVencimiento: number | null = null
): Tarea => Object.freeze({
  id: generarId(),
  titulo,
  descripcion,
  estado,
  dificultad,
  prioridad,
  fechaCreacion: Date.now(),
  fechaUltimaEdicion: Date.now(),
  fechaVencimiento,
  tareasRelacionadas: Object.freeze([]),
  eliminada: false
});

export const actualizarTitulo = (tarea: Tarea, titulo: string): Tarea =>
  Object.freeze({ ...tarea, titulo, fechaUltimaEdicion: Date.now() });

export const actualizarDescripcion = (tarea: Tarea, descripcion: string): Tarea =>
  Object.freeze({ ...tarea, descripcion, fechaUltimaEdicion: Date.now() });

export const actualizarEstado = (tarea: Tarea, estado: EstadoTarea): Tarea =>
  Object.freeze({ ...tarea, estado, fechaUltimaEdicion: Date.now() });

export const actualizarDificultad = (tarea: Tarea, dificultad: DificultadTarea): Tarea =>
  Object.freeze({ ...tarea, dificultad, fechaUltimaEdicion: Date.now() });

export const actualizarPrioridad = (tarea: Tarea, prioridad: PrioridadTarea): Tarea =>
  Object.freeze({ ...tarea, prioridad, fechaUltimaEdicion: Date.now() });

export const actualizarFechaVencimiento = (tarea: Tarea, fecha: number | null): Tarea =>
  Object.freeze({ ...tarea, fechaVencimiento: fecha, fechaUltimaEdicion: Date.now() });

export const marcarEliminada = (tarea: Tarea): Tarea =>
  Object.freeze({ ...tarea, eliminada: true, fechaUltimaEdicion: Date.now() });

export const restaurarTarea = (tarea: Tarea): Tarea =>
  Object.freeze({ ...tarea, eliminada: false, fechaUltimaEdicion: Date.now() });

export const agregarRelacion = (tarea: Tarea, idTareaRelacionada: string): Tarea => {
  if (tarea.tareasRelacionadas.includes(idTareaRelacionada)) {
    return tarea;
  }
  return Object.freeze({
    ...tarea,
    tareasRelacionadas: Object.freeze([...tarea.tareasRelacionadas, idTareaRelacionada]),
    fechaUltimaEdicion: Date.now()
  });
};

export const quitarRelacion = (tarea: Tarea, idTareaRelacionada: string): Tarea =>
  Object.freeze({
    ...tarea,
    tareasRelacionadas: Object.freeze(
      tarea.tareasRelacionadas.filter(id => id !== idTareaRelacionada)
    ),
    fechaUltimaEdicion: Date.now()
  });

export const estaCompletada = (tarea: Tarea): boolean =>
  tarea.estado === EstadoTarea.TERMINADA;

export const estaEliminada = (tarea: Tarea): boolean =>
  tarea.eliminada;

export const estaVencida = (tarea: Tarea): boolean => {
  if (!tarea.fechaVencimiento) return false;
  if (tarea.estado === EstadoTarea.TERMINADA) return false;
  return Date.now() > tarea.fechaVencimiento;
};

export const esAltaPrioridad = (tarea: Tarea): boolean =>
  tarea.prioridad === PrioridadTarea.ALTA || tarea.prioridad === PrioridadTarea.URGENTE;

export const estadoATexto = (estado: EstadoTarea): string => {
  const textos: Record<EstadoTarea, string> = {
    [EstadoTarea.PENDIENTE]: "Pendiente",
    [EstadoTarea.EN_CURSO]: "En Curso",
    [EstadoTarea.TERMINADA]: "Terminada",
    [EstadoTarea.CANCELADA]: "Cancelada"
  };
  return textos[estado] ?? "Desconocido";
};

export const dificultadATexto = (dificultad: DificultadTarea): string => {
  const textos: Record<DificultadTarea, string> = {
    [DificultadTarea.DIFICIL]: "Difícil",
    [DificultadTarea.MEDIO]: "Medio",
    [DificultadTarea.FACIL]: "Fácil"
  };
  return textos[dificultad] ?? "Desconocido";
};

export const prioridadATexto = (prioridad: PrioridadTarea): string => {
  const textos: Record<PrioridadTarea, string> = {
    [PrioridadTarea.BAJA]: "Baja",
    [PrioridadTarea.MEDIA]: "Media",
    [PrioridadTarea.ALTA]: "Alta",
    [PrioridadTarea.URGENTE]: "Urgente"
  };
  return textos[prioridad] ?? "Desconocido";
};

export const formatearFecha = (timestamp: number | null): string => {
  if (!timestamp) return "Sin fecha";
  return new Date(timestamp).toLocaleString('es-AR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};