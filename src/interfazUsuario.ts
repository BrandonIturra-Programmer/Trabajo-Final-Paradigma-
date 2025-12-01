import { input } from '../lib/nodeImperativo.js';
import { GestorTareas } from './gestorTareas.js';
import { FileManager } from './fileManager.js';
import {
  Tarea,
  EstadoTarea,
  DificultadTarea,
  PrioridadTarea,
  estadoATexto,
  dificultadATexto,
  prioridadATexto,
  formatearFecha
} from './types.js';

export class InterfazUsuario {
  constructor(private gestor: GestorTareas, private fileManager: FileManager) {}

  mostrarMenuPrincipal(): void {
    console.clear();
    console.log('\n=== SISTEMA DE GESTIÓN DE TAREAS ===');
    console.log('----------- MENU -----------');
    console.log('[1] Ver Tareas');
    console.log('[2] Buscar Tareas');
    console.log('[3] Agregar Tarea');
    console.log('[4] Estadísticas');
    console.log('[0] Salir');
  }

  async verTareas(): Promise<void> {
    let opcion: string;

    do {
      console.clear();
      console.log('\n=== VER TAREAS ===\n');
      console.log('[1] Todas');
      console.log('[2] Pendientes');
      console.log('[3] En curso');
      console.log('[4] Terminadas');
      console.log('[5] Canceladas');
      console.log('[0] Volver');
      opcion = await input('Opción: ');

      console.clear();

      switch (opcion) {
        case '1':
          await this.mostrarTareasPorEstado(0);
          break;
        case '2':
          await this.mostrarTareasPorEstado(EstadoTarea.PENDIENTE);
          break;
        case '3':
          await this.mostrarTareasPorEstado(EstadoTarea.EN_CURSO);
          break;
        case '4':
          await this.mostrarTareasPorEstado(EstadoTarea.TERMINADA);
          break;
        case '5':
          await this.mostrarTareasPorEstado(EstadoTarea.CANCELADA);
          break;
        case '0':
          return;
        default:
          console.log('\n❌ Opción incorrecta');
          await input('\nPresione Enter para continuar...');
          break;
      }
    } while (opcion !== '0');
  }

