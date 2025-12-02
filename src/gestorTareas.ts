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

/**
 * Clase genérica para gestionar una colección de elementos
 */
class GestorGenerico<T> {
  protected items: T[];

  constructor(itemsIniciales: T[] = []) {
    this.items = [...itemsIniciales];
  }

  obtenerTodos(): readonly T[] {
    return Object.freeze([...this.items]);
  }

  obtenerCantidad(): number {
    return this.items.length;
  }

  limpiar(): void {
    this.items = [];
  }
}

/**
 * Gestor principal de tareas
 * Encapsula toda la lógica de negocio relacionada con las tareas
 */
export class GestorTareas extends GestorGenerico<Tarea> {
  constructor(tareasIniciales: Tarea[] = []) {
    super(tareasIniciales);
  }

  // ============ OPERACIONES CRUD ============

  /**
   * Agrega una nueva tarea
   */
  agregar(
    titulo: string,
    descripcion: string = "",
    estado: EstadoTarea = EstadoTarea.PENDIENTE,
    dificultad: DificultadTarea = DificultadTarea.FACIL,
    prioridad: PrioridadTarea = PrioridadTarea.MEDIA,
    fechaVencimiento: number | null = null
  ): Tarea {
    // Validación de entrada
    if (!titulo || titulo.trim().length === 0) {
      throw new Error('El título de la tarea no puede estar vacío');
    }

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
   */
  buscarPorId(id: string): Tarea | undefined {
    return this.items.find(t => t.id === id && !t.eliminada);
  }

  /**
   * Actualiza una tarea aplicando una función de transformación
   */
  private actualizarTarea(id: string, transformacion: (tarea: Tarea) => Tarea): Tarea {
    const indice = this.items.findIndex(t => t.id === id);
    
    if (indice === -1) {
      throw new Error(`No se encontró la tarea con id: ${id}`);
    }

    this.items[indice] = transformacion(this.items[indice]);
    return this.items[indice];
  }

  /**
   * Modifica el título de una tarea
   */
  modificarTitulo(id: string, nuevoTitulo: string): Tarea {
    if (!nuevoTitulo || nuevoTitulo.trim().length === 0) {
      throw new Error('El título no puede estar vacío');
    }
    return this.actualizarTarea(id, t => actualizarTitulo(t, nuevoTitulo));
  }

  /**
   * Modifica la descripción de una tarea
   */
  modificarDescripcion(id: string, nuevaDescripcion: string): Tarea {
    return this.actualizarTarea(id, t => actualizarDescripcion(t, nuevaDescripcion));
  }

  /**
   * Cambia el estado de una tarea
   */
  cambiarEstado(id: string, nuevoEstado: EstadoTarea): Tarea {
    return this.actualizarTarea(id, t => actualizarEstado(t, nuevoEstado));
  }

  /**
   * Cambia la dificultad de una tarea
   */
  cambiarDificultad(id: string, nuevaDificultad: DificultadTarea): Tarea {
    return this.actualizarTarea(id, t => actualizarDificultad(t, nuevaDificultad));
  }

  /**
   * Cambia la prioridad de una tarea
   */
  cambiarPrioridad(id: string, nuevaPrioridad: PrioridadTarea): Tarea {
    return this.actualizarTarea(id, t => actualizarPrioridad(t, nuevaPrioridad));
  }

  /**
   * Modifica la fecha de vencimiento
   */
  modificarFechaVencimiento(id: string, nuevaFecha: number | null): Tarea {
    return this.actualizarTarea(id, t => actualizarFechaVencimiento(t, nuevaFecha));
  }

  /**
   * Elimina una tarea (soft delete)
   */
  eliminar(id: string): Tarea {
    return this.actualizarTarea(id, marcarEliminada);
  }

  /**
   * Elimina permanentemente una tarea (hard delete)
   */
  eliminarPermanente(id: string): boolean {
    const indiceInicial = this.items.length;
    this.items = this.items.filter(t => t.id !== id);
    return this.items.length < indiceInicial;
  }

  /**
   * Restaura una tarea eliminada
   */
  restaurar(id: string): Tarea {
    const indice = this.items.findIndex(t => t.id === id);
    
    if (indice === -1) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }

    this.items[indice] = restaurarTarea(this.items[indice]);
    return this.items[indice];
  }

  // ============ RELACIONES ENTRE TAREAS ============

  /**
   * Relaciona dos tareas
   */
  relacionarTareas(idTarea1: string, idTarea2: string): void {
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
   */
  desrelacionarTareas(idTarea1: string, idTarea2: string): void {
    this.actualizarTarea(idTarea1, t => quitarRelacion(t, idTarea2));
    this.actualizarTarea(idTarea2, t => quitarRelacion(t, idTarea1));
  }

  // ============ ORDENAMIENTO ============

  /**
   * Ordena las tareas según un criterio
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
   */
  obtenerActivas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(t => !estaEliminada(t)));
  }

  /**
   * Obtiene todas las tareas eliminadas
   */
  obtenerEliminadas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(estaEliminada));
  }

  /**
   * Obtiene tareas de alta prioridad
   */
  obtenerAltaPrioridad(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && esAltaPrioridad(t))
    );
  }

  /**
   * Obtiene tareas vencidas
   */
  obtenerVencidas(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && estaVencida(t))
    );
  }

  /**
   * Obtiene tareas relacionadas a una tarea específica
   */
  obtenerRelacionadas(id: string): readonly Tarea[] {
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
   * Filtra tareas por estado
   */
  filtrarPorEstado(estado: EstadoTarea): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.estado === estado)
    );
  }

  /**
   * Filtra tareas por dificultad
   */
  filtrarPorDificultad(dificultad: DificultadTarea): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.dificultad === dificultad)
    );
  }

  // ============ ESTADÍSTICAS ============

  /**
   * Obtiene estadísticas generales
   */
  obtenerEstadisticas() {
    const activas = this.obtenerActivas();
    const total = activas.length;

    // Estadísticas por estado
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

    // Estadísticas por dificultad
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
   */
  cargar(tareas: Tarea[]): void {
    this.items = [...tareas];
  }
}