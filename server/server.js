import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// Dashboard metrics endpoint
app.get('/api/dashboard/metrics', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(`
      SELECT 
        ROUND((SELECT COUNT(*) FROM RESERVATION WHERE status = 'CHECKED_IN') * 100.0 / 
              (SELECT COUNT(*) FROM ROOM WHERE status != 'MAINTENANCE'), 1) as occupancy_rate,
        (SELECT NVL(SUM(amount), 0) FROM PAYMENT WHERE TRUNC(payment_date) = TRUNC(SYSDATE)) as daily_revenue,
        (SELECT COUNT(*) FROM RESERVATION WHERE TRUNC(check_in_date) = TRUNC(SYSDATE)) as arrivals_today,
        (SELECT COUNT(*) FROM RESERVATION WHERE status = 'CHECKED_IN') as in_house_guests
      FROM DUAL
    `);
    
    res.json({
      occupancyRate: result.rows[0][0] || 0,
      dailyRevenue: result.rows[0][1] || 0,
      arrivalsToday: result.rows[0][2] || 0,
      inHouseGuests: result.rows[0][3] || 0
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  } finally {
    if (connection) await connection.close();
  }
});

// Room status endpoint
app.get('/api/rooms/status', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(`
      SELECT r.room_id, r.room_number, r.room_type, r.status, 
             CASE WHEN r.status = 'OCCUPIED' THEN 
               (SELECT g.first_name || ' ' || g.last_name 
                FROM GUEST g JOIN RESERVATION res ON g.guest_id = res.guest_id 
                WHERE res.room_id = r.room_id AND res.status = 'CHECKED_IN' AND ROWNUM = 1)
             END as guest_name
      FROM ROOM r
      ORDER BY r.room_number
    `);
    
    const rooms = result.rows.map(row => ({
      roomId: row[0],
      roomNumber: row[1],
      roomType: row[2],
      status: row[3],
      guestName: row[4]
    }));
    
    res.json(rooms);
  } catch (error) {
    console.error('Room status error:', error);
    res.status(500).json({ error: 'Failed to fetch room status' });
  } finally {
    if (connection) await connection.close();
  }
});

// Revenue data endpoint
app.get('/api/revenue/daily', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(`
      SELECT TRUNC(payment_date) as payment_date, NVL(SUM(amount), 0) as revenue
      FROM PAYMENT 
      WHERE payment_date >= SYSDATE - 30
      GROUP BY TRUNC(payment_date)
      ORDER BY TRUNC(payment_date)
    `);
    
    const revenueData = result.rows.map(row => ({
      date: row[0] ? new Date(row[0]).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : 'N/A',
      revenue: Number(row[1]) || 0
    }));
    
    res.json(revenueData);
  } catch (error) {
    console.error('Revenue data error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  } finally {
    if (connection) await connection.close();
  }
});

// Guest analytics endpoint
app.get('/api/analytics/guests', async (req, res) => {
  res.json([
    { name: 'Business', value: 45, revenue: 125000, color: '#3B82F6' },
    { name: 'Leisure', value: 35, revenue: 89000, color: '#10B981' },
    { name: 'Group', value: 20, revenue: 53000, color: '#F59E0B' }
  ]);
});

// Forecast data endpoint
app.get('/api/analytics/forecast', async (req, res) => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      occupancy: 65 + Math.sin(i * 0.2) * 15 + Math.random() * 10,
      confidenceLower: 50 + Math.sin(i * 0.2) * 10,
      confidenceUpper: 80 + Math.sin(i * 0.2) * 10
    });
  }
  res.json(data);
});

// Financial metrics endpoint
app.get('/api/analytics/financial', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`
      SELECT 
        NVL(SUM(amount), 0) as total_revenue,
        ROUND(NVL(SUM(amount), 0) / 6, 2) as revpar,
        ROUND(NVL(AVG(amount), 0), 2) as adr
      FROM PAYMENT
      WHERE payment_date >= SYSDATE - 30
    `);
    
    res.json({
      totalRevenue: Number(result.rows[0][0]) || 0,
      revpar: Number(result.rows[0][1]) || 0,
      adr: Number(result.rows[0][2]) || 0
    });
  } catch (error) {
    console.error('Financial metrics error:', error.message);
    res.status(500).json({ error: `Database error: ${error.message}` });
  } finally {
    if (connection) await connection.close();
  }
});

// Create reservation endpoint
app.post('/api/reservations', async (req, res) => {
  const { guestId, roomId, checkIn, checkOut } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const result = await connection.execute(`
      BEGIN
        create_reservation(:guest_id, :room_id, TO_DATE(:check_in, 'YYYY-MM-DD'), 
                          TO_DATE(:check_out, 'YYYY-MM-DD'), :reservation_id);
      END;
    `, {
      guest_id: guestId,
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut,
      reservation_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    });
    
    res.json({ reservationId: result.outBinds.reservation_id });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});