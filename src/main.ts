import { FileManager } from './fileManager.js';
import { GestorTareas } from './gestorTareas.js';
import { InterfazUsuario } from './interfazUsuario.js';
import { input, close } from '../lib/nodeImperativo.js';
import { Tarea } from './types.js';

async function main(): Promise<void> {
  console.clear();
  console.log('\nIniciando gestor de tareas...');

  const fileManager = new FileManager('tareas.json');
  const tareas: Tarea[] = Array.from(fileManager.cargarTareas() as ReadonlyArray<Tarea>);

  const gestor = new GestorTareas(tareas);
  const ui = new InterfazUsuario(gestor, fileManager);

  let opcion = '';

  do {
    ui.mostrarMenuPrincipal();
    opcion = (await input('\nOpción: ')).trim();

    switch (opcion) {
      case '1':
        await ui.verTareas();
        break;
      case '2':
        await ui.buscarTareas();
        break;
      case '3':
        await ui.agregarTarea();
        break;
      case '4':
        await ui.mostrarEstadisticas();
        break;
      case '0':
        // salir
        break;
      default:
        console.log('\nOpción inválida');
        await input('\nPresione Enter para continuar...');
        break;
    }
  } while (opcion !== '0');

  // Guardar estado final y cerrar
  try {
    fileManager.guardarTareas(gestor.obtenerTodos() as ReadonlyArray<Tarea>);
  } catch (e) {
    console.error('Error al guardar tareas al salir:', (e as Error).message);
  }

  close();
  console.log('\nHasta luego!');
}

main().catch(err => {
  console.error('Error en la aplicación:', err);
  try { close(); } catch {}
  process.exit(1);
});