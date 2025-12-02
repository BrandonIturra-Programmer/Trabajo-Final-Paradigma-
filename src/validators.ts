
//Funciones puras para validar datos de entrada
import { EstadoTarea, DificultadTarea, PrioridadTarea } from './types';


//Valida que un string no esté vacío
export const validarStringNoVacio = (valor: string, nombreCampo: string): void => {
  if (!valor || valor.trim().length === 0) {
    throw new Error(`El ${nombreCampo} no puede estar vacío`);
  }
};


//Valida que un string tenga una longitud mínima
export const validarLongitudMinima = (
  valor: string, 
  longitudMinima: number, 
  nombreCampo: string
): void => {
  if (valor.trim().length < longitudMinima) {
    throw new Error(
      `El ${nombreCampo} debe tener al menos ${longitudMinima} caracteres`
    );
  }
};


//Valida que un valor sea parte de un enum
export const validarEnum = <T extends object>(
  valor: number,
  enumObj: T,
  nombreEnum: string
): void => {
  // Object.values(enumObj) puede contener tanto claves como valores debido al reverse-mapping de enums numéricos.
  // Filtramos y usamos un type predicate para que TypeScript entienda que son números.
  const valoresValidos = Object.values(enumObj).filter((v): v is number => typeof v === 'number');
  
  if (!valoresValidos.includes(valor)) {
    throw new Error(
      `${nombreEnum} inválido: ${valor}. Valores válidos: ${valoresValidos.join(', ')}`
    );
  }
};


//Valida un estado de tarea
export const validarEstado = (estado: EstadoTarea): void => {
  validarEnum(estado, EstadoTarea, 'Estado');
};


//Valida una dificultad de tarea
export const validarDificultad = (dificultad: DificultadTarea): void => {
  validarEnum(dificultad, DificultadTarea, 'Dificultad');
};


//Valida una prioridad de tarea
export const validarPrioridad = (prioridad: PrioridadTarea): void => {
  validarEnum(prioridad, PrioridadTarea, 'Prioridad');
};


//Valida que una fecha de vencimiento
export const validarFechaVencimiento = (fecha: number | null): void => {
  if (fecha !== null && fecha < Date.now()) {
    throw new Error('La fecha de vencimiento no puede estar en el pasado');
  }
};


//Valida un ID con formato UUID v4
export const validarId = (id: string): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    throw new Error(`ID inválido: ${id}`);
  }
};


// Valida que un número esté dentro de un rango
export const validarRango = (
  valor: number,
  min: number,
  max: number,
  nombreCampo: string
): void => {
  if (valor < min || valor > max) {
    throw new Error(
      `${nombreCampo} debe estar entre ${min} y ${max}, recibido: ${valor}`
    );
  }
};


// Valida que un array no esté vacío
export const validarArrayNoVacio = <T>(array: T[], nombreCampo: string): void => {
  if (!array || array.length === 0) {
    throw new Error(`${nombreCampo} no puede estar vacío`);
  }
};