  async mostrarTareasPorEstado(estado: number | EstadoTarea): Promise<void> {
    const tareas: readonly Tarea[] =
      estado === 0 ? this.gestor.obtenerActivas() : this.gestor.filtrarPorEstado(estado as EstadoTarea);

    if (tareas.length === 0) {
      console.log('\n❌ No se encontraron tareas');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n=== LISTA DE TAREAS ===\n');
    tareas.forEach((tarea: Tarea, index: number) => {
      console.log(`[${index + 1}] ${tarea.titulo} - ${estadoATexto(tarea.estado)}`);
    });

    console.log('\n[Número] Ver detalles | [0] Volver');
    const seleccion = parseInt(await input('Opción: '));

    if (seleccion > 0 && seleccion <= tareas.length) {
      const tareaSeleccionada = tareas[seleccion - 1];
      await this.mostrarDetallesTarea(tareaSeleccionada.id);
    }
  }

  async mostrarDetallesTarea(id: string): Promise<void> {
    const tarea = this.gestor.buscarPorId(id);

    if (!tarea) {
      console.log('\n❌ Tarea no encontrada');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n=== DETALLES DE LA TAREA ===');
    console.log(`ID:                ${tarea.id}`);
    console.log(`Título:            ${tarea.titulo}`);
    console.log(`Descripción:       ${tarea.descripcion}`);
    console.log(`Estado:            ${estadoATexto(tarea.estado)}`);
    console.log(`Dificultad:        ${dificultadATexto(tarea.dificultad)}`);
    console.log(`Prioridad:         ${prioridadATexto(tarea.prioridad)}`);
    console.log(`Fecha Creación:    ${formatearFecha(tarea.fechaCreacion)}`);
    console.log(`Fecha Vencimiento: ${formatearFecha(tarea.fechaVencimiento)}`);
    console.log('================================');

    console.log('\n[E] Editar | [0] Volver');
    const opcion = await input('Opción: ');

    if (opcion.toLowerCase() === 'e') {
      console.clear();
      await this.editarTarea(id);
    }
  }

  async editarTarea(id: string): Promise<void> {
    let tarea = this.gestor.buscarPorId(id);

    if (!tarea) return;

    console.log('\n=== EDITAR TAREA ===\n');

    // Editar título
    console.log(`Título actual: ${tarea.titulo}`);
    const editarTitulo = await input('[1] Editar | [Enter] Saltar: ');
    if (editarTitulo === '1') {
      const nuevoTitulo = await input('Nuevo título: ');
      this.gestor.modificarTitulo(tarea.id, nuevoTitulo);
      tarea = this.gestor.buscarPorId(tarea.id)!;
    }

    // Editar descripción
    console.log(`\nDescripción actual: ${tarea.descripcion}`);
    const editarDesc = await input('[1] Editar | [Enter] Saltar: ');
    if (editarDesc === '1') {
      const nuevaDesc = await input('Nueva descripción: ');
      this.gestor.modificarDescripcion(tarea.id, nuevaDesc);
      tarea = this.gestor.buscarPorId(tarea.id)!;
    }

    // Editar estado
    console.log(`\nEstado actual: ${estadoATexto(tarea.estado)}`);
    const editarEstado = await input('[1] Editar | [Enter] Saltar: ');
    if (editarEstado === '1') {
      console.log('[1] Pendiente | [2] En Curso | [3] Terminada | [4] Cancelada');
      const nuevoEstado = parseInt(await input('Opción: '));
      if (nuevoEstado >= 1 && nuevoEstado <= 4) {
        this.gestor.cambiarEstado(tarea.id, nuevoEstado as EstadoTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
      }
    }

    // Editar dificultad
    console.log(`\nDificultad actual: ${dificultadATexto(tarea.dificultad)}`);
    const editarDif = await input('[1] Editar | [Enter] Saltar: ');
    if (editarDif === '1') {
      console.log('[1] Difícil | [2] Media | [3] Fácil');
      const nuevaDif = parseInt(await input('Opción: '));
      if (nuevaDif >= 1 && nuevaDif <= 3) {
        this.gestor.cambiarDificultad(tarea.id, nuevaDif as DificultadTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
      }
    }

    // Editar prioridad
    console.log(`\nPrioridad actual: ${prioridadATexto(tarea.prioridad)}`);
    const editarPri = await input('[1] Editar | [Enter] Saltar: ');
    if (editarPri === '1') {
      console.log('[1] Baja | [2] Media | [3] Alta | [4] Urgente');
      const nuevaPri = parseInt(await input('Opción: '));
      if (nuevaPri >= 1 && nuevaPri <= 4) {
        this.gestor.cambiarPrioridad(tarea.id, nuevaPri as PrioridadTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
      }
    }

    // Guardar cambios en archivo
    try {
      this.fileManager.guardarTareas(this.gestor.obtenerTodos() as ReadonlyArray<Tarea>);
      console.log('\n✅ Tarea actualizada exitosamente');
    } catch (e) {
      console.log('\n❌ Error al guardar cambios');
    }

    await input('\nPresione Enter para continuar...');
  }

  async buscarTareas(): Promise<void> {
    console.log('\n=== BUSCAR TAREAS ===\n');
    const busqueda = await input('Ingrese el título a buscar: ');

    const tareas = this.gestor.obtenerActivas().filter((t: Tarea) =>
      t.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (tareas.length === 0) {
      console.log('\n❌ No se encontraron tareas');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n=== RESULTADOS ===\n');
    tareas.forEach((tarea: Tarea, index: number) => {
      console.log(`[${index + 1}] ${tarea.titulo}`);
    });

    console.log('\n[Número] Ver detalles | [0] Volver');
    const seleccion = parseInt(await input('Opción: '));

    if (seleccion > 0 && seleccion <= tareas.length) {
      const tareaSeleccionada = tareas[seleccion - 1];
      await this.mostrarDetallesTarea(tareaSeleccionada.id);
    }
  }

  async agregarTarea(): Promise<void> {
    console.log('\n=== AGREGAR TAREA ===\n');

    const titulo = await input('Título: ');
    const descripcion = await input('Descripción: ');

    console.log('\nEstado: [1] Pendiente | [2] En Curso | [3] Terminada | [4] Cancelada');
    const estado = parseInt(await input('Opción: ')) as EstadoTarea;

    console.log('\nDificultad: [1] Difícil | [2] Media | [3] Fácil');
    const dificultad = parseInt(await input('Opción: ')) as DificultadTarea;

    console.log('\nPrioridad: [1] Baja | [2] Media | [3] Alta | [4] Urgente');
    const prioridad = parseInt(await input('Opción: ')) as PrioridadTarea;

    try {
      const nuevaTarea = this.gestor.agregar(titulo, descripcion, estado, dificultad, prioridad, null);
      this.fileManager.guardarTareas(this.gestor.obtenerTodos() as ReadonlyArray<Tarea>);
      console.log('\n✅ Tarea agregada exitosamente');
      console.log(`ID generado: ${nuevaTarea.id}`);
    } catch (e) {
      console.log('\n❌ Error al crear la tarea:', (e as Error).message);
    }

    await input('\nPresione Enter para continuar...');
  }

  async mostrarEstadisticas(): Promise<void> {
    console.clear();
    console.log('\n=== ESTADÍSTICAS DEL SISTEMA ===\n');

    type EstadoStats = Readonly<Record<EstadoTarea, { cantidad: number; porcentaje: number }>>;
    type DificultadStats = Readonly<Record<DificultadTarea, { cantidad: number; porcentaje: number }>>;
    type Stats = {
      total: number;
      eliminadas: number;
      altaPrioridad: number;
      vencidas: number;
      porEstado: EstadoStats;
      porDificultad: DificultadStats;
    };

    const stats = this.gestor.obtenerEstadisticas() as Stats;

    const total = stats.total ?? 0;
    const porEstado: EstadoStats = stats.porEstado ?? ({} as EstadoStats);
    const porDificultad: DificultadStats = stats.porDificultad ?? ({} as DificultadStats);

    const pendientes = porEstado[EstadoTarea.PENDIENTE]?.cantidad ?? 0;
    const enCurso = porEstado[EstadoTarea.EN_CURSO]?.cantidad ?? 0;
    const terminadas = porEstado[EstadoTarea.TERMINADA]?.cantidad ?? 0;
    const canceladas = porEstado[EstadoTarea.CANCELADA]?.cantidad ?? 0;

    const porcentaje = (n: number) => (total > 0 ? ((n / total) * 100) : 0);

    console.log(`📊 Total de tareas:        ${total}`);
    console.log(`🗑️  Tareas eliminadas:     ${stats.eliminadas}`);

    console.log('\n--- Por Estado ---');
    console.log(`⏳ Pendientes:   ${pendientes} (${porcentaje(pendientes).toFixed(1)}%)`);
    console.log(`🔄 En Curso:     ${enCurso} (${porcentaje(enCurso).toFixed(1)}%)`);
    console.log(`✅ Terminadas:   ${terminadas} (${porcentaje(terminadas).toFixed(1)}%)`);
    console.log(`❌ Canceladas:   ${canceladas} (${porcentaje(canceladas).toFixed(1)}%)`);

    console.log('\n--- Por Dificultad ---');
    const dificiles = porDificultad[1]?.cantidad ?? 0;
    const medias = porDificultad[2]?.cantidad ?? 0;
    const faciles = porDificultad[3]?.cantidad ?? 0;
    console.log(`🔴 Difíciles:    ${dificiles} (${porcentaje(dificiles).toFixed(1)}%)`);
    console.log(`🟡 Medias:       ${medias} (${porcentaje(medias).toFixed(1)}%)`);
    console.log(`🟢 Fáciles:      ${faciles} (${porcentaje(faciles).toFixed(1)}%)`);

    console.log('\n--- Información Adicional ---');
    console.log(`⚠️  Alta prioridad:  ${stats.altaPrioridad}`);
    console.log(`⏰ Vencidas:         ${stats.vencidas}`);

    await input('\nPresione Enter para continuar...');
  }
}