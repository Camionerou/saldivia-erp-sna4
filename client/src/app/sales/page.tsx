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
  Sell,
  People,
  Receipt,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface Customer {
  id: number;
  name: string;
  cuit: string;
  email: string;
  phone: string;
  totalSales: number;
}

interface Sale {
  id: number;
  date: string;
  customer: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
}

export default function SalesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, salesRes] = await Promise.all([
          api.get('/api/sales/customers'),
          api.get('/api/sales/invoices'),
        ]);
        
        setCustomers(customersRes.data);
        setSales(salesRes.data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
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

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const pendingSales = sales.filter(s => s.status === 'PENDING').length;

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
          <Sell sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ventas
          </Typography>
          <Button color="inherit" startIcon={<Add />}>
            Nueva Venta
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
                  <Sell color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Total Ventas
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(totalSales)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="info" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Clientes Activos
                  </Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {customers.length}
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
                  {pendingSales}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Clientes */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Clientes
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>CUIT</TableCell>
                        <TableCell>Teléfono</TableCell>
                        <TableCell align="right">Total Ventas</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.cuit}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(customer.totalSales)}
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

          {/* Facturas de Venta */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facturas de Venta
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Número</TableCell>
                        <TableCell align="right">Importe</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>{sale.invoiceNumber}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(sale.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sale.status}
                              size="small"
                              color={
                                sale.status === 'PAID' ? 'success' :
                                sale.status === 'PENDING' ? 'warning' :
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