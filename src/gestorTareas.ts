/**
 * @fileoverview Gestor de tareas - Lógica de negocio
 * Paradigma: POO + Programación Funcional
 */

import {
  Tarea,
  EstadoTarea,
  DificultadTarea,
  PrioridadTarea,
  crearTarea,
  actualizarTitulo,
  actualizarDescripcion,
  actualizarEstado,
  actualizarDificultad,
  actualizarPrioridad,
  actualizarFechaVencimiento,
  marcarEliminada,
  restaurarTarea,
  agregarRelacion,
  quitarRelacion,
  estaVencida,
  esAltaPrioridad,
  estaEliminada
} from './types';
import { Predicate, esCritica } from './logica';

import {
  validarStringNoVacio,
  validarLongitudMinima,
  validarEstado,
  validarDificultad,
  validarPrioridad,
  validarFechaVencimiento,
  validarId
} from './validators';

/**
 * Clase genérica para gestionar una colección de elementos
 * Paradigma: POO - Uso de genéricos para reutilización
 * @template T - Tipo de elementos a gestionar
 */
class GestorGenerico<T> {
  protected items: T[];

  /**
   * Constructor del gestor genérico
   * @param itemsIniciales - Array inicial de elementos
   */
  constructor(itemsIniciales: T[] = []) {
    this.items = [...itemsIniciales];
  }

  /**
   * Obtiene todos los elementos de forma inmutable
   * @returns Array de solo lectura con todos los elementos
   */
  obtenerTodos(): readonly T[] {
    return Object.freeze([...this.items]);
  }

  /**
   * Obtiene la cantidad total de elementos
   * @returns Número de elementos en la colección
   */
  obtenerCantidad(): number {
    return this.items.length;
  }

  /**
   * Limpia todos los elementos de la colección
   */
  limpiar(): void {
    this.items = [];
  }
}

/**
 * Gestor principal de tareas
 * Encapsula toda la lógica de negocio relacionada con las tareas
 * Paradigma: POO - Encapsulación y responsabilidad única
 */
export class GestorTareas extends GestorGenerico<Tarea> {
  /**
   * Constructor del gestor de tareas
   * @param tareasIniciales - Array inicial de tareas
   */
  constructor(tareasIniciales: Tarea[] = []) {
    super(tareasIniciales);
  }

  // ============ OPERACIONES CRUD ============

  /**
   * Agrega una nueva tarea al sistema
   * @param titulo - Título de la tarea (mínimo 3 caracteres)
   * @param descripcion - Descripción opcional de la tarea
   * @param estado - Estado inicial de la tarea
   * @param dificultad - Nivel de dificultad de la tarea
   * @param prioridad - Nivel de prioridad de la tarea
   * @param fechaVencimiento - Fecha límite opcional (timestamp)
   * @returns La tarea creada
   * @throws {Error} Si alguna validación falla
   */
  agregar(
    titulo: string,
    descripcion: string = "",
    estado: EstadoTarea = EstadoTarea.PENDIENTE,
    dificultad: DificultadTarea = DificultadTarea.FACIL,
    prioridad: PrioridadTarea = PrioridadTarea.MEDIA,
    fechaVencimiento: number | null = null
  ): Tarea {
    // Validaciones de entrada
    validarStringNoVacio(titulo, 'título');
    validarLongitudMinima(titulo, 3, 'título');
    validarEstado(estado);
    validarDificultad(dificultad);
    validarPrioridad(prioridad);
    validarFechaVencimiento(fechaVencimiento);

    const nuevaTarea = crearTarea(
      titulo,
      descripcion,
      estado,
      dificultad,
      prioridad,
      fechaVencimiento
    );

    this.items.push(nuevaTarea);
    return nuevaTarea;
  }

  /**
   * Busca una tarea por su ID
   * @param id - Identificador único de la tarea
   * @returns La tarea encontrada o undefined si no existe o está eliminada
   */
  buscarPorId(id: string): Tarea | undefined {
    return this.items.find(t => t.id === id && !t.eliminada);
  }

