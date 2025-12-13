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
  },

  async getGuestAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/guests`);
    return response.json();
  },

  async getFinancialMetrics() {
    const response = await fetch(`${API_BASE_URL}/analytics/financial`);
    return response.json();
  },

  async getServiceAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/services`);
    return response.json();
  },

  async getPaymentAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/payments`);
    return response.json();
  },

  async getForecastData() {
    const response = await fetch(`${API_BASE_URL}/analytics/forecast`);
    return response.json();
  }
};