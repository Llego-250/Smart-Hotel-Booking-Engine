# Smart Hotel Booking Engine - Business Process Documentation

## Overview

This document outlines the complete business processes implemented in the Smart Hotel Booking Engine, covering guest management, reservation lifecycle, payment processing, and operational workflows.

## Business Process Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Guest Mgmt    │    │  Reservation    │    │   Payment       │
│   Processes     │◄──►│   Lifecycle     │◄──►│   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Room Mgmt     │    │   Service       │    │   Reporting     │
│   Operations    │    │   Management    │    │   & Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Business Processes

### 1. Guest Registration Process

#### Process Flow
```
Guest Inquiry → Guest Registration → Profile Creation → Verification → System Entry
```

#### Detailed Steps

**1.1 Guest Information Capture**
- Collect personal information (name, contact details)
- Validate email format and uniqueness
- Optional: Date of birth, address
- Generate unique guest ID

**1.2 Data Validation**
```sql
-- Email validation constraint
CONSTRAINT chk_guest_email CHECK (
    REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
)
```

**1.3 Profile Creation**
```sql
INSERT INTO GUEST (
    guest_id, first_name, last_name, email, phone, address, date_of_birth
) VALUES (
    seq_guest_id.NEXTVAL, :first_name, :last_name, :email, :phone, :address, :dob
);
```

**Business Rules:**
- Email addresses must be unique across all guests
- Phone numbers are optional but recommended
- Guest profiles are permanent (soft delete only)
- All guest data changes are audited

### 2. Room Availability and Booking Process

#### Process Flow
```
Availability Check → Room Selection → Reservation Creation → Confirmation → Payment
```

#### 2.1 Room Availability Check

**Input Parameters:**
- Check-in date
- Check-out date
- Room type preference (optional)
- Number of guests

**Availability Logic:**
```sql
CREATE OR REPLACE FUNCTION get_available_rooms(
    p_check_in DATE,
    p_check_out DATE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT r.room_id, r.room_number, r.room_type, r.nightly_rate, r.amenities
        FROM ROOM r
        WHERE r.status = 'AVAILABLE'
        AND r.room_id NOT IN (
            SELECT res.room_id
            FROM RESERVATION res
            WHERE res.status IN ('CONFIRMED', 'CHECKED_IN')
            AND NOT (res.check_out_date <= p_check_in OR res.check_in_date >= p_check_out)
        )
        ORDER BY r.room_type, r.nightly_rate;
    RETURN v_cursor;
END;
```

#### 2.2 Reservation Creation Process

**Prerequisites:**
- Valid guest ID
- Available room for requested dates
- Valid date range (check-out > check-in)

**Process Steps:**
1. Validate guest exists
2. Verify room availability
3. Check date constraints
4. Create reservation record
5. Update room status
6. Generate confirmation

```sql
CREATE OR REPLACE PROCEDURE create_reservation(
    p_guest_id IN NUMBER,
    p_room_id IN NUMBER,
    p_check_in IN DATE,
    p_check_out IN DATE,
    p_reservation_id OUT NUMBER
)
IS
    v_room_status VARCHAR2(20);
BEGIN
    -- Validation logic
    SELECT status INTO v_room_status FROM ROOM WHERE room_id = p_room_id;
    
    IF v_room_status != 'AVAILABLE' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Room not available');
    END IF;
    
    -- Create reservation
    INSERT INTO RESERVATION (
        reservation_id, guest_id, room_id, check_in_date, check_out_date, status
    ) VALUES (
        seq_reservation_id.NEXTVAL, p_guest_id, p_room_id, p_check_in, p_check_out, 'CONFIRMED'
    ) RETURNING reservation_id INTO p_reservation_id;
    
    -- Update room status
    UPDATE ROOM SET status = 'RESERVED' WHERE room_id = p_room_id;
    
    COMMIT;
END;
```

**Business Rules:**
- Reservations can only be made for future dates
- Check-out date must be after check-in date
- Room must be available for entire date range
- No overlapping reservations allowed
- Reservation automatically expires if not checked in within 24 hours of check-in date

### 3. Check-in Process

#### Process Flow
```
Guest Arrival → Identity Verification → Reservation Lookup → Room Assignment → Key Card Issue → Check-in Complete
```

#### 3.1 Pre-Check-in Validation

**Validation Steps:**
1. Verify reservation exists and is confirmed
2. Check guest identity
3. Confirm check-in date
4. Verify room readiness

#### 3.2 Check-in Execution