  /**
   * Actualiza una tarea aplicando una función de transformación
   * Paradigma: Funcional - Función de orden superior
   * @param id - ID de la tarea a actualizar
   * @param transformacion - Función que transforma la tarea
   * @returns La tarea actualizada
   * @throws {Error} Si la tarea no se encuentra
   * @private
   */
  private actualizarTarea(id: string, transformacion: (tarea: Tarea) => Tarea): Tarea {
    validarId(id);
    
    const indice = this.items.findIndex(t => t.id === id);
    
    if (indice === -1) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }

    this.items[indice] = transformacion(this.items[indice]);
    return this.items[indice];
  }

  /**
   * Modifica el título de una tarea
   * @param id - ID de la tarea
   * @param nuevoTitulo - Nuevo título (mínimo 3 caracteres)
   * @returns La tarea actualizada
   * @throws {Error} Si el título es inválido o la tarea no existe
   */
  modificarTitulo(id: string, nuevoTitulo: string): Tarea {
    validarStringNoVacio(nuevoTitulo, 'título');
    validarLongitudMinima(nuevoTitulo, 3, 'título');
    return this.actualizarTarea(id, t => actualizarTitulo(t, nuevoTitulo));
  }

  /**
   * Modifica la descripción de una tarea
   * @param id - ID de la tarea
   * @param nuevaDescripcion - Nueva descripción
   * @returns La tarea actualizada
   * @throws {Error} Si la tarea no existe
   */
  modificarDescripcion(id: string, nuevaDescripcion: string): Tarea {
    return this.actualizarTarea(id, t => actualizarDescripcion(t, nuevaDescripcion));
  }

  /**
   * Cambia el estado de una tarea
   * @param id - ID de la tarea
   * @param nuevoEstado - Nuevo estado
   * @returns La tarea actualizada
   * @throws {Error} Si el estado es inválido o la tarea no existe
   */
  cambiarEstado(id: string, nuevoEstado: EstadoTarea): Tarea {
    validarEstado(nuevoEstado);
    return this.actualizarTarea(id, t => actualizarEstado(t, nuevoEstado));
  }

  /**
   * Cambia la dificultad de una tarea
   * @param id - ID de la tarea
   * @param nuevaDificultad - Nueva dificultad
   * @returns La tarea actualizada
   * @throws {Error} Si la dificultad es inválida o la tarea no existe
   */
  cambiarDificultad(id: string, nuevaDificultad: DificultadTarea): Tarea {
    validarDificultad(nuevaDificultad);
    return this.actualizarTarea(id, t => actualizarDificultad(t, nuevaDificultad));
  }

  /**
   * Cambia la prioridad de una tarea
   * @param id - ID de la tarea
   * @param nuevaPrioridad - Nueva prioridad
   * @returns La tarea actualizada
   * @throws {Error} Si la prioridad es inválida o la tarea no existe
   */
  cambiarPrioridad(id: string, nuevaPrioridad: PrioridadTarea): Tarea {
    validarPrioridad(nuevaPrioridad);
    return this.actualizarTarea(id, t => actualizarPrioridad(t, nuevaPrioridad));
  }

  /**
   * Modifica la fecha de vencimiento de una tarea
   * @param id - ID de la tarea
   * @param nuevaFecha - Nueva fecha de vencimiento (timestamp o null)
   * @returns La tarea actualizada
   * @throws {Error} Si la fecha es pasada o la tarea no existe
   */
  modificarFechaVencimiento(id: string, nuevaFecha: number | null): Tarea {
    validarFechaVencimiento(nuevaFecha);
    return this.actualizarTarea(id, t => actualizarFechaVencimiento(t, nuevaFecha));
  }

  /**
   * Elimina una tarea de forma lógica (soft delete)
   * La tarea permanece en el sistema pero marcada como eliminada
   * @param id - ID de la tarea
   * @returns La tarea marcada como eliminada
   * @throws {Error} Si la tarea no existe
   */
  eliminar(id: string): Tarea {
    return this.actualizarTarea(id, marcarEliminada);
  }

  /**
   * Elimina permanentemente una tarea (hard delete)
   * La tarea se elimina físicamente del sistema
   * @param id - ID de la tarea
   * @returns true si se eliminó, false si no se encontró
   */
  eliminarPermanente(id: string): boolean {
    validarId(id);
    const indiceInicial = this.items.length;
    this.items = this.items.filter(t => t.id !== id);
    return this.items.length < indiceInicial;
  }

  /**
   * Restaura una tarea previamente eliminada
   * @param id - ID de la tarea
   * @returns La tarea restaurada
   * @throws {Error} Si la tarea no existe
   */
  restaurar(id: string): Tarea {
    validarId(id);
    
    const indice = this.items.findIndex(t => t.id === id);
    
    if (indice === -1) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }

    this.items[indice] = restaurarTarea(this.items[indice]);
    return this.items[indice];
  }

  // ============ RELACIONES ENTRE TAREAS ============

  /**
   * Crea una relación bidireccional entre dos tareas
   * @param idTarea1 - ID de la primera tarea
   * @param idTarea2 - ID de la segunda tarea
   * @throws {Error} Si alguna tarea no existe o si son la misma
   */
  relacionarTareas(idTarea1: string, idTarea2: string): void {
    validarId(idTarea1);
    validarId(idTarea2);
    
    if (idTarea1 === idTarea2) {
      throw new Error('Una tarea no puede relacionarse consigo misma');
    }

    const tarea1 = this.buscarPorId(idTarea1);
    const tarea2 = this.buscarPorId(idTarea2);

    if (!tarea1 || !tarea2) {
      throw new Error('Una o ambas tareas no existen');
    }

    this.actualizarTarea(idTarea1, t => agregarRelacion(t, idTarea2));
    this.actualizarTarea(idTarea2, t => agregarRelacion(t, idTarea1));
  }

  /**
   * Elimina la relación entre dos tareas
   * @param idTarea1 - ID de la primera tarea
   * @param idTarea2 - ID de la segunda tarea
   */
  desrelacionarTareas(idTarea1: string, idTarea2: string): void {
    validarId(idTarea1);
    validarId(idTarea2);
    
    this.actualizarTarea(idTarea1, t => quitarRelacion(t, idTarea2));
    this.actualizarTarea(idTarea2, t => quitarRelacion(t, idTarea1));
  }

  // ============ ORDENAMIENTO ============

  /**
   * Ordena las tareas según un criterio específico
   * Paradigma: Funcional - Uso de funciones de orden superior
   * @param criterio - Criterio de ordenamiento
   * @returns Array ordenado de tareas (inmutable)
   */
  ordenar(criterio: 'titulo' | 'fechaCreacion' | 'fechaVencimiento' | 'dificultad'): readonly Tarea[] {
    const tareasActivas = this.obtenerActivas();
    
    const ordenadores = {
      titulo: (a: Tarea, b: Tarea) => a.titulo.localeCompare(b.titulo),
      fechaCreacion: (a: Tarea, b: Tarea) => b.fechaCreacion - a.fechaCreacion,
      fechaVencimiento: (a: Tarea, b: Tarea) => {
        if (!a.fechaVencimiento) return 1;
        if (!b.fechaVencimiento) return -1;
        return a.fechaVencimiento - b.fechaVencimiento;
      },
      dificultad: (a: Tarea, b: Tarea) => a.dificultad - b.dificultad
    };

    return Object.freeze([...tareasActivas].sort(ordenadores[criterio]));
  }

  // ============ CONSULTAS Y FILTROS ============

  /**
   * Obtiene todas las tareas activas (no eliminadas)
   * @returns Array de tareas activas (inmutable)
   */
  obtenerActivas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(t => !estaEliminada(t)));
  }

  /**
   * Obtiene todas las tareas eliminadas
   * @returns Array de tareas eliminadas (inmutable)
   */
  obtenerEliminadas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(estaEliminada));
  }

  /**
   * Obtiene tareas de alta prioridad (ALTA o URGENTE)
   * @returns Array de tareas de alta prioridad (inmutable)
   */
  obtenerAltaPrioridad(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && esAltaPrioridad(t))
    );
  }

  /**
   * Obtiene tareas que han vencido
   * @returns Array de tareas vencidas (inmutable)
   */
  obtenerVencidas(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && estaVencida(t))
    );
  }

  /**
   * Obtiene todas las tareas relacionadas a una tarea específica
   * @param id - ID de la tarea
   * @returns Array de tareas relacionadas (inmutable)
   * @throws {Error} Si la tarea no existe
   */
  obtenerRelacionadas(id: string): readonly Tarea[] {
    validarId(id);
    
    const tarea = this.buscarPorId(id);
    
    if (!tarea) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }

    return Object.freeze(
      this.items.filter(t => 
        !estaEliminada(t) && tarea.tareasRelacionadas.includes(t.id)
      )
    );
  }

  /**
   * Filtra tareas por estado específico
   * @param estado - Estado por el cual filtrar
   * @returns Array de tareas con ese estado (inmutable)
   */
  filtrarPorEstado(estado: EstadoTarea): readonly Tarea[] {
    validarEstado(estado);
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.estado === estado)
    );
  }

  /**
   * Filtra tareas por dificultad específica
   * @param dificultad - Dificultad por la cual filtrar
   * @returns Array de tareas con esa dificultad (inmutable)
   */
  filtrarPorDificultad(dificultad: DificultadTarea): readonly Tarea[] {
    validarDificultad(dificultad);
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.dificultad === dificultad)
    );
  }

  // ============ ESTADÍSTICAS ============

  /**
   * Obtiene estadísticas generales del sistema
   * Paradigma: Funcional - Uso de reduce para agregaciones
   * @returns Objeto con estadísticas completas (inmutable)
   * {
   *  total: number,
   *  eliminadas: number,
   *  altaPrioridad: number,
   *  vencidas: number,
   *  porEstado: Record<EstadoTarea, {cantidad:number, porcentaje:number}>,
   *  porDificultad: Record<DificultadTarea, {cantidad:number, porcentaje:number}>
   * }
   */
  obtenerEstadisticas() {
    const activas = this.obtenerActivas();
    const total = activas.length;

    // Estadísticas por estado usando reduce
    const porEstado = Object.values(EstadoTarea)
      .filter((v): v is EstadoTarea => typeof v === 'number')
      .reduce((acc, estado) => {
        const cantidad = activas.filter(t => t.estado === estado).length;
        acc[estado] = {
          cantidad,
          porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0
        };
        return acc;
      }, {} as Record<EstadoTarea, { cantidad: number; porcentaje: number }>);

    // Estadísticas por dificultad usando reduce
    const porDificultad = Object.values(DificultadTarea)
      .filter((v): v is DificultadTarea => typeof v === 'number')
      .reduce((acc, dificultad) => {
        const cantidad = activas.filter(t => t.dificultad === dificultad).length;
        acc[dificultad] = {
          cantidad,
          porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0
        };
        return acc;
      }, {} as Record<DificultadTarea, { cantidad: number; porcentaje: number }>);

    return Object.freeze({
      total,
      eliminadas: this.obtenerEliminadas().length,
      altaPrioridad: this.obtenerAltaPrioridad().length,
      vencidas: this.obtenerVencidas().length,
      porEstado: Object.freeze(porEstado),
      porDificultad: Object.freeze(porDificultad)
    });
  }

  /**
   * Reemplaza todas las tareas con un nuevo conjunto
   * Útil para cargar datos desde archivo
   * @param tareas - Nuevo conjunto de tareas
   */
  cargar(tareas: Tarea[]): void {
    this.items = [...tareas];
  }

  /**
   * Filtra tareas usando un predicado genérico.
   * Permite componer filtros complejos (predicados de `logica.ts`).
   * @param predicado - Función que recibe una tarea y devuelve boolean
   * @returns Array inmutable de tareas que cumplen el predicado
   */
  filtrarPorPredicado(predicado: Predicate<Tarea>): readonly Tarea[] {
    return Object.freeze(this.items.filter(t => !estaEliminada(t) && predicado(t)));
  }

  /**
   * Obtiene las tareas consideradas críticas por reglas de negocio.
   * @returns Array inmutable de tareas críticas
   */
  obtenerCriticas(): readonly Tarea[] {
    return this.filtrarPorPredicado(esCritica);
  }
}