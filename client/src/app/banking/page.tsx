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
  AccountBalanceWallet,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Edit,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface Movement {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  bankAccount: string;
}

export default function BankingPage() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, movementsRes] = await Promise.all([
          api.get('/api/banking/accounts'),
          api.get('/api/banking/movements'),
        ]);
        
        setBankAccounts(accountsRes.data);
        setMovements(movementsRes.data);
      } catch (error) {
        console.error('Error fetching banking data:', error);
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

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);

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
          <AccountBalanceWallet sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Caja y Bancos
          </Typography>
          <Button color="inherit" startIcon={<Add />}>
            Nuevo Movimiento
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
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Saldo Total
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(totalBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Ingresos del Mes
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(movements.filter(m => m.amount > 0).reduce((sum, m) => sum + m.amount, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Egresos del Mes
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(Math.abs(movements.filter(m => m.amount < 0).reduce((sum, m) => sum + m.amount, 0)))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cuentas Bancarias */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cuentas Bancarias
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Banco</TableCell>
                        <TableCell>Número</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bankAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.bankName}</TableCell>
                          <TableCell>{account.accountNumber}</TableCell>
                          <TableCell>
                            <Chip 
                              label={account.accountType} 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(account.balance)}
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

          {/* Movimientos Recientes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Movimientos Recientes
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Cuenta</TableCell>
                        <TableCell align="right">Importe</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>{movement.description}</TableCell>
                          <TableCell>{movement.bankAccount}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: movement.amount > 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            {movement.amount > 0 ? '+' : ''}{formatCurrency(movement.amount)}
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