```sql
CREATE OR REPLACE PROCEDURE check_in_guest(
    p_reservation_id IN NUMBER,
    p_staff_id IN NUMBER DEFAULT NULL
)
IS
    v_reservation_count NUMBER;
    v_current_status VARCHAR2(20);
    v_room_id NUMBER;
    v_check_in_date DATE;
BEGIN
    -- Validate reservation
    SELECT COUNT(*), status, room_id, check_in_date
    INTO v_reservation_count, v_current_status, v_room_id, v_check_in_date
    FROM RESERVATION
    WHERE reservation_id = p_reservation_id
    GROUP BY status, room_id, check_in_date;
    
    IF v_reservation_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'Reservation not found');
    END IF;
    
    IF v_current_status != 'CONFIRMED' THEN
        RAISE_APPLICATION_ERROR(-20008, 'Reservation not in confirmed status');
    END IF;
    
    -- Update reservation and room status
    UPDATE RESERVATION 
    SET status = 'CHECKED_IN', staff_id = p_staff_id
    WHERE reservation_id = p_reservation_id;
    
    UPDATE ROOM SET status = 'OCCUPIED' WHERE room_id = v_room_id;
    
    COMMIT;
END;
```

**Business Rules:**
- Check-in allowed from 3:00 PM on check-in date
- Early check-in subject to room availability
- Guest must present valid identification
- Staff member must be assigned to check-in process
- Room status automatically updated to OCCUPIED

### 4. Service Management Process

#### 4.1 Service Catalog Management

**Service Categories:**
- Room Service (dining, beverages)
- Housekeeping (laundry, cleaning)
- Concierge (transportation, tickets)
- Spa & Wellness
- Business Services

**Service Definition:**
```sql
CREATE TABLE SERVICE (
    service_id NUMBER(10) PRIMARY KEY,
    service_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    price NUMBER(8,2) NOT NULL,
    category VARCHAR2(50),
    is_active CHAR(1) DEFAULT 'Y'
);
```

#### 4.2 Service Booking Process

**Process Flow:**
```
Service Request → Availability Check → Booking Confirmation → Service Delivery → Billing
```

**Service Booking Logic:**
```sql
INSERT INTO RESERVATION_SERVICE (
    reservation_id, service_id, quantity, unit_price, total_cost, service_date
) VALUES (
    :reservation_id, :service_id, :quantity, 
    (SELECT price FROM SERVICE WHERE service_id = :service_id),
    :quantity * (SELECT price FROM SERVICE WHERE service_id = :service_id),
    SYSDATE
);
```

### 5. Payment Processing Workflow

#### 5.1 Payment Methods Supported
- Cash payments
- Credit card transactions
- Debit card payments
- Bank transfers
- Corporate billing

#### 5.2 Payment Process Flow

```
Service Consumption → Cost Calculation → Payment Request → Payment Processing → Receipt Generation
```

#### 5.3 Cost Calculation Logic

```sql
CREATE OR REPLACE FUNCTION calculate_total_cost(p_reservation_id NUMBER)
RETURN NUMBER
IS
    v_room_cost NUMBER := 0;
    v_service_cost NUMBER := 0;
BEGIN
    -- Calculate room charges
    SELECT (r.check_out_date - r.check_in_date) * rm.nightly_rate
    INTO v_room_cost
    FROM RESERVATION r
    JOIN ROOM rm ON r.room_id = rm.room_id
    WHERE r.reservation_id = p_reservation_id;
    
    -- Calculate service charges
    SELECT NVL(SUM(rs.total_cost), 0)
    INTO v_service_cost
    FROM RESERVATION_SERVICE rs
    WHERE rs.reservation_id = p_reservation_id;
    
    RETURN v_room_cost + v_service_cost;
END;
```

#### 5.4 Payment Processing

```sql
CREATE OR REPLACE PROCEDURE process_payment(
    p_reservation_id IN NUMBER,
    p_amount IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_transaction_id IN VARCHAR2 DEFAULT NULL
)
IS
BEGIN
    INSERT INTO PAYMENT (
        payment_id, reservation_id, amount, payment_method, 
        transaction_id, status, payment_date
    ) VALUES (
        seq_payment_id.NEXTVAL, p_reservation_id, p_amount, p_payment_method,
        p_transaction_id, 'COMPLETED', SYSDATE
    );
    
    COMMIT;
END;
```

### 6. Check-out Process

