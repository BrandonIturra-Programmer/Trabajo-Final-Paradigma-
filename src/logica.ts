import {
  Tarea,
  EstadoTarea,
  PrioridadTarea,
  estaVencida,
  estaCompletada,
  esAltaPrioridad
} from './types';

/**
 * Predicado genérico para usar en filtros (funciones puras)
 */
export type Predicate<T> = (x: T) => boolean;

/** Combina predicados con AND */
export const and = <T>(...preds: Predicate<T>[]): Predicate<T> =>
  (x: T) => preds.every(p => p(x));

/** Combina predicados con OR */
export const or = <T>(...preds: Predicate<T>[]): Predicate<T> =>
  (x: T) => preds.some(p => p(x));

/** Niega un predicado */
export const not = <T>(p: Predicate<T>): Predicate<T> =>
  (x: T) => !p(x);

// ===== Predicados específicos de Tarea =====
export const esPendiente: Predicate<Tarea> = t => t.estado === EstadoTarea.PENDIENTE;
export const esEnCurso: Predicate<Tarea> = t => t.estado === EstadoTarea.EN_CURSO;
export const esTerminada: Predicate<Tarea> = t => t.estado === EstadoTarea.TERMINADA;
export const esCancelada: Predicate<Tarea> = t => t.estado === EstadoTarea.CANCELADA;
export const tieneDescripcion: Predicate<Tarea> = t => !!t.descripcion && t.descripcion.trim().length > 0;
export const tieneFechaVencimiento: Predicate<Tarea> = t => t.fechaVencimiento !== null;
export const tieneRelacionCon = (id: string): Predicate<Tarea> => t => t.tareasRelacionadas.includes(id);

/**
 * Tarea crítica: alta prioridad / urgente y no terminada,
 * además si está vencida o es prioridad URGENTE se considera crítica.
 */
export const esCritica: Predicate<Tarea> = t => {
  if (estaCompletada(t)) return false;
  const urgente = t.prioridad === PrioridadTarea.URGENTE;
  return esAltaPrioridad(t) && (estaVencida(t) || urgente);
};

export default {
  and,
  or,
  not,
  esPendiente,
  esEnCurso,
  esTerminada,
  esCancelada,
  tieneDescripcion,
  tieneFechaVencimiento,
  tieneRelacionCon,
  esCritica
};
