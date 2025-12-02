# 🚀 Sistema de Gestión de Tareas

Sistema de gestión de tareas desarrollado con TypeScript que integra múltiples paradigmas de programación para demostrar conceptos avanzados de desarrollo de software.

## 📖 Descripción

Este proyecto es el trabajo final de la asignatura **Paradigmas de Programación** de la Universidad Nacional de Villa Mercedes (UNVIME). 

El sistema permite gestionar tareas de forma completa, aplicando principios de **Programación Estructurada**, **Programación Orientada a Objetos**, **Programación Funcional** y **Programación Lógica**.

## ✨ Características

### Funcionalidades Principales

✅ **CRUD Completo**
- Crear, leer, actualizar y eliminar tareas
- Búsqueda de tareas por título
- Filtrado por estado, dificultad y prioridad

✅ **Gestión Avanzada**
- IDs únicos con UUID v4
- Eliminación lógica (soft delete)
- Restauración de tareas eliminadas
- Relaciones entre tareas

✅ **Persistencia**
- Almacenamiento en archivo JSON
- Carga automática al iniciar
- Guardado automático de cambios
- Sistema de backups

✅ **Ordenamiento**
- Por título (alfabético)
- Por fecha de creación
- Por fecha de vencimiento
- Por dificultad

✅ **Estadísticas y Reportes**
- Total de tareas activas y eliminadas
- Distribución por estado (pendiente, en curso, terminada, cancelada)
- Distribución por dificultad (fácil, medio, difícil)
- Cantidad de tareas de alta prioridad
- Cantidad de tareas vencidas

✅ **Consultas Especializadas**
- Listado de tareas de alta prioridad
- Listado de tareas vencidas
- Listado de tareas relacionadas a otra tarea
- Sistema de detección de tareas críticas

## 🔧 Requisitos Previos
- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js) -- Para ejecutar utiliza (npm run dev) 
- **TypeScript** (se instala automáticamente con npm install)