#### Process Flow
```
Check-out Request → Final Bill Generation → Payment Processing → Room Inspection → Guest Departure
```

#### 6.1 Check-out Procedure

```sql
CREATE OR REPLACE PROCEDURE check_out_guest(
    p_reservation_id IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_staff_id IN NUMBER DEFAULT NULL
)
IS
    v_room_id NUMBER;
    v_total_amount NUMBER;
BEGIN
    -- Calculate final bill
    v_total_amount := calculate_total_cost(p_reservation_id);
    
    -- Update reservation
    UPDATE RESERVATION 
    SET status = 'CHECKED_OUT',
        total_amount = v_total_amount,
        staff_id = NVL(p_staff_id, staff_id)
    WHERE reservation_id = p_reservation_id
    RETURNING room_id INTO v_room_id;
    
    -- Process payment
    INSERT INTO PAYMENT (
        payment_id, reservation_id, amount, payment_method, status
    ) VALUES (
        seq_payment_id.NEXTVAL, p_reservation_id, v_total_amount, p_payment_method, 'COMPLETED'
    );
    
    -- Update room status
    UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = v_room_id;
    
    COMMIT;
END;
```

**Business Rules:**
- Check-out time is 11:00 AM
- Late check-out may incur additional charges
- Final bill includes all room and service charges
- Payment must be completed before departure
- Room status updated to AVAILABLE after inspection

### 7. Business Rules Engine

#### 7.1 Operational Hours Restrictions

**Weekend-Only Operations Rule:**
```sql
CREATE OR REPLACE FUNCTION is_operation_restricted
RETURN BOOLEAN
IS
    v_day_of_week NUMBER;
    v_holiday_count NUMBER;
BEGIN
    v_day_of_week := TO_NUMBER(TO_CHAR(SYSDATE, 'D'));
    
    -- Restrict operations on weekdays (Monday-Friday)
    IF v_day_of_week BETWEEN 2 AND 6 THEN
        RETURN TRUE;
    END IF;
    
    -- Check for holidays
    SELECT COUNT(*) INTO v_holiday_count
    FROM HOLIDAYS
    WHERE holiday_date = TRUNC(SYSDATE) AND is_active = 'Y';
    
    RETURN v_holiday_count > 0;
END;
```

**Implementation Trigger:**
```sql
CREATE OR REPLACE TRIGGER trg_business_hours_check
    BEFORE INSERT OR UPDATE OR DELETE ON RESERVATION
    FOR EACH ROW
BEGIN
    IF is_operation_restricted() THEN
        RAISE_APPLICATION_ERROR(-20020, 'Operations restricted during weekdays and holidays');
    END IF;
END;
```

#### 7.2 Data Integrity Rules

**Reservation Date Validation:**
```sql
CREATE OR REPLACE TRIGGER trg_reservation_validation
    BEFORE INSERT OR UPDATE ON RESERVATION
    FOR EACH ROW
BEGIN
    -- Check date logic
    IF :NEW.check_out_date <= :NEW.check_in_date THEN
        RAISE_APPLICATION_ERROR(-20021, 'Check-out date must be after check-in date');
    END IF;
    
    -- Prevent past date reservations
    IF :NEW.check_in_date < TRUNC(SYSDATE) AND INSERTING THEN
        RAISE_APPLICATION_ERROR(-20022, 'Cannot create reservation for past dates');
    END IF;
END;
```

### 8. Reporting and Analytics Processes

#### 8.1 Daily Operations Report

```sql
CREATE OR REPLACE PROCEDURE daily_occupancy_report(p_date DATE DEFAULT SYSDATE)
IS
    v_total_rooms NUMBER;
    v_occupied_rooms NUMBER;
    v_reserved_rooms NUMBER;
    v_available_rooms NUMBER;
    v_occupancy_rate NUMBER;
    v_daily_revenue NUMBER;
BEGIN
    -- Calculate room statistics
    SELECT COUNT(*) INTO v_total_rooms FROM ROOM WHERE status != 'MAINTENANCE';
    SELECT COUNT(*) INTO v_occupied_rooms FROM ROOM WHERE status = 'OCCUPIED';
    SELECT COUNT(*) INTO v_reserved_rooms FROM ROOM WHERE status = 'RESERVED';
    v_available_rooms := v_total_rooms - v_occupied_rooms - v_reserved_rooms;
    v_occupancy_rate := ROUND((v_occupied_rooms / v_total_rooms) * 100, 2);
    
    -- Calculate daily revenue
    SELECT NVL(SUM(amount), 0) INTO v_daily_revenue
    FROM PAYMENT
    WHERE TRUNC(payment_date) = TRUNC(p_date);
    
    -- Generate report
    DBMS_OUTPUT.PUT_LINE('=== DAILY OPERATIONS REPORT ===');
    DBMS_OUTPUT.PUT_LINE('Date: ' || TO_CHAR(p_date, 'DD-MON-YYYY'));
    DBMS_OUTPUT.PUT_LINE('Total Rooms: ' || v_total_rooms);
    DBMS_OUTPUT.PUT_LINE('Occupied: ' || v_occupied_rooms);
    DBMS_OUTPUT.PUT_LINE('Reserved: ' || v_reserved_rooms);
    DBMS_OUTPUT.PUT_LINE('Available: ' || v_available_rooms);
    DBMS_OUTPUT.PUT_LINE('Occupancy Rate: ' || v_occupancy_rate || '%');
    DBMS_OUTPUT.PUT_LINE('Daily Revenue: $' || v_daily_revenue);
END;
```

