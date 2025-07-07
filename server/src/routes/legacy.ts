import express from 'express';

const router = express.Router();

// GET /api/legacy/accounts - Obtener cuentas del sistema legacy
router.get('/accounts', async (_req, res) => {
  try {
    // Datos simulados del sistema legacy
    const accounts = [
      { id: 1, code: '1.1.01', name: 'Caja Legacy', balance: 45000 },
      { id: 2, code: '1.1.02', name: 'Banco Legacy', balance: 220000 }
    ];
    res.json(accounts);
  } catch (error) {
    console.error('Error al obtener cuentas legacy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/legacy/movements - Obtener movimientos del sistema legacy
router.get('/movements', async (_req, res) => {
  try {
    // Datos simulados del sistema legacy
    const movements = [
      { id: 1, description: 'Movimiento legacy 1', amount: 15000, date: '2024-01-01' },
      { id: 2, description: 'Movimiento legacy 2', amount: -8000, date: '2024-01-02' }
    ];
    res.json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos legacy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 