
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


//Clase genérica para gestionar una colección de elementos
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


  buscarPorId(id: string): Tarea | undefined {
    return this.items.find(t => t.id === id && !t.eliminada);
  }


  private actualizarTarea(id: string, transformacion: (tarea: Tarea) => Tarea): Tarea {
    validarId(id);
    
    const indice = this.items.findIndex(t => t.id === id);
    
    if (indice === -1) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }

    this.items[indice] = transformacion(this.items[indice]);
    return this.items[indice];
  }


  modificarTitulo(id: string, nuevoTitulo: string): Tarea {
    validarStringNoVacio(nuevoTitulo, 'título');
    validarLongitudMinima(nuevoTitulo, 3, 'título');
    return this.actualizarTarea(id, t => actualizarTitulo(t, nuevoTitulo));
  }

  modificarDescripcion(id: string, nuevaDescripcion: string): Tarea {
    return this.actualizarTarea(id, t => actualizarDescripcion(t, nuevaDescripcion));
  }


  cambiarEstado(id: string, nuevoEstado: EstadoTarea): Tarea {
    validarEstado(nuevoEstado);
    return this.actualizarTarea(id, t => actualizarEstado(t, nuevoEstado));
  }

  cambiarDificultad(id: string, nuevaDificultad: DificultadTarea): Tarea {
    validarDificultad(nuevaDificultad);
    return this.actualizarTarea(id, t => actualizarDificultad(t, nuevaDificultad));
  }

  cambiarPrioridad(id: string, nuevaPrioridad: PrioridadTarea): Tarea {
    validarPrioridad(nuevaPrioridad);
    return this.actualizarTarea(id, t => actualizarPrioridad(t, nuevaPrioridad));
  }

  modificarFechaVencimiento(id: string, nuevaFecha: number | null): Tarea {
    validarFechaVencimiento(nuevaFecha);
    return this.actualizarTarea(id, t => actualizarFechaVencimiento(t, nuevaFecha));
  }

  eliminar(id: string): Tarea {
    return this.actualizarTarea(id, marcarEliminada);
  }

  eliminarPermanente(id: string): boolean {
    validarId(id);
    const indiceInicial = this.items.length;
    this.items = this.items.filter(t => t.id !== id);
    return this.items.length < indiceInicial;
  }


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


  desrelacionarTareas(idTarea1: string, idTarea2: string): void {
    validarId(idTarea1);
    validarId(idTarea2);
    
    this.actualizarTarea(idTarea1, t => quitarRelacion(t, idTarea2));
    this.actualizarTarea(idTarea2, t => quitarRelacion(t, idTarea1));
  }

  // ============ ORDENAMIENTO ============

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

  obtenerActivas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(t => !estaEliminada(t)));
  }

  obtenerEliminadas(): readonly Tarea[] {
    return Object.freeze(this.items.filter(estaEliminada));
  }

  obtenerAltaPrioridad(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && esAltaPrioridad(t))
    );
  }

  obtenerVencidas(): readonly Tarea[] {
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && estaVencida(t))
    );
  }

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


  filtrarPorEstado(estado: EstadoTarea): readonly Tarea[] {
    validarEstado(estado);
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.estado === estado)
    );
  }


  filtrarPorDificultad(dificultad: DificultadTarea): readonly Tarea[] {
    validarDificultad(dificultad);
    return Object.freeze(
      this.items.filter(t => !estaEliminada(t) && t.dificultad === dificultad)
    );
  }

  // ============ ESTADÍSTICAS ============

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

  cargar(tareas: Tarea[]): void {
    this.items = [...tareas];
  }

  filtrarPorPredicado(predicado: Predicate<Tarea>): readonly Tarea[] {
    return Object.freeze(this.items.filter(t => !estaEliminada(t) && predicado(t)));
  }

  obtenerCriticas(): readonly Tarea[] {
    return this.filtrarPorPredicado(esCritica);
  }
}