#### 8.2 Financial Analytics

**Revenue Analysis Query:**
```sql
SELECT 
    TO_CHAR(payment_date, 'YYYY-MM') as month,
    payment_method,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as average_transaction
FROM PAYMENT
WHERE payment_date >= ADD_MONTHS(SYSDATE, -12)
GROUP BY TO_CHAR(payment_date, 'YYYY-MM'), payment_method
ORDER BY month, payment_method;
```

**Guest Analytics Query:**
```sql
SELECT 
    g.guest_id,
    g.first_name || ' ' || g.last_name as guest_name,
    COUNT(r.reservation_id) as total_stays,
    SUM(r.total_amount) as total_spent,
    AVG(r.total_amount) as average_spend,
    MAX(r.check_out_date) as last_visit
FROM GUEST g
JOIN RESERVATION r ON g.guest_id = r.guest_id
WHERE r.status = 'CHECKED_OUT'
GROUP BY g.guest_id, g.first_name, g.last_name
HAVING COUNT(r.reservation_id) > 1
ORDER BY total_spent DESC;
```

### 9. Exception Handling Processes

#### 9.1 Cancellation Process

**Cancellation Rules:**
- Free cancellation up to 24 hours before check-in
- 50% charge for same-day cancellations
- No refund for no-shows

```sql
CREATE OR REPLACE PROCEDURE cancel_reservation(
    p_reservation_id IN NUMBER,
    p_cancellation_reason IN VARCHAR2 DEFAULT NULL
)
IS
    v_check_in_date DATE;
    v_total_amount NUMBER;
    v_refund_amount NUMBER;
BEGIN
    SELECT check_in_date, NVL(total_amount, 0)
    INTO v_check_in_date, v_total_amount
    FROM RESERVATION
    WHERE reservation_id = p_reservation_id;
    
    -- Calculate refund based on cancellation policy
    IF SYSDATE < v_check_in_date - 1 THEN
        v_refund_amount := v_total_amount; -- Full refund
    ELSIF SYSDATE < v_check_in_date THEN
        v_refund_amount := v_total_amount * 0.5; -- 50% refund
    ELSE
        v_refund_amount := 0; -- No refund
    END IF;
    
    -- Update reservation
    UPDATE RESERVATION 
    SET status = 'CANCELLED',
        special_requests = NVL(special_requests, '') || ' | Cancelled: ' || p_cancellation_reason
    WHERE reservation_id = p_reservation_id;
    
    -- Process refund if applicable
    IF v_refund_amount > 0 THEN
        INSERT INTO PAYMENT (
            payment_id, reservation_id, amount, payment_method, status
        ) VALUES (
            seq_payment_id.NEXTVAL, p_reservation_id, -v_refund_amount, 'REFUND', 'COMPLETED'
        );
    END IF;
    
    COMMIT;
END;
```

#### 9.2 No-Show Handling

```sql
CREATE OR REPLACE PROCEDURE process_no_shows
IS
    CURSOR no_show_cursor IS
        SELECT reservation_id, room_id
        FROM RESERVATION
        WHERE status = 'CONFIRMED'
        AND check_in_date < SYSDATE - 1; -- 24 hours past check-in
BEGIN
    FOR rec IN no_show_cursor LOOP
        -- Mark as no-show
        UPDATE RESERVATION 
        SET status = 'CANCELLED',
            special_requests = NVL(special_requests, '') || ' | No-show'
        WHERE reservation_id = rec.reservation_id;
        
        -- Release room
        UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = rec.room_id;
    END LOOP;
    
    COMMIT;
END;
```

