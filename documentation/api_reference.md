# Smart Hotel Booking Engine - API Reference

## Base Configuration

**Base URL:** `http://localhost:3001/api`  
**Content-Type:** `application/json`  
**Authentication:** Session-based (localStorage token)

## Dashboard Endpoints

### Get Dashboard Metrics
Retrieves key performance indicators for the executive dashboard.

```http
GET /dashboard/metrics
```

**Response:**
```json
{
  "occupancyRate": 85.2,
  "dailyRevenue": 12450.00,
  "arrivalsToday": 8,
  "inHouseGuests": 42
}
```

**Response Fields:**
- `occupancyRate` (number): Percentage of occupied rooms
- `dailyRevenue` (number): Total revenue for current day
- `arrivalsToday` (number): Number of check-ins scheduled for today
- `inHouseGuests` (number): Current number of checked-in guests

**SQL Query:**
```sql
SELECT 
  ROUND((SELECT COUNT(*) FROM RESERVATION WHERE status = 'CHECKED_IN') * 100.0 / 
        (SELECT COUNT(*) FROM ROOM WHERE status != 'MAINTENANCE'), 1) as occupancy_rate,
  (SELECT NVL(SUM(amount), 0) FROM PAYMENT WHERE TRUNC(payment_date) = TRUNC(SYSDATE)) as daily_revenue,
  (SELECT COUNT(*) FROM RESERVATION WHERE TRUNC(check_in_date) = TRUNC(SYSDATE)) as arrivals_today,
  (SELECT COUNT(*) FROM RESERVATION WHERE status = 'CHECKED_IN') as in_house_guests
FROM DUAL
```

## Room Management Endpoints

### Get Room Status
Retrieves current status of all rooms with guest information.

```http
GET /rooms/status
```

**Response:**
```json
[
  {
    "roomId": 101,
    "roomNumber": "101",
    "roomType": "STANDARD",
    "status": "OCCUPIED",
    "guestName": "John Smith"
  },
  {
    "roomId": 102,
    "roomNumber": "102",
    "roomType": "DELUXE",
    "status": "AVAILABLE",
    "guestName": null
  }
]
```

**Response Fields:**
- `roomId` (number): Unique room identifier
- `roomNumber` (string): Display room number
- `roomType` (string): Room category (STANDARD, DELUXE, SUITE, EXECUTIVE)
- `status` (string): Current room status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- `guestName` (string|null): Name of current guest if occupied

**Room Status Values:**
- `AVAILABLE`: Room ready for new booking
- `OCCUPIED`: Guest currently checked in
- `RESERVED`: Room booked but guest not arrived
- `MAINTENANCE`: Room under repair/cleaning

### Get Available Rooms
Retrieves rooms available for specific date range.

```http
GET /rooms/available?checkIn=2024-10-25&checkOut=2024-10-27
```

**Query Parameters:**
- `checkIn` (string): Check-in date (YYYY-MM-DD format)
- `checkOut` (string): Check-out date (YYYY-MM-DD format)

**Response:**
```json
[
  {
    "roomId": 101,
    "roomNumber": "101",
    "roomType": "STANDARD",
    "nightlyRate": 150.00,
    "amenities": "WiFi, TV, AC"
  }
]
```

## Revenue and Financial Endpoints

### Get Daily Revenue Data
Retrieves revenue data for the last 30 days.

```http
GET /revenue/daily
```

**Response:**
```json
[
  {
    "date": "10/15",
    "revenue": 8500.00
  },
  {
    "date": "10/16",
    "revenue": 9200.00
  }
]
```

**Response Fields:**
- `date` (string): Date in MM/DD format
- `revenue` (number): Total revenue for that date

### Get Financial Metrics
Retrieves comprehensive financial analytics.

```http
GET /analytics/financial
```

**Response:**
```json
{
  "totalRevenue": 245000.00,
  "revpar": 208.50,
  "adr": 245.00,
  "occupancyRate": 85.2
}
```

**Response Fields:**
- `totalRevenue` (number): Total revenue for period
- `revpar` (number): Revenue Per Available Room
- `adr` (number): Average Daily Rate
- `occupancyRate` (number): Occupancy percentage

**Calculations:**
- **RevPAR**: Total Room Revenue ÷ Total Available Rooms
- **ADR**: Total Room Revenue ÷ Total Occupied Rooms
- **Occupancy Rate**: Occupied Rooms ÷ Available Rooms × 100

## Reservation Endpoints

### Create Reservation
Creates a new reservation in the system.

```http
POST /reservations
Content-Type: application/json

{
  "guestId": 1001,
  "roomId": 101,
  "checkIn": "2024-10-25",
  "checkOut": "2024-10-27"
}
```

**Request Body:**
- `guestId` (number): Existing guest ID
- `roomId` (number): Room to reserve
- `checkIn` (string): Check-in date (YYYY-MM-DD)
- `checkOut` (string): Check-out date (YYYY-MM-DD)

