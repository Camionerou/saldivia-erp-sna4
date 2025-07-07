'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  ShoppingCart,
  Business,
  Receipt,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface Supplier {
  id: number;
  name: string;
  cuit: string;
  email: string;
  phone: string;
  totalPurchases: number;
}

interface Purchase {
  id: number;
  date: string;
  supplier: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, purchasesRes] = await Promise.all([
          api.get('/api/purchases/suppliers'),
          api.get('/api/purchases/invoices'),
        ]);
        
        setSuppliers(suppliersRes.data);
        setPurchases(purchasesRes.data);
      } catch (error) {
        console.error('Error fetching purchases data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'PENDING').length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <ShoppingCart sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Compras
          </Typography>
          <Button color="inherit" startIcon={<Add />}>
            Nueva Compra
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Resumen */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShoppingCart color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Total Compras
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(totalPurchases)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business color="info" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Proveedores Activos
                  </Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {suppliers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Receipt color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Facturas Pendientes
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {pendingPurchases}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Proveedores */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proveedores
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>CUIT</TableCell>
                        <TableCell>Teléfono</TableCell>
                        <TableCell align="right">Total Compras</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>{supplier.name}</TableCell>
                          <TableCell>{supplier.cuit}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(supplier.totalPurchases)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Facturas de Compra */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facturas de Compra
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Proveedor</TableCell>
                        <TableCell>Número</TableCell>
                        <TableCell align="right">Importe</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            {new Date(purchase.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>{purchase.supplier}</TableCell>
                          <TableCell>{purchase.invoiceNumber}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(purchase.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={purchase.status}
                              size="small"
                              color={
                                purchase.status === 'PAID' ? 'success' :
                                purchase.status === 'PENDING' ? 'warning' :
                                'error'
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 