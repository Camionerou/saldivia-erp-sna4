# 🚌 ERP Saldivia Buses - Sistema de Gestión Integral

Sistema ERP moderno y completo desarrollado para **Saldivia Buses** de Alvear, Santa Fe, Argentina. Esta aplicación reemplaza el sistema legacy con tecnologías de vanguardia, manteniendo toda la funcionalidad existente y agregando nuevas características.

## 🎯 Características Principales

### ✨ **Interfaz Moderna**
- **Responsive Design** - Funciona en todos los dispositivos
- **Material-UI** - Componentes modernos y elegantes
- **Tema personalizado** - Colores corporativos de Saldivia Buses
- **Navegación intuitiva** - Fácil acceso a todas las funciones

### 🔐 **Seguridad Avanzada**
- **Autenticación JWT** - Tokens seguros con refresh automático
- **Control de sesiones** - Gestión avanzada de usuarios conectados
- **Permisos granulares** - Control de acceso por módulo
- **Auditoría completa** - Registro de todas las acciones

### 📊 **Módulos Principales**

#### 💰 **Contabilidad**
- Plan de cuentas jerárquico
- Asientos contables automatizados
- Libros diario y mayor
- Balance de sumas y saldos
- Centro de costos
- Ejercicios contables

#### 🏦 **Caja y Bancos**
- Gestión de cuentas bancarias
- Conciliación bancaria automática
- Cartera de cheques
- Órdenes de pago
- Movimientos de caja
- Transferencias entre bancos

#### 🛒 **Compras**
- Gestión de proveedores
- Órdenes de compra
- Facturación de proveedores
- Control de stock
- Análisis de gastos

#### 💼 **Ventas**
- Gestión de clientes
- Facturación electrónica
- Control de cobranzas
- Análisis de ventas
- Comisiones

#### 📋 **IVA y Impuestos**
- Libros de IVA compras y ventas
- Declaraciones juradas
- CITI (Comprobantes de Información Tributaria Integrada)
- Régimen de información
- Períodos fiscales

#### 👥 **Recursos Humanos**
- Gestión de empleados
- Liquidación de sueldos
- Control de asistencia
- Vacaciones y licencias

### 🔧 **Características Técnicas**

#### **Frontend**
- **Next.js 14** - Framework React moderno
- **TypeScript** - Tipado estático
- **Material-UI v5** - Componentes de interfaz
- **React Query** - Gestión de estado servidor
- **Socket.io** - Comunicación en tiempo real
- **React Hook Form** - Formularios optimizados

#### **Backend**
- **Node.js + Express** - Servidor robusto
- **TypeScript** - Tipado completo
- **Prisma ORM** - Base de datos type-safe
- **JWT Authentication** - Autenticación segura
- **Socket.io** - WebSockets para tiempo real
- **MySQL** - Base de datos principal

#### **Base de Datos**
- **Conexión híbrida** - Nueva DB + acceso a legacy
- **Migración automática** - Prisma migrations
- **Backup automático** - Respaldos programados
- **Optimización de consultas** - Índices y performance

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sna4
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno

#### Backend (server/env.example → server/.env)
```env
# Base de datos
DATABASE_URL="mysql://usuario:password@localhost:3306/saldivia_erp"
LEGACY_DATABASE_URL="mysql://usuario:password@localhost:3306/saldivia_legacy"

# JWT
JWT_SECRET="tu-secreto-jwt-muy-seguro-aqui"
JWT_REFRESH_SECRET="tu-secreto-refresh-jwt-aqui"

# Servidor
PORT=3001
NODE_ENV=development

# Empresa
COMPANY_NAME="Saldivia Buses"
COMPANY_ADDRESS="Alvear, Santa Fe, Argentina"
```

#### Frontend (client/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 4. Configurar base de datos
```bash
cd server
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 5. Iniciar el sistema
```bash
# Desde la raíz del proyecto
npm run dev

# O por separado:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### 6. Acceder al sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Credenciales**: usuario: `adrian`, contraseña: `jopo`

## 📱 Dispositivos Soportados

### 💻 **Desktop**
- Windows 10/11
- macOS
- Linux

### 📱 **Móvil**
- iOS Safari
- Android Chrome
- Responsive en todas las resoluciones

### 🖥️ **Tablets**
- iPad
- Android tablets
- Interfaz optimizada para touch

## 🔄 Migración desde Sistema Legacy

### **Datos Preservados**
- ✅ Todas las cuentas contables
- ✅ Asientos históricos
- ✅ Movimientos bancarios
- ✅ Cheques y documentos
- ✅ Proveedores y clientes
- ✅ Registros de IVA
- ✅ Configuraciones del sistema

### **Proceso de Migración**
1. **Backup completo** del sistema actual
2. **Instalación** del nuevo sistema
3. **Migración automática** de datos
4. **Verificación** de integridad
5. **Capacitación** del personal
6. **Go-live** coordinado

## 🛠️ Scripts Disponibles

### **Desarrollo**
```bash
npm run dev          # Iniciar frontend y backend
npm run server:dev   # Solo backend
npm run client:dev   # Solo frontend
```

### **Producción**
```bash
npm run build        # Compilar todo
npm start           # Iniciar en producción
```

### **Base de Datos**
```bash
npm run migrate     # Ejecutar migraciones
npm run generate    # Generar cliente Prisma
npm run seed        # Poblar datos iniciales
```

## 📊 Módulos del Sistema

### **📈 Dashboard**
- KPIs en tiempo real
- Gráficos interactivos
- Alertas y notificaciones
- Accesos rápidos

### **⚙️ Administración**
- Gestión de usuarios
- Perfiles y permisos
- Configuración del sistema
- Logs de auditoría

### **📄 Reportes**
- Reportes financieros
- Exportación PDF/Excel
- Gráficos personalizables
- Programación automática

### **🔔 Notificaciones**
- Tiempo real vía WebSocket
- Email automático
- Alertas personalizables
- Centro de notificaciones

## 🔧 Configuración Avanzada

### **Personalización**
- Colores corporativos
- Logo de la empresa
- Campos personalizados
- Flujos de trabajo

### **Integraciones**
- AFIP (Argentina)
- Bancos (home banking)
- Email (SMTP)
- Backup automático

### **Performance**
- Cache inteligente
- Optimización de consultas
- Compresión de respuestas
- CDN para assets

## 🆘 Soporte y Mantenimiento

### **Documentación**
- Manual de usuario
- Guías técnicas
- Videos tutoriales
- FAQ completo

### **Soporte Técnico**
- 📧 Email: soporte@saldiviabuses.com.ar
- 📞 Teléfono: +54 3406 XXXXXX
- 💬 Chat en línea
- 🎫 Sistema de tickets

### **Actualizaciones**
- Actualizaciones automáticas
- Nuevas funcionalidades
- Mejoras de seguridad
- Optimizaciones de performance

## 📄 Licencia

Desarrollo exclusivo para **Saldivia Buses**. Todos los derechos reservados.

---

**🚌 Saldivia Buses - Conectando Argentina desde 1950**  
*Alvear, Santa Fe, Argentina*

---

## 🎉 ¡Sistema ERP Moderno Listo!

Este sistema ERP moderno está diseñado específicamente para las necesidades de Saldivia Buses, combinando:

- ✅ **827 funcionalidades** del sistema original
- ✅ **Tecnologías modernas** y escalables  
- ✅ **Interfaz responsive** para todos los dispositivos
- ✅ **Seguridad enterprise** 
- ✅ **Performance optimizada**
- ✅ **Conexión con datos legacy**

¡Listo para revolucionar la gestión de Saldivia Buses! 🚀 