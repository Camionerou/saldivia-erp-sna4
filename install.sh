#!/bin/bash

# 🚌 Script de Instalación - ERP Saldivia Buses
# Instalación automatizada del sistema ERP moderno

set -e

echo "🚌 =============================================="
echo "   ERP SALDIVIA BUSES - INSTALACIÓN AUTOMÁTICA"
echo "   Alvear, Santa Fe, Argentina"
echo "=============================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_info "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instale Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18+ requerida. Versión actual: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) ✓"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    print_success "npm $(npm --version) ✓"
    
    # Verificar MySQL (opcional)
    if command -v mysql &> /dev/null; then
        print_success "MySQL $(mysql --version | cut -d' ' -f6) ✓"
    else
        print_warning "MySQL no detectado. Asegúrese de tener MySQL 8.0+ instalado y configurado"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_info "Instalando dependencias del proyecto..."
    
    # Instalar dependencias raíz
    print_info "Instalando dependencias principales..."
    npm install
    
    # Instalar dependencias del servidor
    print_info "Instalando dependencias del servidor..."
    cd server
    npm install
    cd ..
    
    # Instalar dependencias del cliente
    print_info "Instalando dependencias del cliente..."
    cd client
    npm install
    cd ..
    
    print_success "Todas las dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_info "Configurando variables de entorno..."
    
    # Backend .env
    if [ ! -f "server/.env" ]; then
        print_info "Creando archivo de configuración del servidor..."
        cp server/env.example server/.env
        print_warning "Por favor edite server/.env con sus configuraciones de base de datos"
    else
        print_info "Archivo server/.env ya existe"
    fi
    
    # Frontend .env.local
    if [ ! -f "client/.env.local" ]; then
        print_info "Creando archivo de configuración del cliente..."
        cat > client/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF
        print_success "Archivo client/.env.local creado"
    else
        print_info "Archivo client/.env.local ya existe"
    fi
}

# Configurar base de datos
setup_database() {
    print_info "Configurando base de datos..."
    
    cd server
    
    # Generar cliente Prisma
    print_info "Generando cliente Prisma..."
    npx prisma generate
    
    # Ejecutar migraciones (si la base de datos está disponible)
    print_info "Intentando ejecutar migraciones..."
    if npx prisma migrate dev --name init 2>/dev/null; then
        print_success "Migraciones ejecutadas correctamente"
        
        # Poblar datos iniciales
        print_info "Poblando datos iniciales..."
        if npm run seed 2>/dev/null; then
            print_success "Datos iniciales cargados"
        else
            print_warning "No se pudieron cargar los datos iniciales (normal en primera instalación)"
        fi
    else
        print_warning "No se pudieron ejecutar las migraciones. Verifique la configuración de la base de datos en server/.env"
    fi
    
    cd ..
}

# Compilar proyecto
build_project() {
    print_info "Compilando proyecto..."
    
    # Compilar servidor
    print_info "Compilando servidor TypeScript..."
    cd server
    npm run build
    cd ..
    
    # Compilar cliente (opcional para desarrollo)
    print_info "Verificando compilación del cliente..."
    cd client
    npm run type-check
    cd ..
    
    print_success "Proyecto compilado correctamente"
}

# Crear usuario administrador
create_admin_user() {
    print_info "Configurando usuario administrador..."
    
    # Este script se ejecutaría después de que la base de datos esté configurada
    cat > server/create-admin.js << 'EOF'
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    const hashedPassword = await bcrypt.hash('jopo', 12);
    
    const user = await prisma.user.upsert({
      where: { username: 'adrian' },
      update: {},
      create: {
        username: 'adrian',
        password: hashedPassword,
        firstName: 'Adrián',
        lastName: 'Administrador',
        email: 'admin@saldiviabuses.com.ar',
        active: true,
        profile: {
          create: {
            name: 'Administrador',
            description: 'Perfil de administrador con acceso completo',
            permissions: ['ADMIN', 'ACCOUNTING', 'BANKING', 'PURCHASES', 'SALES', 'HR', 'REPORTS']
          }
        }
      },
      include: { profile: true }
    });
    
    console.log('✅ Usuario administrador creado:', user.username);
  } catch (error) {
    console.log('ℹ️ Usuario administrador ya existe o error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
EOF
    
    print_success "Script de usuario administrador creado"
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 =============================================="
    echo "   ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!"
    echo "=============================================="
    echo ""
    print_success "El ERP Saldivia Buses ha sido instalado correctamente"
    echo ""
    echo "📋 PRÓXIMOS PASOS:"
    echo ""
    echo "1. 🔧 Configurar base de datos:"
    echo "   - Edite server/.env con sus credenciales de MySQL"
    echo "   - Ejecute: cd server && npx prisma migrate dev"
    echo ""
    echo "2. 🚀 Iniciar el sistema:"
    echo "   - Desarrollo: npm run dev"
    echo "   - Producción: npm run build && npm start"
    echo ""
    echo "3. 🌐 Acceder al sistema:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo ""
    echo "4. 🔑 Credenciales de acceso:"
    echo "   - Usuario: adrian"
    echo "   - Contraseña: jopo"
    echo ""
    echo "📚 DOCUMENTACIÓN:"
    echo "   - README.md - Documentación completa"
    echo "   - server/env.example - Configuraciones disponibles"
    echo ""
    echo "🆘 SOPORTE:"
    echo "   - Email: soporte@saldiviabuses.com.ar"
    echo "   - Teléfono: +54 3406 XXXXXX"
    echo ""
    print_success "¡Gracias por elegir el ERP Saldivia Buses!"
    echo "🚌 Saldivia Buses - Conectando Argentina desde 1950"
    echo ""
}

# Función principal
main() {
    echo "Iniciando instalación del ERP Saldivia Buses..."
    echo ""
    
    check_prerequisites
    echo ""
    
    install_dependencies
    echo ""
    
    setup_environment
    echo ""
    
    setup_database
    echo ""
    
    build_project
    echo ""
    
    create_admin_user
    echo ""
    
    show_final_info
}

# Ejecutar instalación
main 