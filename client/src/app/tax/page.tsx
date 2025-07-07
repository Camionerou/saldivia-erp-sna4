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
  Assessment,
  Receipt,
  CalendarMonth,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface TaxPeriod {
  id: number;
  year: number;
  month: number;
  status: string;
  salesTax: number;
  purchasesTax: number;
  balance: number;
}

interface TaxRecord {
  id: number;
  date: string;
  type: string;
  description: string;
  taxAmount: number;
  totalAmount: number;
  status: string;
}

export default function TaxPage() {
  const router = useRouter();
  const [taxPeriods, setTaxPeriods] = useState<TaxPeriod[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [periodsRes, recordsRes] = await Promise.all([
          api.get('/api/tax/periods'),
          api.get('/api/tax/records'),
        ]);
        
        setTaxPeriods(periodsRes.data);
        setTaxRecords(recordsRes.data);
      } catch (error) {
        console.error('Error fetching tax data:', error);
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

  const currentPeriod = taxPeriods.find(p => p.status === 'OPEN');
  const totalSalesTax = taxRecords.filter(r => r.type === 'SALES').reduce((sum, r) => sum + r.taxAmount, 0);
  const totalPurchasesTax = taxRecords.filter(r => r.type === 'PURCHASES').reduce((sum, r) => sum + r.taxAmount, 0);

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
          <Assessment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Impuestos
          </Typography>
          <Button color="inherit" startIcon={<Add />}>
            Nuevo Registro
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
                  <Receipt color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    IVA Ventas
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(totalSalesTax)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Receipt color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    IVA Compras
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(totalPurchasesTax)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Saldo a Pagar
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(totalSalesTax - totalPurchasesTax)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Períodos Fiscales */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Períodos Fiscales
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Período</TableCell>
                        <TableCell align="right">IVA Ventas</TableCell>
                        <TableCell align="right">IVA Compras</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taxPeriods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell>
                            {period.month.toString().padStart(2, '0')}/{period.year}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(period.salesTax)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(period.purchasesTax)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(period.balance)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={period.status}
                              size="small"
                              color={
                                period.status === 'CLOSED' ? 'success' :
                                period.status === 'OPEN' ? 'warning' :
                                'info'
                              }
                            />
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

          {/* Registros de IVA */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Registros de IVA
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">IVA</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taxRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.type}
                              size="small"
                              color={record.type === 'SALES' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(record.taxAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(record.totalAmount)}
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