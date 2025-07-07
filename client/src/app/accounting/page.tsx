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
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  AccountBalance,
  Receipt,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
}

export default function AccountingPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, transactionsRes] = await Promise.all([
          api.get('/api/accounting/accounts'),
          api.get('/api/accounting/transactions'),
        ]);
        
        setAccounts(accountsRes.data);
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error('Error fetching accounting data:', error);
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
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Contabilidad
          </Typography>
          <Button color="inherit" startIcon={<Add />}>
            Nuevo Asiento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Total Activos
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balance, 0))}
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
                    Total Pasivos
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + a.balance, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Patrimonio Neto
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + a.balance, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plan de Cuentas */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plan de Cuentas
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Cuenta</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={account.type} 
                              size="small"
                              color={
                                account.type === 'ASSET' ? 'success' :
                                account.type === 'LIABILITY' ? 'error' :
                                'primary'
                              }
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
                        <TableCell align="right">Debe</TableCell>
                        <TableCell align="right">Haber</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.account}</TableCell>
                          <TableCell align="right">
                            {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
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