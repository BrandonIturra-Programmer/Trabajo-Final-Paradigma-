import { v4 as uuidv4 } from 'uuid';

/**
 * Enum que representa el estado de una tarea.
 * - PENDIENTE: Aún no iniciada
 * - EN_CURSO: En progreso
 * - TERMINADA: Finalizada
 * - CANCELADA: Cancelada
 */
export enum EstadoTarea {
  PENDIENTE = 1,
  EN_CURSO = 2,
  TERMINADA = 3,
  CANCELADA = 4
}

/**
 * Enum que representa la dificultad de una tarea.
 */
export enum DificultadTarea {
  DIFICIL = 1,
  MEDIO = 2,
  FACIL = 3
}

/**
 * Enum que representa la prioridad de una tarea.
 */
export enum PrioridadTarea {
  BAJA = 1,
  MEDIA = 2,
  ALTA = 3,
  URGENTE = 4
}

/**
 * Representa una tarea en el sistema.
 * Todas las propiedades son inmutables para fomentar programación funcional.
 */
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

/**
 * Genera un ID único para una tarea (UUID v4).
 * @returns {string} UUID v4
 */
const generarId = (): string => {
  return uuidv4();
};

/**
 * Crea una nueva tarea inmutable con valores por defecto.
 * @param titulo - Título de la tarea
 * @param descripcion - Descripción opcional
 * @param estado - Estado inicial
 * @param dificultad - Dificultad inicial
 * @param prioridad - Prioridad inicial
 * @param fechaVencimiento - Fecha límite (timestamp) o null
 * @returns {Tarea} Tarea creada y congelada (inmutable)
 */
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

/**
 * Devuelve una nueva instancia de tarea con el título actualizado.
 */
export const actualizarTitulo = (tarea: Tarea, titulo: string): Tarea =>
  Object.freeze({ ...tarea, titulo, fechaUltimaEdicion: Date.now() });

/**
 * Devuelve una nueva instancia de tarea con la descripción actualizada.
 */
export const actualizarDescripcion = (tarea: Tarea, descripcion: string): Tarea =>
  Object.freeze({ ...tarea, descripcion, fechaUltimaEdicion: Date.now() });

/**
 * Devuelve una nueva instancia de tarea con el estado actualizado.
 */
export const actualizarEstado = (tarea: Tarea, estado: EstadoTarea): Tarea =>
  Object.freeze({ ...tarea, estado, fechaUltimaEdicion: Date.now() });

/**
 * Devuelve una nueva instancia de tarea con la dificultad actualizada.
 */
export const actualizarDificultad = (tarea: Tarea, dificultad: DificultadTarea): Tarea =>
  Object.freeze({ ...tarea, dificultad, fechaUltimaEdicion: Date.now() });

/**
 * Devuelve una nueva instancia de tarea con la prioridad actualizada.
 */
export const actualizarPrioridad = (tarea: Tarea, prioridad: PrioridadTarea): Tarea =>
  Object.freeze({ ...tarea, prioridad, fechaUltimaEdicion: Date.now() });

/**
 * Actualiza la fecha de vencimiento y devuelve una nueva tarea inmutable.
 */
export const actualizarFechaVencimiento = (tarea: Tarea, fecha: number | null): Tarea =>
  Object.freeze({ ...tarea, fechaVencimiento: fecha, fechaUltimaEdicion: Date.now() });

/**
 * Marca una tarea como eliminada (soft delete).
 */
export const marcarEliminada = (tarea: Tarea): Tarea =>
  Object.freeze({ ...tarea, eliminada: true, fechaUltimaEdicion: Date.now() });

/**
 * Restaura una tarea previamente eliminada.
 */
export const restaurarTarea = (tarea: Tarea): Tarea =>
  Object.freeze({ ...tarea, eliminada: false, fechaUltimaEdicion: Date.now() });

/**
 * Agrega una relación (ID) a otra tarea de manera inmutable. No duplica relaciones.
 */
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

/**
 * Quita una relación de tarea y devuelve una nueva tarea inmutable.
 */
export const quitarRelacion = (tarea: Tarea, idTareaRelacionada: string): Tarea =>
  Object.freeze({
    ...tarea,
    tareasRelacionadas: Object.freeze(
      tarea.tareasRelacionadas.filter(id => id !== idTareaRelacionada)
    ),
    fechaUltimaEdicion: Date.now()
  });

/**
 * Predicado: true si la tarea está en estado TERMINADA.
 */
export const estaCompletada = (tarea: Tarea): boolean =>
  tarea.estado === EstadoTarea.TERMINADA;

/**
 * Predicado: true si la tarea está marcada como eliminada.
 */
export const estaEliminada = (tarea: Tarea): boolean =>
  tarea.eliminada;

/**
 * Predicado: true si la tarea venció y no está terminada.
 */
export const estaVencida = (tarea: Tarea): boolean => {
  if (!tarea.fechaVencimiento) return false;
  if (tarea.estado === EstadoTarea.TERMINADA) return false;
  return Date.now() > tarea.fechaVencimiento;
};

/**
 * Predicado: true si la tarea tiene prioridad ALTA u URGENTE.
 */
export const esAltaPrioridad = (tarea: Tarea): boolean =>
  tarea.prioridad === PrioridadTarea.ALTA || tarea.prioridad === PrioridadTarea.URGENTE;

/**
 * Convierte un EstadoTarea a su representación legible.
 */
export const estadoATexto = (estado: EstadoTarea): string => {
  const textos: Record<EstadoTarea, string> = {
    [EstadoTarea.PENDIENTE]: "Pendiente",
    [EstadoTarea.EN_CURSO]: "En Curso",
    [EstadoTarea.TERMINADA]: "Terminada",
    [EstadoTarea.CANCELADA]: "Cancelada"
  };
  return textos[estado] ?? "Desconocido";
};

/**
 * Convierte una DificultadTarea a su representación legible.
 */
export const dificultadATexto = (dificultad: DificultadTarea): string => {
  const textos: Record<DificultadTarea, string> = {
    [DificultadTarea.DIFICIL]: "Difícil",
    [DificultadTarea.MEDIO]: "Medio",
    [DificultadTarea.FACIL]: "Fácil"
  };
  return textos[dificultad] ?? "Desconocido";
};

/**
 * Convierte una PrioridadTarea a su representación legible.
 */
export const prioridadATexto = (prioridad: PrioridadTarea): string => {
  const textos: Record<PrioridadTarea, string> = {
    [PrioridadTarea.BAJA]: "Baja",
    [PrioridadTarea.MEDIA]: "Media",
    [PrioridadTarea.ALTA]: "Alta",
    [PrioridadTarea.URGENTE]: "Urgente"
  };
  return textos[prioridad] ?? "Desconocido";
};

/**
 * Formatea un timestamp a cadena legible en locale 'es-AR'.
 * Si el timestamp es null, devuelve 'Sin fecha'.
 */
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