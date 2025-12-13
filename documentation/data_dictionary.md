# Smart Hotel Booking Engine - Data Dictionary

## Tables Overview

| Table | Purpose | Primary Key | Foreign Keys |
|-------|---------|-------------|--------------|
| GUEST | Store guest information | guest_id | None |
| ROOM | Room inventory management | room_id | None |
| STAFF | Hotel staff information | staff_id | None |
| RESERVATION | Central booking entity | reservation_id | guest_id, room_id, staff_id |
| SERVICE | Additional hotel services | service_id | None |
| RESERVATION_SERVICE | Service bookings | reservation_id, service_id | reservation_id, service_id |
| PAYMENT | Payment processing | payment_id | reservation_id |
| AUDIT_LOG | System audit trail | audit_id | None |
| HOLIDAYS | Holiday management | holiday_date | None |

## Detailed Table Specifications

### GUEST Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| guest_id | NUMBER(10) | PK, NOT NULL | Unique guest identifier |
| first_name | VARCHAR2(50) | NOT NULL | Guest first name |
| last_name | VARCHAR2(50) | NOT NULL | Guest last name |
| email | VARCHAR2(100) | UNIQUE, NOT NULL, Email format | Contact email |
| phone | VARCHAR2(20) | | Contact phone |
| address | VARCHAR2(200) | | Guest address |
| date_of_birth | DATE | | Guest birth date |
| created_date | DATE | DEFAULT SYSDATE | Record creation date |

### ROOM Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| room_id | NUMBER(10) | PK, NOT NULL | Unique room identifier |
| room_number | VARCHAR2(10) | UNIQUE, NOT NULL | Room number |
| room_type | VARCHAR2(20) | NOT NULL | Room category |
| capacity | NUMBER(2) | NOT NULL, > 0 | Maximum occupancy |
| nightly_rate | NUMBER(8,2) | NOT NULL, > 0 | Rate per night |
| status | VARCHAR2(20) | CHECK constraint | Current room status |
| floor_number | NUMBER(2) | | Floor location |
| amenities | VARCHAR2(500) | | Room features |

### RESERVATION Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| reservation_id | NUMBER(10) | PK, NOT NULL | Unique booking identifier |
| guest_id | NUMBER(10) | FK to GUEST, NOT NULL | Guest reference |
| room_id | NUMBER(10) | FK to ROOM, NOT NULL | Room reference |
| staff_id | NUMBER(10) | FK to STAFF | Staff handling booking |
| check_in_date | DATE | NOT NULL | Arrival date |
| check_out_date | DATE | NOT NULL, > check_in_date | Departure date |
| reservation_date | DATE | DEFAULT SYSDATE | Booking creation date |
| status | VARCHAR2(20) | CHECK constraint | Reservation status |
| total_amount | NUMBER(10,2) | | Total cost |
| special_requests | VARCHAR2(500) | | Guest requests |

### PAYMENT Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| payment_id | NUMBER(10) | PK, NOT NULL | Unique payment identifier |
| reservation_id | NUMBER(10) | FK to RESERVATION, NOT NULL | Booking reference |
| amount | NUMBER(10,2) | NOT NULL, > 0 | Payment amount |
| payment_method | VARCHAR2(20) | CHECK constraint | Payment type |
| payment_date | DATE | DEFAULT SYSDATE | Transaction date |
| transaction_id | VARCHAR2(50) | | External transaction ID |
| status | VARCHAR2(20) | CHECK constraint | Payment status |

## Check Constraints

### Room Status Values
- AVAILABLE: Room ready for booking
- OCCUPIED: Guest currently checked in
- RESERVED: Room booked but guest not arrived
- MAINTENANCE: Room under repair

### Reservation Status Values
- CONFIRMED: Booking confirmed, awaiting arrival
- CHECKED_IN: Guest has arrived
- CHECKED_OUT: Guest has departed
- CANCELLED: Booking cancelled

### Payment Methods
- CASH: Cash payment
- CREDIT_CARD: Credit card transaction
- DEBIT_CARD: Debit card transaction
- BANK_TRANSFER: Bank wire transfer

### Payment Status Values
- PENDING: Payment initiated but not completed
- COMPLETED: Payment successfully processed
- FAILED: Payment transaction failed
- REFUNDED: Payment refunded to guest

## Sequences
- seq_guest_id: Starts at 1001
- seq_room_id: Starts at 101
- seq_staff_id: Starts at 201
- seq_reservation_id: Starts at 301
- seq_service_id: Starts at 401
- seq_payment_id: Starts at 501
- seq_audit_id: Starts at 1

## Indexes
- idx_guest_email: Performance for email lookups
- idx_room_status: Quick room availability queries
- idx_reservation_dates: Date range searches
- idx_payment_date: Payment reporting queries

## Business Rules
1. Employees cannot INSERT/UPDATE/DELETE on weekdays (Monday-Friday)
2. Operations blocked on public holidays
3. Room rates must be positive
4. Check-out date must be after check-in date
5. Email addresses must follow valid format
6. No double bookings allowed for same room/dates