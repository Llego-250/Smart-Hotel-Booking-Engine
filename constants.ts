import { Room, RoomStatus, RoomType, GuestSegment, RevenueData, BookingForecast, Alert } from './types';

// Simulate Oracle PL/SQL Date outputs
const today = new Date().toISOString().split('T')[0];

export const MOCK_ROOMS: Room[] = Array.from({ length: 48 }, (_, i) => {
  const floor = Math.floor(i / 12) + 1;
  const roomNum = i % 12 + 1;
  const number = `${floor}${roomNum.toString().padStart(2, '0')}`;
  
  let status = RoomStatus.AVAILABLE;
  const rand = Math.random();
  if (rand > 0.7) status = RoomStatus.OCCUPIED;
  else if (rand > 0.5) status = RoomStatus.RESERVED;
  else if (rand > 0.45) status = RoomStatus.MAINTENANCE;
  else if (rand > 0.35) status = RoomStatus.DIRTY;

  let type = RoomType.STANDARD;
  if (roomNum > 8) type = RoomType.DELUXE;
  if (roomNum > 10) type = RoomType.SUITE;
  if (floor === 4) type = RoomType.EXECUTIVE;

  return {
    id: `room-${number}`,
    number,
    type,
    status,
    guestName: status === RoomStatus.OCCUPIED ? ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)] : undefined,
    checkOut: status === RoomStatus.OCCUPIED ? '2024-10-25' : undefined,
    price: type === RoomType.SUITE ? 450 : type === RoomType.DELUXE ? 250 : 150
  };
});

export const REVENUE_DATA: RevenueData[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const baseRevenue = 15000 + Math.random() * 5000;
  return {
    date: `2024-09-${day.toString().padStart(2, '0')}`,
    revenue: Math.floor(baseRevenue),
    expenses: Math.floor(baseRevenue * 0.6),
    projected: Math.floor(baseRevenue * 1.1)
  };
});

export const GUEST_SEGMENTS: GuestSegment[] = [
  { name: 'Business', value: 45, revenue: 125000, color: '#1976D2' },
  { name: 'Leisure', value: 35, revenue: 85000, color: '#4CAF50' },
  { name: 'Groups', value: 15, revenue: 45000, color: '#FF9800' },
  { name: 'Walk-in', value: 5, revenue: 12000, color: '#9C27B0' },
];

export const FORECAST_DATA: BookingForecast[] = Array.from({ length: 14 }, (_, i) => {
  const day = i + 1;
  const baseOcc = 75 + Math.sin(i * 0.5) * 15;
  return {
    date: `Oct ${day}`,
    occupancy: Math.floor(baseOcc),
    confidenceLower: Math.floor(baseOcc - 5),
    confidenceUpper: Math.floor(baseOcc + 5)
  };
});

export const INITIAL_ALERTS: Alert[] = [
  { id: '1', type: 'warning', message: '3 Pending Payments for checkout today', timestamp: '10:30 AM' },
  { id: '2', type: 'error', message: 'Room 204 HVAC Maintenance Required', timestamp: '09:15 AM' },
  { id: '3', type: 'info', message: 'VIP Guest Arrival: Mr. Anderson (Room 401)', timestamp: '08:00 AM' },
];

export const AI_PROMPTS = {
  EXECUTIVE_SUMMARY: "Generate a concise executive summary for a hotel management dashboard based on the following metrics: Occupancy 85%, ADR $245, RevPAR $208. Mention that occupancy is trending up by 2.3% and revenue is slightly below target due to seasonal maintenance. Suggest a strategic focus on weekend packages."
};
