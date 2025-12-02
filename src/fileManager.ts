import * as fs from 'fs';
import { Tarea } from './types';

/**
 * Clase responsable de persistencia simple de tareas en disco (JSON).
 * Encapsula lectura, escritura y backups de archivo.
 */
export class FileManager {
  /**
   * @param archivoTareas - Ruta al archivo JSON que contiene las tareas
   */
  constructor(private readonly archivoTareas: string) {}

  /**
   * Guarda las tareas en el archivo JSON
   * @param tareas - Array inmutable (readonly) de tareas a persistir
   * @throws {Error} Si ocurre un error de IO
   */
  guardarTareas(tareas: readonly Tarea[]): void {
    try {
      const datos = JSON.stringify(tareas, null, 2);
      fs.writeFileSync(this.archivoTareas, datos, 'utf-8');
      console.log('✓ Tareas guardadas exitosamente');
    } catch (error) {
      console.error('✗ Error al guardar tareas:', error);
      throw new Error('No se pudieron guardar las tareas');
    }
  }


  /**
   * Carga tareas desde disco. Si el archivo no existe, devuelve []
   * @returns {Tarea[]} Array mutable con las tareas cargadas
   */
  cargarTareas(): Tarea[] {
    try {
      // Verificar si el archivo existe
      if (!fs.existsSync(this.archivoTareas)) {
        console.log('⚠ No se encontró archivo de tareas, iniciando con lista vacía');
        return [];
      }
      
      const datos = fs.readFileSync(this.archivoTareas, 'utf-8');
      const tareas = JSON.parse(datos) as Tarea[];
      
      console.log(`✓ Se cargaron ${tareas.length} tareas desde el archivo`);
      return tareas;
    } catch (error) {
      console.error('✗ Error al cargar tareas:', error);
      return [];
    }
  }

  /**
   * Indica si el archivo de tareas existe en disco
   * @returns {boolean}
   */
  existeArchivoTareas(): boolean {
    return fs.existsSync(this.archivoTareas);
  }

  /**
   * Crea una copia de respaldo con timestamp (en el mismo directorio)
   * @throws {Error} Si ocurre un error de IO
   */
  crearBackup(): void {
    try {
      if (!this.existeArchivoTareas()) {
        console.log('⚠ No hay archivo para respaldar');
        return;
      }

      const fecha = new Date().toISOString().replace(/[:.]/g, '-');
      const archivoBackup = `tareas_backup_${fecha}.json`;
      
      fs.copyFileSync(this.archivoTareas, archivoBackup);
      console.log(`✓ Backup creado: ${archivoBackup}`);
    } catch (error) {
      console.error('✗ Error al crear backup:', error);
      throw new Error('No se pudo crear el backup');
    }
  }
}