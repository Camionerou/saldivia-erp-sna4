import mysql from 'mysql2/promise';

export class LegacyDatabaseService {
  private connection: mysql.Connection | null = null;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.LEGACY_DB_HOST || 'localhost',
        user: process.env.LEGACY_DB_USER || 'root',
        password: process.env.LEGACY_DB_PASSWORD || '',
        database: process.env.LEGACY_DB_NAME || 'saldivia',
        charset: 'utf8mb4'
      });

      console.log('✅ Conectado a la base de datos legacy de Saldivia');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos legacy:', error);
    }
  }

  // === MÉTODOS DE CONTABILIDAD ===

  async getAccounts(): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      const [rows] = await this.connection.execute(`
        SELECT 
          codigo as code,
          nombre as name,
          descripcion as description,
          tipo as type,
          activa as active
        FROM cuentas_contables 
        WHERE activa = 1
        ORDER BY codigo
      `);
      
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo cuentas:', error);
      return [];
    }
  }

  async getJournalEntries(startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          numero as number,
          fecha as date,
          descripcion as description,
          cuenta_codigo as accountCode,
          debe as debit,
          haber as credit,
          saldo as balance
        FROM asientos_contables 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (startDate) {
        query += ' AND fecha >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND fecha <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY fecha DESC, numero DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo asientos:', error);
      return [];
    }
  }

  // === MÉTODOS DE BANCOS ===

  async getBankAccounts(): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      const [rows] = await this.connection.execute(`
        SELECT 
          id,
          banco_nombre as bankName,
          numero_cuenta as accountNumber,
          tipo_cuenta as accountType,
          moneda as currency,
          saldo as balance,
          activa as active
        FROM cuentas_bancarias 
        WHERE activa = 1
        ORDER BY banco_nombre, numero_cuenta
      `);
      
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo cuentas bancarias:', error);
      return [];
    }
  }

  async getBankMovements(accountId?: string, startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          id,
          cuenta_bancaria_id as accountId,
          fecha as date,
          descripcion as description,
          referencia as reference,
          debe as debit,
          haber as credit,
          saldo as balance,
          conciliado as reconciled
        FROM movimientos_bancarios 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (accountId) {
        query += ' AND cuenta_bancaria_id = ?';
        params.push(accountId);
      }
      
      if (startDate) {
        query += ' AND fecha >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND fecha <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY fecha DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo movimientos bancarios:', error);
      return [];
    }
  }

  // === MÉTODOS DE CHEQUES ===

  async getChecks(status?: string): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          id,
          numero as number,
          fecha as date,
          monto as amount,
          beneficiario as payee,
          estado as status,
          cuenta_bancaria_id as accountId
        FROM cheques 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (status) {
        query += ' AND estado = ?';
        params.push(status);
      }
      
      query += ' ORDER BY fecha DESC, numero DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo cheques:', error);
      return [];
    }
  }

  // === MÉTODOS DE COMPRAS Y VENTAS ===

  async getPurchases(startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          id,
          numero as number,
          fecha as date,
          proveedor_nombre as supplierName,
          descripcion as description,
          subtotal,
          impuestos as tax,
          total,
          estado as status
        FROM compras 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (startDate) {
        query += ' AND fecha >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND fecha <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY fecha DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo compras:', error);
      return [];
    }
  }

  async getSales(startDate?: string, endDate?: string): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          id,
          numero as number,
          fecha as date,
          cliente_nombre as customerName,
          descripcion as description,
          subtotal,
          impuestos as tax,
          total,
          estado as status
        FROM ventas 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (startDate) {
        query += ' AND fecha >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND fecha <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY fecha DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      return [];
    }
  }

  // === MÉTODOS DE IVA ===

  async getTaxRecords(year?: number, month?: number): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      let query = `
        SELECT 
          id,
          fecha as date,
          tipo as type,
          tipo_documento as documentType,
          numero_documento as documentNumber,
          cuit as taxId,
          razon_social as businessName,
          monto_neto as netAmount,
          monto_iva as taxAmount,
          monto_total as totalAmount
        FROM registros_iva 
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (year) {
        query += ' AND YEAR(fecha) = ?';
        params.push(year);
      }
      
      if (month) {
        query += ' AND MONTH(fecha) = ?';
        params.push(month);
      }
      
      query += ' ORDER BY fecha DESC';
      
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error obteniendo registros IVA:', error);
      return [];
    }
  }

  // === MÉTODOS GENERALES ===

  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.connection) return [];
    
    try {
      const [rows] = await this.connection.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error('Error ejecutando query:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Conexión a base de datos legacy cerrada');
    }
  }
}

// Instancia singleton
export const legacyDB = new LegacyDatabaseService(); 