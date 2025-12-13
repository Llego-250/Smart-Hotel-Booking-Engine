const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  async getDashboardMetrics() {
    const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
    return response.json();
  },

  async getRoomStatus() {
    const response = await fetch(`${API_BASE_URL}/rooms/status`);
    return response.json();
  },

  async getRevenueData() {
    const response = await fetch(`${API_BASE_URL}/revenue/daily`);
    return response.json();
  },

  async createReservation(data: {
    guestId: number;
    roomId: number;
    checkIn: string;
    checkOut: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};