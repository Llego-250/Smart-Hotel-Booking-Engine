import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

async function testFinancialQuery() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(`
      SELECT 
        NVL(SUM(amount), 0) as total_revenue,
        ROUND(NVL(SUM(amount), 0) / GREATEST((SELECT COUNT(*) FROM ROOM), 1), 2) as revpar,
        ROUND(NVL(AVG(amount), 0), 2) as adr
      FROM PAYMENT
      WHERE payment_date >= SYSDATE - 30
    `);
    
    console.log('✅ Financial query result:', result.rows[0]);
  } catch (error) {
    console.error('❌ Financial query error:', error.message);
  } finally {
    if (connection) await connection.close();
  }
}

testFinancialQuery();