**Response:**
```json
{
  "reservationId": 301,
  "status": "CONFIRMED",
  "totalAmount": 300.00
}
```

**Business Logic:**
1. Validates room availability for date range
2. Calls Oracle PL/SQL `create_reservation` procedure
3. Updates room status to RESERVED
4. Returns new reservation ID

**Error Responses:**
```json
{
  "error": "Room not available for selected dates",
  "code": "ROOM_UNAVAILABLE"
}
```

### Update Reservation Status
Updates reservation status (check-in, check-out, cancel).

```http
PUT /reservations/:id/status
Content-Type: application/json

{
  "status": "CHECKED_IN",
  "paymentMethod": "CREDIT_CARD"
}
```

**Path Parameters:**
- `id` (number): Reservation ID

**Request Body:**
- `status` (string): New status (CHECKED_IN, CHECKED_OUT, CANCELLED)
- `paymentMethod` (string): Payment method for check-out

**Status Transitions:**
- `CONFIRMED` → `CHECKED_IN` (Guest arrives)
- `CHECKED_IN` → `CHECKED_OUT` (Guest departs)
- `CONFIRMED` → `CANCELLED` (Booking cancelled)

## Analytics Endpoints

### Get Guest Analytics
Retrieves guest segmentation and behavior data.

```http
GET /analytics/guests
```

**Response:**
```json
[
  {
    "name": "Business",
    "value": 45,
    "revenue": 125000,
    "color": "#3B82F6"
  },
  {
    "name": "Leisure",
    "value": 35,
    "revenue": 89000,
    "color": "#10B981"
  }
]
```

**Response Fields:**
- `name` (string): Guest segment name
- `value` (number): Percentage of total guests
- `revenue` (number): Revenue from this segment
- `color` (string): Chart color code

### Get Booking Forecast
Retrieves predictive booking data for next 30 days.

```http
GET /analytics/forecast
```

**Response:**
```json
[
  {
    "date": "2024-10-25",
    "occupancy": 78.5,
    "confidenceLower": 65.0,
    "confidenceUpper": 85.0
  }
]
```

**Response Fields:**
- `date` (string): Forecast date
- `occupancy` (number): Predicted occupancy percentage
- `confidenceLower` (number): Lower confidence bound
- `confidenceUpper` (number): Upper confidence bound

### Get Service Analytics
Retrieves data about additional services usage.

```http
GET /analytics/services
```

**Response:**
```json
[
  {
    "serviceName": "Room Service",
    "usage": 156,
    "revenue": 12450.00,
    "trend": 8.2
  }
]
```

## Payment Endpoints

### Get Payment Analytics
Retrieves payment method distribution and trends.

```http
GET /analytics/payments
```

**Response:**
```json
{
  "methods": [
    {
      "method": "CREDIT_CARD",
      "percentage": 65.5,
      "amount": 89500.00
    },
    {
      "method": "CASH",
      "percentage": 25.0,
      "amount": 34200.00
    }
  ],
  "totalProcessed": 123700.00,
  "pendingPayments": 5
}
```

### Process Payment
Processes payment for a reservation.

```http
POST /payments
Content-Type: application/json

{
  "reservationId": 301,
  "amount": 300.00,
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TXN_123456789"
}
```

**Request Body:**
- `reservationId` (number): Associated reservation
- `amount` (number): Payment amount
- `paymentMethod` (string): Payment method
- `transactionId` (string): External transaction reference

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-10-24T10:30:00Z",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes
- `ROOM_UNAVAILABLE`: Room not available for booking
- `GUEST_NOT_FOUND`: Guest ID does not exist
- `INVALID_DATE_RANGE`: Check-out date before check-in date
- `PAYMENT_FAILED`: Payment processing error
- `DATABASE_ERROR`: Database operation failed
- `VALIDATION_ERROR`: Request validation failed

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

### Current Limits
- **Dashboard endpoints**: 100 requests per minute
- **Reservation endpoints**: 50 requests per minute
- **Analytics endpoints**: 200 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635123456
```

## Authentication

### Login Endpoint
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "MANAGER"
  }
}
```

### Protected Endpoints
All API endpoints require authentication. Include the token in requests:

```http
Authorization: Bearer jwt_token_here
```

## Database Procedures Called

### Core Procedures
- `create_reservation()`: Creates new booking
- `check_in_guest()`: Processes guest arrival
- `check_out_guest()`: Processes guest departure
- `calculate_total_cost()`: Computes reservation total

### Utility Functions
- `is_operation_restricted()`: Checks business hours
- `get_available_rooms()`: Returns available rooms
- `daily_occupancy_report()`: Generates occupancy report

## Testing Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-10-24T10:30:00Z"
}
```

### Database Test
```http
GET /test/database
```

Tests database connectivity and returns sample data.

---

*This API reference provides complete documentation for all endpoints in the Smart Hotel Booking Engine. For additional support, refer to the main project documentation.*