### 10. Audit and Compliance Processes

#### 10.1 Audit Trail Implementation

```sql
CREATE OR REPLACE TRIGGER trg_audit_all_tables
    AFTER INSERT OR UPDATE OR DELETE ON RESERVATION
    FOR EACH ROW
DECLARE
    v_operation VARCHAR2(10);
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    -- Determine operation
    IF INSERTING THEN
        v_operation := 'INSERT';
        v_new_values := 'reservation_id:' || :NEW.reservation_id || 
                       ',guest_id:' || :NEW.guest_id || 
                       ',status:' || :NEW.status;
    ELSIF UPDATING THEN
        v_operation := 'UPDATE';
        v_old_values := 'status:' || :OLD.status || ',total_amount:' || :OLD.total_amount;
        v_new_values := 'status:' || :NEW.status || ',total_amount:' || :NEW.total_amount;
    ELSIF DELETING THEN
        v_operation := 'DELETE';
        v_old_values := 'reservation_id:' || :OLD.reservation_id;
    END IF;
    
    -- Log audit record
    INSERT INTO AUDIT_LOG (
        audit_id, table_name, operation, user_name, old_values, new_values
    ) VALUES (
        seq_audit_id.NEXTVAL, 'RESERVATION', v_operation, USER, v_old_values, v_new_values
    );
END;
```

#### 10.2 Compliance Reporting

**Data Retention Policy:**
```sql
-- Archive old records (run monthly)
CREATE OR REPLACE PROCEDURE archive_old_data
IS
BEGIN
    -- Archive audit logs older than 2 years
    DELETE FROM AUDIT_LOG 
    WHERE operation_date < ADD_MONTHS(SYSDATE, -24);
    
    -- Archive completed reservations older than 5 years
    DELETE FROM RESERVATION 
    WHERE status = 'CHECKED_OUT' 
    AND check_out_date < ADD_MONTHS(SYSDATE, -60);
    
    COMMIT;
END;
```

## Process Integration Points

### 1. External System Integration

**Payment Gateway Integration:**
- Credit card processing
- Real-time transaction validation
- Fraud detection
- PCI compliance

**Property Management System:**
- Room status synchronization
- Maintenance scheduling
- Housekeeping coordination

**Channel Manager Integration:**
- Online travel agency bookings
- Rate distribution
- Inventory synchronization

### 2. Business Intelligence Integration

**Data Warehouse ETL:**
```sql
-- Daily ETL process for BI
CREATE OR REPLACE PROCEDURE daily_bi_extract
IS
BEGIN
    -- Extract daily metrics
    INSERT INTO BI_DAILY_METRICS (
        report_date, occupancy_rate, daily_revenue, 
        total_reservations, average_daily_rate
    )
    SELECT 
        TRUNC(SYSDATE),
        ROUND((SELECT COUNT(*) FROM ROOM WHERE status = 'OCCUPIED') * 100.0 / 
              (SELECT COUNT(*) FROM ROOM WHERE status != 'MAINTENANCE'), 2),
        (SELECT NVL(SUM(amount), 0) FROM PAYMENT WHERE TRUNC(payment_date) = TRUNC(SYSDATE)),
        (SELECT COUNT(*) FROM RESERVATION WHERE TRUNC(reservation_date) = TRUNC(SYSDATE)),
        (SELECT AVG(total_amount) FROM RESERVATION WHERE status = 'CHECKED_OUT' 
         AND TRUNC(check_out_date) = TRUNC(SYSDATE))
    FROM DUAL;
    
    COMMIT;
END;
```

## Performance Optimization

### 1. Process Optimization

**Batch Processing:**
- Nightly batch jobs for reporting
- Automated no-show processing
- Bulk data archival

**Caching Strategy:**
- Room availability caching
- Rate calculation caching
- Guest profile caching

### 2. Database Optimization

**Index Strategy:**
```sql
-- Performance indexes for business processes
CREATE INDEX idx_reservation_checkin_status ON RESERVATION(check_in_date, status);
CREATE INDEX idx_payment_date_method ON PAYMENT(payment_date, payment_method);
CREATE INDEX idx_room_status_type ON ROOM(status, room_type);
```

---

*This business process documentation provides a comprehensive overview of all operational workflows in the Smart Hotel Booking Engine, ensuring consistent and efficient hotel management operations.*