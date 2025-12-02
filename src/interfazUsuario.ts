import { input } from '../lib/nodeImperativo';
import { GestorTareas } from './gestorTareas';
import { FileManager } from './fileManager';
import {
  Tarea,
  EstadoTarea,
  DificultadTarea,
  PrioridadTarea,
  estadoATexto,
  dificultadATexto,
  prioridadATexto,
  formatearFecha
} from './types';


export class InterfazUsuario {

  constructor(
    private gestor: GestorTareas, 
    private fileManager: FileManager
  ) {}

  mostrarMenuPrincipal(): void {
    console.clear();
    console.log('║   SISTEMA DE GESTIÓN DE TAREAS         ║');
    console.log('\n📋 MENÚ PRINCIPAL\n');
    console.log('[1] 📝 Ver Tareas');
    console.log('[2] 🔍 Buscar Tareas');
    console.log('[3] ➕ Agregar Tarea');
    console.log('[4] 📊 Estadísticas');
    console.log('[5] ⚠️  Tareas críticas');
    console.log('[0] 🚪 Salir');
  }

  /**
   * Menú para ver tareas filtradas por estado
   */
  async verTareas(): Promise<void> {
    let opcion: string;

    do {
      console.clear();
      console.log('\n═══ VER TAREAS ═══\n');
      console.log('[1] 📋 Todas');
      console.log('[2] ⏳ Pendientes');
      console.log('[3] 🔄 En curso');
      console.log('[4] ✅ Terminadas');
      console.log('[5] ❌ Canceladas');
      console.log('[0] ⬅️  Volver');
      opcion = await input('\nOpción: ');

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

  /**
   * Muestra todas las tareas consideradas críticas por reglas del negocio
   */
  async mostrarTareasCriticas(): Promise<void> {
    const tareas = this.gestor.obtenerCriticas();

    if (tareas.length === 0) {
      console.log('\n❌ No se encontraron tareas críticas');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n═══ TAREAS CRÍTICAS ═══\n');
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

  /**
   * Muestra una lista de tareas filtradas por estado
   * @param estado - Estado por el cual filtrar (0 para todas)
   */
  async mostrarTareasPorEstado(estado: number | EstadoTarea): Promise<void> {
    const tareas: readonly Tarea[] =
      estado === 0 
        ? this.gestor.obtenerActivas() 
        : this.gestor.filtrarPorEstado(estado as EstadoTarea);

    if (tareas.length === 0) {
      console.log('\n❌ No se encontraron tareas');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n═══ LISTA DE TAREAS ═══\n');
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

  /**
   * Muestra los detalles completos de una tarea
   * @param id - ID de la tarea a mostrar
   */
  async mostrarDetallesTarea(id: string): Promise<void> {
    const tarea = this.gestor.buscarPorId(id);

    if (!tarea) {
      console.log('\n❌ Tarea no encontrada');
      await input('\nPresione Enter para continuar...');
      return;
    }
    console.log();
    console.log('║        DETALLES DE LA TAREA            ║');
    console.log(`\n🆔 ID:                ${tarea.id}`);
    console.log(`📌 Título:            ${tarea.titulo}`);
    console.log(`📄 Descripción:       ${tarea.descripcion || '(sin descripción)'}`);
    console.log(`📊 Estado:            ${estadoATexto(tarea.estado)}`);
    console.log(`⚡ Dificultad:        ${dificultadATexto(tarea.dificultad)}`);
    console.log(`🎯 Prioridad:         ${prioridadATexto(tarea.prioridad)}`);
    console.log(`📅 Fecha Creación:    ${formatearFecha(tarea.fechaCreacion)}`);
    console.log(`⏰ Fecha Vencimiento: ${formatearFecha(tarea.fechaVencimiento)}`);
    console.log('\n════════════════════════════════════════');

    console.log('\n[E] ✏️  Editar | [0] ⬅️  Volver');
    const opcion = await input('Opción: ');

    if (opcion.toLowerCase() === 'e') {
      console.clear();
      await this.editarTarea(id);
    }
  }

  /**
   * Permite editar los campos de una tarea existente
   * @param id - ID de la tarea a editar
   */
  async editarTarea(id: string): Promise<void> {
    let tarea = this.gestor.buscarPorId(id);

    if (!tarea) {
      console.log('\n❌ Tarea no encontrada');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log('\n═══ EDITAR TAREA ═══\n');

    // Editar título
    console.log(`📌 Título actual: ${tarea.titulo}`);
    const editarTitulo = await input('[1] Editar | [Enter] Saltar: ');
    if (editarTitulo === '1') {
      const nuevoTitulo = await input('Nuevo título: ');
      try {
        this.gestor.modificarTitulo(tarea.id, nuevoTitulo);
        tarea = this.gestor.buscarPorId(tarea.id)!;
        console.log('✅ Título actualizado');
      } catch (e) {
        console.log('❌ Error:', (e as Error).message);
      }
    }

    // Editar descripción
    console.log(`\n📄 Descripción actual: ${tarea.descripcion || '(vacía)'}`);
    const editarDesc = await input('[1] Editar | [Enter] Saltar: ');
    if (editarDesc === '1') {
      const nuevaDesc = await input('Nueva descripción: ');
      this.gestor.modificarDescripcion(tarea.id, nuevaDesc);
      tarea = this.gestor.buscarPorId(tarea.id)!;
      console.log('✅ Descripción actualizada');
    }

    // Editar estado
    console.log(`\n📊 Estado actual: ${estadoATexto(tarea.estado)}`);
    const editarEstado = await input('[1] Editar | [Enter] Saltar: ');
    if (editarEstado === '1') {
      console.log('[1] Pendiente | [2] En Curso | [3] Terminada | [4] Cancelada');
      const nuevoEstado = parseInt(await input('Opción: '));
      if (nuevoEstado >= 1 && nuevoEstado <= 4) {
        this.gestor.cambiarEstado(tarea.id, nuevoEstado as EstadoTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
        console.log('✅ Estado actualizado');
      }
    }

    // Editar dificultad
    console.log(`\n⚡ Dificultad actual: ${dificultadATexto(tarea.dificultad)}`);
    const editarDif = await input('[1] Editar | [Enter] Saltar: ');
    if (editarDif === '1') {
      console.log('[1] Difícil | [2] Media | [3] Fácil');
      const nuevaDif = parseInt(await input('Opción: '));
      if (nuevaDif >= 1 && nuevaDif <= 3) {
        this.gestor.cambiarDificultad(tarea.id, nuevaDif as DificultadTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
        console.log('✅ Dificultad actualizada');
      }
    }

    // Editar prioridad
    console.log(`\n🎯 Prioridad actual: ${prioridadATexto(tarea.prioridad)}`);
    const editarPri = await input('[1] Editar | [Enter] Saltar: ');
    if (editarPri === '1') {
      console.log('[1] Baja | [2] Media | [3] Alta | [4] Urgente');
      const nuevaPri = parseInt(await input('Opción: '));
      if (nuevaPri >= 1 && nuevaPri <= 4) {
        this.gestor.cambiarPrioridad(tarea.id, nuevaPri as PrioridadTarea);
        tarea = this.gestor.buscarPorId(tarea.id)!;
        console.log('✅ Prioridad actualizada');
      }
    }

    // Guardar cambios en archivo
    try {
      this.fileManager.guardarTareas(this.gestor.obtenerTodos() as ReadonlyArray<Tarea>);
      console.log('\n💾 Cambios guardados exitosamente');
    } catch (e) {
      console.log('\n❌ Error al guardar cambios');
    }

    await input('\nPresione Enter para continuar...');
  }

  /**
   * Busca tareas por título
   */
  async buscarTareas(): Promise<void> {
    console.log('\n═══ BUSCAR TAREAS ═══\n');
    const busqueda = await input('🔍 Ingrese el título a buscar: ');

    const tareas = this.gestor.obtenerActivas().filter((t: Tarea) =>
      t.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (tareas.length === 0) {
      console.log('\n❌ No se encontraron tareas');
      await input('\nPresione Enter para continuar...');
      return;
    }

    console.log(`\n═══ RESULTADOS (${tareas.length}) ═══\n`);
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

  /**
   * Crea una nueva tarea de forma interactiva
   */
  async agregarTarea(): Promise<void> {
    console.log('\n═══ AGREGAR NUEVA TAREA ═══\n');

    const titulo = await input('📌 Título: ');
    const descripcion = await input('📄 Descripción: ');

    console.log('\n📊 Estado:');
    console.log('[1] Pendiente | [2] En Curso | [3] Terminada | [4] Cancelada');
    const estado = parseInt(await input('Opción: ')) as EstadoTarea;

    console.log('\n⚡ Dificultad:');
    console.log('[1] Difícil | [2] Media | [3] Fácil');
    const dificultad = parseInt(await input('Opción: ')) as DificultadTarea;

    console.log('\n🎯 Prioridad:');
    console.log('[1] Baja | [2] Media | [3] Alta | [4] Urgente');
    const prioridad = parseInt(await input('Opción: ')) as PrioridadTarea;

    try {
      const nuevaTarea = this.gestor.agregar(
        titulo, 
        descripcion, 
        estado, 
        dificultad, 
        prioridad, 
        null
      );
      this.fileManager.guardarTareas(this.gestor.obtenerTodos() as ReadonlyArray<Tarea>);
      console.log('\n✅ Tarea agregada exitosamente');
      console.log(`🆔 ID generado: ${nuevaTarea.id}`);
    } catch (e) {
      console.log('\n❌ Error al crear la tarea:', (e as Error).message);
    }

    await input('\nPresione Enter para continuar...');
  }

  /**
   * Muestra estadísticas del sistema
   */
  async mostrarEstadisticas(): Promise<void> {
    console.clear();
    console.log('║     ESTADÍSTICAS DEL SISTEMA           ║');

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

    console.log('\n───── Por Estado ─────');
    console.log(`⏳ Pendientes:   ${pendientes.toString().padEnd(3)} (${porcentaje(pendientes).toFixed(1)}%)`);
    console.log(`🔄 En Curso:     ${enCurso.toString().padEnd(3)} (${porcentaje(enCurso).toFixed(1)}%)`);
    console.log(`✅ Terminadas:   ${terminadas.toString().padEnd(3)} (${porcentaje(terminadas).toFixed(1)}%)`);
    console.log(`❌ Canceladas:   ${canceladas.toString().padEnd(3)} (${porcentaje(canceladas).toFixed(1)}%)`);

    console.log('\n───── Por Dificultad ─────');
    const dificiles = porDificultad[1]?.cantidad ?? 0;
    const medias = porDificultad[2]?.cantidad ?? 0;
    const faciles = porDificultad[3]?.cantidad ?? 0;
    console.log(`🔴 Difíciles:    ${dificiles.toString().padEnd(3)} (${porcentaje(dificiles).toFixed(1)}%)`);
    console.log(`🟡 Medias:       ${medias.toString().padEnd(3)} (${porcentaje(medias).toFixed(1)}%)`);
    console.log(`🟢 Fáciles:      ${faciles.toString().padEnd(3)} (${porcentaje(faciles).toFixed(1)}%)`);

    console.log('\n───── Información Adicional ─────');
    console.log(`⚠️  Alta prioridad:  ${stats.altaPrioridad}`);
    console.log(`⏰ Vencidas:         ${stats.vencidas}`);

    await input('\nPresione Enter para continuar...');
  }
}