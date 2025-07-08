# 📋 Changelog - ERP Saldivia

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-01-08

### ✨ Agregado
- **Exportación completa de usuarios** en formatos CSV y Excel (.xlsx)
- **Archivos Excel reales** usando la biblioteca `xlsx` en lugar de JSON
- **Botón flotante de exportación** con menú contextual en la página de usuarios
- **Componente UserActionsMenu** para gestión avanzada de acciones de usuario
- **Sistema de avatares mejorado** con timestamps y cache-busting
- **Logs detallados** para debugging de exportación y operaciones de usuario
- **Inclusión del usuario demo Adrian** en todas las exportaciones
- **Notificaciones claras** de éxito/error en operaciones de exportación

### 🔧 Corregido
- **Orden correcto de rutas** en backend (export antes de :id) - Resuelve error 404
- **URLs de imágenes de perfil** con timestamps correctos para evitar cache
- **Duplicación de rutas** de exportación en el archivo de rutas de usuarios
- **Manejo de permisos** de exportación mejorado
- **Consistencia en datos demo** entre funciones normales y de exportación

### 🎨 Mejorado
- **Componente UserAvatar** con mejor manejo de estados de carga
- **Gestión de contexto de autenticación** más robusta
- **Interfaz de usuario** más intuitiva para acciones de exportación
- **Performance** de operaciones de exportación con logs optimizados

### 📁 Archivos Modificados
#### Frontend
- `client/src/app/dashboard/page.tsx`
- `client/src/app/profile/page.tsx`
- `client/src/app/users/page.tsx`
- `client/src/components/common/UserAvatar.tsx`
- `client/src/components/users/ProfileManager.tsx`
- `client/src/components/users/ProfilePermissionsModal.tsx`
- `client/src/components/users/UserHistoryModal.tsx`
- `client/src/components/users/UserModal.tsx`
- `client/src/contexts/AuthContext.tsx`
- `client/src/hooks/usePermissions.ts`

#### Backend
- `server/src/index.ts`
- `server/src/routes/auth.ts`
- `server/src/routes/users.ts`

#### Nuevos Archivos
- `client/src/components/users/UserActionsMenu.tsx`

### 📊 Estadísticas
- **21 archivos modificados**
- **+3,652 líneas agregadas**
- **-841 líneas eliminadas**
- **1 nuevo componente creado**

---

## [1.0.1] - 2025-01-07

### ✨ Agregado
- **Sistema completo de gestión de usuarios**
- **Paginación, filtros y búsqueda avanzada**
- **Historial de auditoría de usuarios**
- **Sistema de cambio de contraseñas**
- **Gestión de permisos granular**
- **Autenticación JWT robusta**
- **Interface responsive completa**

### 🔧 Corregido
- **Base de autenticación** establecida
- **Sistema de sesiones** implementado
- **Validaciones de formularios** completadas

### 🎨 Mejorado
- **Experiencia de usuario** inicial
- **Arquitectura de componentes** React
- **Sistema de rutas** protegidas

---

## [1.0.0] - 2025-01-05

### ✨ Agregado
- **Proyecto inicial** - Estructura base del ERP
- **Configuración** de Next.js + TypeScript
- **Backend** Node.js + Express + Prisma
- **Base de datos** MySQL con Prisma ORM
- **Autenticación** JWT básica
- **Sistema de usuarios** fundamental
- **Dashboard** inicial
- **Módulos principales** estructura base:
  - Contabilidad
  - Caja y Bancos
  - Compras
  - Ventas
  - IVA e Impuestos
  - Usuarios y Configuración

### 🔧 Infraestructura
- **Docker** configuración para desarrollo
- **Scripts** de instalación automatizada
- **Migraciones** de base de datos
- **Seeders** para datos iniciales
- **Variables de entorno** configuradas

---

## Próximas Versiones

### [1.0.3] - En Desarrollo
- 🔮 **Por definir** - Nuevas funcionalidades según roadmap

### Futuras Versiones
- **1.1.0** - Módulo de Contabilidad completo
- **1.2.0** - Módulo de Ventas
- **1.3.0** - Módulo de Compras
- **1.4.0** - Módulo de Caja y Bancos
- **1.5.0** - Módulo de IVA e Impuestos

---

## 🏷️ Convenciones de Versionado

Este proyecto utiliza [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Cambios incompatibles en la API
- **MINOR** (x.1.x): Nuevas funcionalidades compatibles hacia atrás
- **PATCH** (x.x.1): Correcciones de bugs compatibles

### 🏷️ Etiquetas de Cambios

- ✨ **Agregado**: Nuevas funcionalidades
- 🔧 **Corregido**: Corrección de bugs
- 🎨 **Mejorado**: Mejoras en funcionalidades existentes
- 🗑️ **Eliminado**: Funcionalidades removidas
- 🔒 **Seguridad**: Correcciones relacionadas con seguridad
- 📋 **Documentación**: Cambios en documentación
- 🏗️ **Interno**: Cambios internos sin impacto en funcionalidad

---

**🚌 Desarrollado para Saldivia - Alvear, Santa Fe, Argentina** 