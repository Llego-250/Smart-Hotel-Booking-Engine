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
        (SELECT SUM(total_amount) FROM PAYMENT WHERE TRUNC(created_date) = TRUNC(SYSDATE)) as daily_revenue,
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
    res.status(500).json({ error: error.message });
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
      SELECT room_id, room_number, room_type, status, 
             CASE WHEN status = 'OCCUPIED' THEN 
               (SELECT g.first_name || ' ' || g.last_name 
                FROM GUEST g JOIN RESERVATION r ON g.guest_id = r.guest_id 
                WHERE r.room_id = room.room_id AND r.status = 'CHECKED_IN' AND ROWNUM = 1)
             END as guest_name
      FROM ROOM room
      ORDER BY room_number
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
    res.status(500).json({ error: error.message });
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
      SELECT TO_CHAR(created_date, 'MM-DD') as date, SUM(amount) as revenue
      FROM PAYMENT 
      WHERE created_date >= SYSDATE - 30
      GROUP BY TRUNC(created_date), TO_CHAR(created_date, 'MM-DD')
      ORDER BY TRUNC(created_date)
    `);
    
    const revenueData = result.rows.map(row => ({
      date: row[0],
      revenue: row[1] || 0
    }));
    
    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});