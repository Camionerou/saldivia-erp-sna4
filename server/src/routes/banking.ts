import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/banking/accounts - Obtener cuentas bancarias
router.get('/accounts', async (_req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      include: {
        bank: true
      }
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas bancarias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/banking/movements - Obtener movimientos bancarios
router.get('/movements', async (_req, res) => {
  try {
    const movements = await prisma.bankMovement.findMany({
      include: {
        bankAccount: {
          include: {
            bank: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 