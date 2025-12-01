import * as fs from 'fs';
import { Tarea } from './types';

const ARCHIVO_TAREAS = 'tareas.json';

/**
 * Guarda las tareas en el archivo JSON
 * @param tareas - Array de tareas a persistir
 * @returns Promise que resuelve cuando se completa la escritura
 */
export const guardarTareas = async (tareas: readonly Tarea[]): Promise<void> => {
  try {
    const datos = JSON.stringify(tareas, null, 2);
    await fs.promises.writeFile(ARCHIVO_TAREAS, datos, 'utf-8');
    console.log('✓ Tareas guardadas exitosamente');
  } catch (error) {
    console.error('✗ Error al guardar tareas:', error);
    throw new Error('No se pudieron guardar las tareas');
  }
};

/**
 * Carga las tareas desde el archivo JSON
 * @returns Promise que resuelve con el array de tareas o array vacío si no existe el archivo
 */
export const cargarTareas = async (): Promise<Tarea[]> => {
  try {
    // Verificar si el archivo existe
    await fs.promises.access(ARCHIVO_TAREAS);
    
    const datos = await fs.promises.readFile(ARCHIVO_TAREAS, 'utf-8');
    const tareas = JSON.parse(datos) as Tarea[];
    
    console.log(✓ Se cargaron ${tareas.length} tareas desde el archivo);
    return tareas;
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('⚠ No se encontró archivo de tareas, iniciando con lista vacía');
      return [];
    }
    
    console.error('✗ Error al cargar tareas:', error);
    throw new Error('No se pudieron cargar las tareas');
  }
};

/**
 * Verifica si existe el archivo de tareas
 * @returns Promise que resuelve con true si existe, false si no
 */
export const existeArchivoTareas = async (): Promise<boolean> => {
  try {
    await fs.promises.access(ARCHIVO_TAREAS);
    return true;
  } catch {
    return false;
  }
};

/**
 * Crea un backup del archivo de tareas
 * @returns Promise que resuelve cuando se completa el backup
 */
export const crearBackup = async (): Promise<void> => {
  try {
    const existe = await existeArchivoTareas();
    if (!existe) {
      console.log('⚠ No hay archivo para respaldar');
      return;
    }

    const fecha = new Date().toISOString().replace(/[:.]/g, '-');
    const archivoBackup = tareas_backup_${fecha}.json;
    
    await fs.promises.copyFile(ARCHIVO_TAREAS, archivoBackup);
    console.log(✓ Backup creado: ${archivoBackup});
  } catch (error) {
    console.error('✗ Error al crear backup:', error);
    throw new Error('No se pudo crear el backup');
  }
};