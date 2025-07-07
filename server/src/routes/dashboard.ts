import express from 'express';

const router = express.Router();

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
router.get('/stats', async (_req, res) => {
  try {
    // Datos simulados para el dashboard
    const stats = {
      totalSales: 1250000,
      totalPurchases: 850000,
      bankBalance: 350000,
      pendingInvoices: 15,
      recentTransactions: [
        { id: 1, description: 'Venta de pasajes', amount: 25000, date: new Date() },
        { id: 2, description: 'Compra combustible', amount: -15000, date: new Date() },
        { id: 3, description: 'Pago salarios', amount: -85000, date: new Date() }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/dashboard/notifications - Obtener notificaciones
router.get('/notifications', async (_req, res) => {
  try {
    // Datos simulados de notificaciones
    const notifications = [
      { id: 1, message: 'Nueva factura pendiente', type: 'info', createdAt: new Date() },
      { id: 2, message: 'Pago vencido', type: 'warning', createdAt: new Date() },
      { id: 3, message: 'Backup completado', type: 'success', createdAt: new Date() }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 