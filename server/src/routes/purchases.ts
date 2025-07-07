import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/purchases - Obtener compras
router.get('/', async (_req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/purchases/suppliers - Obtener proveedores
router.get('/suppliers', async (_req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 