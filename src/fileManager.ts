import * as fs from 'fs';
import { Tarea } from './types';

/**
 * Clase responsable de persistencia simple de tareas en disco (JSON).
 * Encapsula lectura, escritura y backups de archivo.
 */
export class FileManager {

  constructor(private readonly archivoTareas: string) {}

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

  existeArchivoTareas(): boolean {
    return fs.existsSync(this.archivoTareas);
  }

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