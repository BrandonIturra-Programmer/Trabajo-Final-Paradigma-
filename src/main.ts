import { FileManager } from './fileManager';
import { GestorTareas } from './gestorTareas';
import { InterfazUsuario } from './interfazUsuario';
import { input, close } from '../lib/nodeImperativo';
import { Tarea } from './types';


 //Función principal

async function main(): Promise<void> {
  console.clear();
  console.log('\n🚀 Iniciando gestor de tareas...');

  // Inicializar gestor de archivos
  const fileManager = new FileManager('tareas.json');
  
  // Cargar tareas existentes
  const tareas: Tarea[] = fileManager.cargarTareas();
  console.log(`📋 ${tareas.length} tarea(s) cargada(s)\n`);

  // Inicializar gestor de tareas y UI
  const gestor = new GestorTareas(tareas);
  const ui = new InterfazUsuario(gestor, fileManager);

  let opcion = '';

  // Bucle principal del menú
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
      case '5':
        await ui.mostrarTareasCriticas();
        break;
      case '0':
        console.log('\n👋 Cerrando aplicación...');
        break;
      default:
        console.log('\n❌ Opción inválida');
        await input('\nPresione Enter para continuar...');
        break;
    }
  } while (opcion !== '0');

  // Guardar estado final antes de salir
  try {
    fileManager.guardarTareas(gestor.obtenerTodos() as ReadonlyArray<Tarea>);
    console.log('💾 Estado guardado correctamente');
  } catch (e) {
    console.error('❌ Error al guardar tareas al salir:', (e as Error).message);
  }

  close();
  console.log('\n✅ Hasta luego!\n');
}

// Ejecutar aplicación con manejo de errores global
main().catch(err => {
  console.error('\n🔥 Error en la aplicación:', err);
  try { 
    close(); 
  } catch {}
  process.exit(1);
});