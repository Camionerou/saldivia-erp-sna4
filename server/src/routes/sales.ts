import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/sales - Obtener ventas
router.get('/', async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/sales/customers - Obtener clientes
router.get('/customers', async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 