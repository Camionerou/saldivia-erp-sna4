import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tax/periods - Obtener períodos fiscales
router.get('/periods', async (_req, res) => {
  try {
    const periods = await prisma.taxPeriod.findMany({
      orderBy: {
        year: 'desc'
      }
    });
    res.json(periods);
  } catch (error) {
    console.error('Error al obtener períodos fiscales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/tax/records - Obtener registros de impuestos
router.get('/records', async (_req, res) => {
  try {
    const records = await prisma.taxRecord.findMany({
      include: {
        taxPeriod: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(records);
  } catch (error) {
    console.error('Error al obtener registros de impuestos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 