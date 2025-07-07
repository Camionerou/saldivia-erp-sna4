import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/accounting/accounts - Obtener plan de cuentas
router.get('/accounts', async (_req, res) => {
  try {
    // Por ahora retornamos datos simulados
    const accounts = [
      { id: '1', code: '1.1.01', name: 'Caja', type: 'ASSET', balance: 50000 },
      { id: '2', code: '1.1.02', name: 'Banco Nación', type: 'ASSET', balance: 250000 },
      { id: '3', code: '2.1.01', name: 'Proveedores', type: 'LIABILITY', balance: 150000 },
      { id: '4', code: '4.1.01', name: 'Ventas', type: 'REVENUE', balance: 500000 }
    ];
    
    res.json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/accounting/journal-entries - Obtener asientos contables
router.get('/journal-entries', async (_req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        fiscalYear: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json(entries);
  } catch (error) {
    console.error('Error al obtener asientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 