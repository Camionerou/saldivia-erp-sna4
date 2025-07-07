import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios de ejemplo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const contadorPassword = await bcrypt.hash('contador123', 10);

  // Usuario administrador
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@saldivia.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      active: true,
      lastLogin: new Date()
    }
  });

  // Usuario contador
  const contadorUser = await prisma.user.create({
    data: {
      username: 'contador',
      email: 'contador@saldivia.com',
      password: contadorPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      active: true,
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) // Hace 1 día
    }
  });

  // Usuario vendedor
  const vendedorUser = await prisma.user.create({
    data: {
      username: 'vendedor',
      email: 'vendedor@saldivia.com',
      password: userPassword,
      firstName: 'María',
      lastName: 'González',
      active: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // Hace 2 horas
    }
  });

  // Usuario inactivo
  const inactivoUser = await prisma.user.create({
    data: {
      username: 'inactivo',
      email: 'inactivo@saldivia.com',
      password: userPassword,
      firstName: 'Pedro',
      lastName: 'Martínez',
      active: false,
      lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Hace 30 días
    }
  });

  // Crear perfiles
  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'accounting.full',
        'banking.full',
        'purchases.full',
        'sales.full',
        'tax.full',
        'system.config'
      ]
    }
  });

  await prisma.profile.create({
    data: {
      userId: contadorUser.id,
      name: 'Contador',
      description: 'Acceso a módulos contables y fiscales',
      permissions: [
        'accounting.full',
        'banking.read',
        'tax.full',
        'reports.accounting'
      ]
    }
  });

  await prisma.profile.create({
    data: {
      userId: vendedorUser.id,
      name: 'Vendedor',
      description: 'Acceso a módulo de ventas',
      permissions: [
        'sales.create',
        'sales.read',
        'sales.update',
        'customers.read',
        'customers.create'
      ]
    }
  });

  await prisma.profile.create({
    data: {
      userId: inactivoUser.id,
      name: 'Usuario Básico',
      description: 'Acceso limitado de solo lectura',
      permissions: [
        'dashboard.read',
        'reports.basic'
      ]
    }
  });

  // Crear año fiscal actual
  const currentYear = new Date().getFullYear();
  await prisma.fiscalYear.upsert({
    where: { year: currentYear },
    update: {},
    create: {
      year: currentYear,
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
      active: true
    }
  });

  // Crear centros de costo
  const costCenters = [
    { code: 'ADM', name: 'Administración', description: 'Gastos administrativos generales' },
    { code: 'OPE', name: 'Operaciones', description: 'Gastos operativos de transporte' },
    { code: 'MAN', name: 'Mantenimiento', description: 'Mantenimiento de vehículos' },
    { code: 'VEN', name: 'Ventas', description: 'Actividades de ventas y marketing' }
  ];

  for (const center of costCenters) {
    await prisma.costCenter.upsert({
      where: { code: center.code },
      update: {},
      create: center
    });
  }

  // Crear bancos
  const banks = [
    { code: 'BNA', name: 'Banco de la Nación Argentina', active: true },
    { code: 'BPS', name: 'Banco Provincia de Santa Fe', active: true },
    { code: 'BCR', name: 'Banco de Córdoba', active: true },
    { code: 'GAL', name: 'Banco Galicia', active: true }
  ];

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: {},
      create: bank
    });
  }

  // Crear cuentas bancarias
  const bankAccounts = [
    {
      accountNumber: '1234567890',
      accountType: 'CORRIENTE',
      balance: 250000.00,
      active: true,
      bankCode: 'BNA'
    },
    {
      accountNumber: '0987654321',
      accountType: 'AHORRO',
      balance: 150000.00,
      active: true,
      bankCode: 'BPS'
    }
  ];

  for (const account of bankAccounts) {
    const bank = await prisma.bank.findUnique({ where: { code: account.bankCode } });
    if (bank) {
      await prisma.bankAccount.create({
        data: {
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          active: account.active,
          bankId: bank.id
        }
      });
    }
  }

  // Crear proveedores
  const suppliers = [
    {
      code: 'PROV001',
      name: 'YPF S.A.',
      email: 'ventas@ypf.com',
      phone: '+54 11 5555-1234',
      address: 'Av. Corrientes 1234, Buenos Aires',
      taxId: '30-12345678-9',
      active: true
    },
    {
      code: 'PROV002',
      name: 'Repuestos del Norte',
      email: 'info@repuestosnorte.com',
      phone: '+54 3405 123456',
      address: 'Av. San Martín 567, Alvear',
      taxId: '27-87654321-3',
      active: true
    }
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {},
      create: supplier
    });
  }

  // Crear clientes
  const customers = [
    {
      code: 'CLI001',
      name: 'Terminal de Ómnibus Alvear',
      email: 'terminal@alvear.gob.ar',
      phone: '+54 3405 654321',
      address: 'Av. Terminal s/n, Alvear',
      taxId: '30-99887766-5',
      active: true
    },
    {
      code: 'CLI002',
      name: 'Escuela Técnica N° 1',
      email: 'escuela@tecnica1.edu.ar',
      phone: '+54 3405 111222',
      address: 'Calle Educación 123, Alvear',
      taxId: '30-55443322-1',
      active: true
    }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { code: customer.code },
      update: {},
      create: customer
    });
  }

  // Crear períodos fiscales para IVA
  const taxPeriods = [
    { year: currentYear, month: 1 },
    { year: currentYear, month: 2 },
    { year: currentYear, month: 3 },
    { year: currentYear, month: 4 },
    { year: currentYear, month: 5 },
    { year: currentYear, month: 6 }
  ];

  for (const period of taxPeriods) {
    await prisma.taxPeriod.upsert({
      where: { 
        year_month: {
          year: period.year,
          month: period.month
        }
      },
      update: {},
      create: {
        year: period.year,
        month: period.month,
        startDate: new Date(period.year, period.month - 1, 1),
        endDate: new Date(period.year, period.month, 0),
        active: true
      }
    });
  }

  // Crear configuración del sistema
  const systemConfig = [
    { key: 'company_name', value: 'Saldivia Buses', description: 'Nombre de la empresa' },
    { key: 'company_address', value: 'Alvear, Santa Fe, Argentina', description: 'Dirección de la empresa' },
    { key: 'company_phone', value: '+54 3405 123456', description: 'Teléfono de la empresa' },
    { key: 'company_email', value: 'info@saldiviabuses.com', description: 'Email de la empresa' },
    { key: 'company_tax_id', value: '30-12345678-9', description: 'CUIT de la empresa' },
    { key: 'backup_frequency', value: 'daily', description: 'Frecuencia de backup' },
    { key: 'session_timeout', value: '24', description: 'Tiempo de sesión en horas' }
  ];

  for (const config of systemConfig) {
    await prisma.systemConfiguration.upsert({
      where: { key: config.key },
      update: {},
      create: config
    });
  }

  // Crear cuentas contables básicas
  const accounts = [
    { code: '1.1.01', name: 'Caja', accountType: 'ACTIVO', level: 3 },
    { code: '1.1.02', name: 'Banco Nación', accountType: 'ACTIVO', level: 3 },
    { code: '1.1.03', name: 'Banco Provincia', accountType: 'ACTIVO', level: 3 },
    { code: '2.1.01', name: 'Proveedores', accountType: 'PASIVO', level: 3 },
    { code: '3.1.01', name: 'Capital Social', accountType: 'PATRIMONIO', level: 3 },
    { code: '4.1.01', name: 'Ingresos por Servicios', accountType: 'INGRESO', level: 3 },
    { code: '5.1.01', name: 'Gastos Operativos', accountType: 'EGRESO', level: 3 },
    { code: '5.1.02', name: 'Gastos Administrativos', accountType: 'EGRESO', level: 3 }
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: account
    });
  }

  console.log('✅ Seed completado exitosamente!');
  console.log('👤 Usuarios creados:');
  console.log('   - admin / admin123 (Administrador)');
  console.log('   - contador / contador123 (Contador)');
  console.log('   - vendedor / user123 (Vendedor)');
  console.log('   - inactivo / user123 (Usuario Inactivo)');
  console.log('🏦 Datos iniciales creados:');
  console.log('   - 4 Centros de costo');
  console.log('   - 4 Bancos');
  console.log('   - 2 Cuentas bancarias');
  console.log('   - 2 Proveedores');
  console.log('   - 2 Clientes');
  console.log('   - 6 Períodos fiscales');
  console.log('   - 8 Cuentas contables');
  console.log('   - Configuración del sistema');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 