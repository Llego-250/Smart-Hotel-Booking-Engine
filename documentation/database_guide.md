# Smart Hotel Booking Engine - Database Development Guide

## Overview

The database layer is built on Oracle Database using PL/SQL for business logic implementation. This guide covers the complete database architecture, stored procedures, triggers, and business rules.

## Database Architecture

### Schema Design Philosophy
- **Normalized Design**: Third normal form (3NF) compliance
- **Referential Integrity**: Foreign key constraints
- **Business Rule Enforcement**: Database triggers and constraints
- **Audit Trail**: Complete operation logging
- **Performance Optimization**: Strategic indexing

### Core Tables Structure

```sql
-- Primary business entities
GUEST (Customer information)
  ├── RESERVATION (Booking records)
      ├── PAYMENT (Financial transactions)
      └── RESERVATION_SERVICE (Additional services)
          └── SERVICE (Service catalog)

ROOM (Inventory management)
  └── RESERVATION (Room assignments)

STAFF (Employee information)
  └── RESERVATION (Staff assignments)

-- Supporting tables
AUDIT_LOG (System audit trail)
HOLIDAYS (Business calendar)
```

## Table Definitions

### GUEST Table
```sql
CREATE TABLE GUEST (
    guest_id NUMBER(10) CONSTRAINT pk_guest PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) CONSTRAINT uk_guest_email UNIQUE NOT NULL,
    phone VARCHAR2(20),
    address VARCHAR2(200),
    date_of_birth DATE,
    created_date DATE DEFAULT SYSDATE,
    
    -- Constraints
    CONSTRAINT chk_guest_email CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
);

-- Comments
COMMENT ON TABLE GUEST IS 'Guest information and contact details';
COMMENT ON COLUMN GUEST.guest_id IS 'Unique guest identifier';
COMMENT ON COLUMN GUEST.email IS 'Guest email address (unique)';
```

### ROOM Table
```sql
CREATE TABLE ROOM (
    room_id NUMBER(10) CONSTRAINT pk_room PRIMARY KEY,
    room_number VARCHAR2(10) CONSTRAINT uk_room_number UNIQUE NOT NULL,
    room_type VARCHAR2(20) NOT NULL,
    capacity NUMBER(2) NOT NULL,
    nightly_rate NUMBER(8,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'AVAILABLE',
    floor_number NUMBER(2),
    amenities VARCHAR2(500),
    created_date DATE DEFAULT SYSDATE,
    
    -- Constraints
    CONSTRAINT chk_room_type CHECK (room_type IN ('STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE')),
    CONSTRAINT chk_room_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    CONSTRAINT chk_room_capacity CHECK (capacity > 0),
    CONSTRAINT chk_room_rate CHECK (nightly_rate > 0)
);

-- Comments
COMMENT ON TABLE ROOM IS 'Hotel room inventory and specifications';
COMMENT ON COLUMN ROOM.room_type IS 'Room category: STANDARD, DELUXE, SUITE, EXECUTIVE';
COMMENT ON COLUMN ROOM.status IS 'Current room status';
```

### RESERVATION Table
```sql
CREATE TABLE RESERVATION (
    reservation_id NUMBER(10) CONSTRAINT pk_reservation PRIMARY KEY,
    guest_id NUMBER(10) NOT NULL,
    room_id NUMBER(10) NOT NULL,
    staff_id NUMBER(10),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    reservation_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'CONFIRMED',
    total_amount NUMBER(10,2),
    special_requests VARCHAR2(500),
    
    -- Foreign Keys
    CONSTRAINT fk_reservation_guest FOREIGN KEY (guest_id) REFERENCES GUEST(guest_id),
    CONSTRAINT fk_reservation_room FOREIGN KEY (room_id) REFERENCES ROOM(room_id),
    CONSTRAINT fk_reservation_staff FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id),
    
    -- Constraints
    CONSTRAINT chk_reservation_status CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    CONSTRAINT chk_reservation_dates CHECK (check_out_date > check_in_date)
);

-- Comments
COMMENT ON TABLE RESERVATION IS 'Hotel booking reservations';
COMMENT ON COLUMN RESERVATION.status IS 'Reservation lifecycle status';
```

### PAYMENT Table
```sql
CREATE TABLE PAYMENT (
    payment_id NUMBER(10) CONSTRAINT pk_payment PRIMARY KEY,
    reservation_id NUMBER(10) NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    payment_method VARCHAR2(20) NOT NULL,
    payment_date DATE DEFAULT SYSDATE,
    transaction_id VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'PENDING',
    
    -- Foreign Keys
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) REFERENCES RESERVATION(reservation_id),
    
    -- Constraints
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')),
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'))
);
```

### SERVICE Table
```sql
CREATE TABLE SERVICE (
    service_id NUMBER(10) CONSTRAINT pk_service PRIMARY KEY,
    service_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    price NUMBER(8,2) NOT NULL,
    category VARCHAR2(50),
    is_active CHAR(1) DEFAULT 'Y',
    
    -- Constraints
    CONSTRAINT chk_service_price CHECK (price >= 0),
    CONSTRAINT chk_service_active CHECK (is_active IN ('Y', 'N'))
);
```

### RESERVATION_SERVICE Table
```sql
CREATE TABLE RESERVATION_SERVICE (
    reservation_id NUMBER(10),
    service_id NUMBER(10),
    quantity NUMBER(3) DEFAULT 1,
    unit_price NUMBER(8,2),
    total_cost NUMBER(10,2),
    service_date DATE DEFAULT SYSDATE,
    
    -- Composite Primary Key
    CONSTRAINT pk_reservation_service PRIMARY KEY (reservation_id, service_id),
    
    -- Foreign Keys
    CONSTRAINT fk_res_service_reservation FOREIGN KEY (reservation_id) REFERENCES RESERVATION(reservation_id),
    CONSTRAINT fk_res_service_service FOREIGN KEY (service_id) REFERENCES SERVICE(service_id),
    
    -- Constraints
    CONSTRAINT chk_res_service_quantity CHECK (quantity > 0),
    CONSTRAINT chk_res_service_price CHECK (unit_price >= 0)
);
```

### STAFF Table
```sql
CREATE TABLE STAFF (
    staff_id NUMBER(10) CONSTRAINT pk_staff PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) CONSTRAINT uk_staff_email UNIQUE,
    phone VARCHAR2(20),
    position VARCHAR2(50),
    department VARCHAR2(50),
    hire_date DATE DEFAULT SYSDATE,
    is_active CHAR(1) DEFAULT 'Y',
    
    -- Constraints
    CONSTRAINT chk_staff_active CHECK (is_active IN ('Y', 'N'))
);
```

### AUDIT_LOG Table
```sql
CREATE TABLE AUDIT_LOG (
    audit_id NUMBER(10) CONSTRAINT pk_audit_log PRIMARY KEY,
    table_name VARCHAR2(50) NOT NULL,
    operation VARCHAR2(10) NOT NULL,
    user_name VARCHAR2(50),
    operation_date DATE DEFAULT SYSDATE,
    old_values CLOB,
    new_values CLOB,
    
    -- Constraints
    CONSTRAINT chk_audit_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);
```

### HOLIDAYS Table
```sql
CREATE TABLE HOLIDAYS (
    holiday_date DATE CONSTRAINT pk_holidays PRIMARY KEY,
    holiday_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(200),
    is_active CHAR(1) DEFAULT 'Y',
    
    -- Constraints
    CONSTRAINT chk_holiday_active CHECK (is_active IN ('Y', 'N'))
);
```

## Sequences

```sql
-- Primary key sequences
CREATE SEQUENCE seq_guest_id START WITH 1001 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_room_id START WITH 101 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_staff_id START WITH 201 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_reservation_id START WITH 301 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_service_id START WITH 401 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_payment_id START WITH 501 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_audit_id START WITH 1 INCREMENT BY 1 NOCACHE;

-- Usage example
INSERT INTO GUEST (guest_id, first_name, last_name, email)
VALUES (seq_guest_id.NEXTVAL, 'John', 'Doe', 'john.doe@email.com');
```

## Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_guest_email ON GUEST(email);
CREATE INDEX idx_room_status ON ROOM(status);
CREATE INDEX idx_room_type ON ROOM(room_type);
CREATE INDEX idx_reservation_dates ON RESERVATION(check_in_date, check_out_date);
CREATE INDEX idx_reservation_status ON RESERVATION(status);
CREATE INDEX idx_payment_date ON PAYMENT(payment_date);
CREATE INDEX idx_payment_status ON PAYMENT(status);
CREATE INDEX idx_audit_date ON AUDIT_LOG(operation_date);
CREATE INDEX idx_audit_table ON AUDIT_LOG(table_name);

-- Composite indexes for common queries
CREATE INDEX idx_reservation_guest_room ON RESERVATION(guest_id, room_id);
CREATE INDEX idx_payment_reservation_date ON PAYMENT(reservation_id, payment_date);
```

## Core Functions

### Calculate Total Cost Function
```sql
CREATE OR REPLACE FUNCTION calculate_total_cost(p_reservation_id NUMBER)
RETURN NUMBER
IS
    v_room_cost NUMBER := 0;
    v_service_cost NUMBER := 0;
    v_total_cost NUMBER := 0;
BEGIN
    -- Calculate room cost
    SELECT (r.check_out_date - r.check_in_date) * rm.nightly_rate
    INTO v_room_cost
    FROM RESERVATION r
    JOIN ROOM rm ON r.room_id = rm.room_id
    WHERE r.reservation_id = p_reservation_id;
    
    -- Calculate service cost
    SELECT NVL(SUM(rs.total_cost), 0)
    INTO v_service_cost
    FROM RESERVATION_SERVICE rs
    WHERE rs.reservation_id = p_reservation_id;
    
    v_total_cost := v_room_cost + v_service_cost;
    
    RETURN v_total_cost;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN 
        RETURN 0;
    WHEN OTHERS THEN 
        RAISE_APPLICATION_ERROR(-20001, 'Error calculating total cost: ' || SQLERRM);
END calculate_total_cost;
/
```

### Business Hours Validation Function
```sql
CREATE OR REPLACE FUNCTION is_operation_restricted
RETURN BOOLEAN
IS
    v_day_of_week NUMBER;
    v_holiday_count NUMBER;
BEGIN
    -- Get day of week (1=Sunday, 2=Monday, ..., 7=Saturday)
    v_day_of_week := TO_NUMBER(TO_CHAR(SYSDATE, 'D'));
    
    -- Check if it's a weekday (Monday-Friday)
    IF v_day_of_week BETWEEN 2 AND 6 THEN
        RETURN TRUE; -- Operations restricted on weekdays
    END IF;
    
    -- Check if it's a holiday
    SELECT COUNT(*)
    INTO v_holiday_count
    FROM HOLIDAYS
    WHERE holiday_date = TRUNC(SYSDATE) 
    AND is_active = 'Y';
    
    RETURN v_holiday_count > 0; -- Operations restricted on holidays
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE; -- Allow operations if check fails
END is_operation_restricted;
/
```

### Room Availability Function
```sql
CREATE OR REPLACE FUNCTION get_available_rooms(
    p_check_in DATE,
    p_check_out DATE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT r.room_id, 
               r.room_number, 
               r.room_type, 
               r.nightly_rate, 
               r.amenities,
               r.capacity
        FROM ROOM r
        WHERE r.status = 'AVAILABLE'
        AND r.room_id NOT IN (
            SELECT res.room_id
            FROM RESERVATION res
            WHERE res.status IN ('CONFIRMED', 'CHECKED_IN')
            AND NOT (res.check_out_date <= p_check_in OR res.check_in_date >= p_check_out)
        )
        ORDER BY r.room_number;
    
    RETURN v_cursor;
END get_available_rooms;
/
```

## Core Procedures

### Create Reservation Procedure
```sql
CREATE OR REPLACE PROCEDURE create_reservation(
    p_guest_id IN NUMBER,
    p_room_id IN NUMBER,
    p_check_in IN DATE,
    p_check_out IN DATE,
    p_staff_id IN NUMBER DEFAULT NULL,
    p_special_requests IN VARCHAR2 DEFAULT NULL,
    p_reservation_id OUT NUMBER
)
IS
    v_room_status VARCHAR2(20);
    v_guest_count NUMBER;
    v_room_count NUMBER;
BEGIN
    -- Validate input parameters
    IF p_guest_id IS NULL OR p_room_id IS NULL OR p_check_in IS NULL OR p_check_out IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Required parameters cannot be null');
    END IF;
    
    IF p_check_out <= p_check_in THEN
        RAISE_APPLICATION_ERROR(-20002, 'Check-out date must be after check-in date');
    END IF;
    
    -- Check if guest exists
    SELECT COUNT(*) INTO v_guest_count FROM GUEST WHERE guest_id = p_guest_id;
    IF v_guest_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Guest not found');
    END IF;
    
    -- Check if room exists and is available
    SELECT COUNT(*) INTO v_room_count FROM ROOM WHERE room_id = p_room_id;
    IF v_room_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Room not found');
    END IF;
    
    SELECT status INTO v_room_status FROM ROOM WHERE room_id = p_room_id;
    IF v_room_status != 'AVAILABLE' THEN
        RAISE_APPLICATION_ERROR(-20005, 'Room not available for booking');
    END IF;
    
    -- Check for conflicting reservations
    SELECT COUNT(*) INTO v_room_count
    FROM RESERVATION
    WHERE room_id = p_room_id
    AND status IN ('CONFIRMED', 'CHECKED_IN')
    AND NOT (check_out_date <= p_check_in OR check_in_date >= p_check_out);
    
    IF v_room_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Room has conflicting reservations');
    END IF;
    
    -- Create reservation
    INSERT INTO RESERVATION (
        reservation_id, guest_id, room_id, staff_id,
        check_in_date, check_out_date, status, special_requests
    ) VALUES (
        seq_reservation_id.NEXTVAL, p_guest_id, p_room_id, p_staff_id,
        p_check_in, p_check_out, 'CONFIRMED', p_special_requests
    ) RETURNING reservation_id INTO p_reservation_id;
    
    -- Update room status
    UPDATE ROOM SET status = 'RESERVED' WHERE room_id = p_room_id;
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_reservation;
/
```

### Check-in Procedure
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
    -- Validate reservation exists
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
    
    -- Check if check-in date is today or past
    IF TRUNC(v_check_in_date) > TRUNC(SYSDATE) THEN
        RAISE_APPLICATION_ERROR(-20009, 'Cannot check in before reservation date');
    END IF;
    
    -- Update reservation status
    UPDATE RESERVATION 
    SET status = 'CHECKED_IN',
        staff_id = NVL(p_staff_id, staff_id)
    WHERE reservation_id = p_reservation_id;
    
    -- Update room status
    UPDATE ROOM SET status = 'OCCUPIED' WHERE room_id = v_room_id;
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END check_in_guest;
/
```

### Check-out Procedure
```sql
CREATE OR REPLACE PROCEDURE check_out_guest(
    p_reservation_id IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_staff_id IN NUMBER DEFAULT NULL
)
IS
    v_room_id NUMBER;
    v_total_amount NUMBER;
    v_reservation_count NUMBER;
    v_current_status VARCHAR2(20);
BEGIN
    -- Validate inputs
    IF p_reservation_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20010, 'Reservation ID cannot be null');
    END IF;
    
    IF p_payment_method NOT IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER') THEN
        RAISE_APPLICATION_ERROR(-20011, 'Invalid payment method');
    END IF;
    
    -- Validate reservation
    SELECT COUNT(*), status, room_id
    INTO v_reservation_count, v_current_status, v_room_id
    FROM RESERVATION
    WHERE reservation_id = p_reservation_id
    GROUP BY status, room_id;
    
    IF v_reservation_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'Reservation not found');
    END IF;
    
    IF v_current_status != 'CHECKED_IN' THEN
        RAISE_APPLICATION_ERROR(-20013, 'Guest not checked in');
    END IF;
    
    -- Calculate total cost
    v_total_amount := calculate_total_cost(p_reservation_id);
    
    -- Update reservation
    UPDATE RESERVATION 
    SET status = 'CHECKED_OUT',
        total_amount = v_total_amount,
        staff_id = NVL(p_staff_id, staff_id)
    WHERE reservation_id = p_reservation_id;
    
    -- Create payment record
    INSERT INTO PAYMENT (
        payment_id, reservation_id, amount, payment_method, status
    ) VALUES (
        seq_payment_id.NEXTVAL, p_reservation_id, v_total_amount, p_payment_method, 'COMPLETED'
    );
    
    -- Update room status
    UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = v_room_id;
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END check_out_guest;
/
```

### Reporting Procedures

```sql
CREATE OR REPLACE PROCEDURE daily_occupancy_report(p_date DATE DEFAULT SYSDATE)
IS
    v_total_rooms NUMBER;
    v_occupied_rooms NUMBER;
    v_reserved_rooms NUMBER;
    v_maintenance_rooms NUMBER;
    v_occupancy_rate NUMBER;
BEGIN
    -- Get room counts
    SELECT COUNT(*) INTO v_total_rooms FROM ROOM;
    
    SELECT COUNT(*) INTO v_occupied_rooms FROM ROOM WHERE status = 'OCCUPIED';
    
    SELECT COUNT(*) INTO v_reserved_rooms FROM ROOM WHERE status = 'RESERVED';
    
    SELECT COUNT(*) INTO v_maintenance_rooms FROM ROOM WHERE status = 'MAINTENANCE';
    
    -- Calculate occupancy rate
    v_occupancy_rate := ROUND((v_occupied_rooms / (v_total_rooms - v_maintenance_rooms)) * 100, 2);
    
    -- Output report
    DBMS_OUTPUT.PUT_LINE('=== DAILY OCCUPANCY REPORT FOR ' || TO_CHAR(p_date, 'DD-MON-YYYY') || ' ===');
    DBMS_OUTPUT.PUT_LINE('Total Rooms: ' || v_total_rooms);
    DBMS_OUTPUT.PUT_LINE('Occupied Rooms: ' || v_occupied_rooms);
    DBMS_OUTPUT.PUT_LINE('Reserved Rooms: ' || v_reserved_rooms);
    DBMS_OUTPUT.PUT_LINE('Maintenance Rooms: ' || v_maintenance_rooms);
    DBMS_OUTPUT.PUT_LINE('Available Rooms: ' || (v_total_rooms - v_occupied_rooms - v_reserved_rooms - v_maintenance_rooms));
    DBMS_OUTPUT.PUT_LINE('Occupancy Rate: ' || v_occupancy_rate || '%');
    DBMS_OUTPUT.PUT_LINE('===============================================');
END daily_occupancy_report;
/
```

## Triggers

### Audit Trail Trigger
```sql
CREATE OR REPLACE TRIGGER trg_audit_reservation
    AFTER INSERT OR UPDATE OR DELETE ON RESERVATION
    FOR EACH ROW
DECLARE
    v_operation VARCHAR2(10);
    v_old_values CLOB;
    v_new_values CLOB;
BEGIN
    -- Determine operation type
    IF INSERTING THEN
        v_operation := 'INSERT';
        v_new_values := 'reservation_id:' || :NEW.reservation_id || 
                       ',guest_id:' || :NEW.guest_id || 
                       ',room_id:' || :NEW.room_id || 
                       ',status:' || :NEW.status;
    ELSIF UPDATING THEN
        v_operation := 'UPDATE';
        v_old_values := 'reservation_id:' || :OLD.reservation_id || 
                       ',guest_id:' || :OLD.guest_id || 
                       ',room_id:' || :OLD.room_id || 
                       ',status:' || :OLD.status;
        v_new_values := 'reservation_id:' || :NEW.reservation_id || 
                       ',guest_id:' || :NEW.guest_id || 
                       ',room_id:' || :NEW.room_id || 
                       ',status:' || :NEW.status;
    ELSIF DELETING THEN
        v_operation := 'DELETE';
        v_old_values := 'reservation_id:' || :OLD.reservation_id || 
                       ',guest_id:' || :OLD.guest_id || 
                       ',room_id:' || :OLD.room_id || 
                       ',status:' || :OLD.status;
    END IF;
    
    -- Insert audit record
    INSERT INTO AUDIT_LOG (
        audit_id, table_name, operation, user_name, old_values, new_values
    ) VALUES (
        seq_audit_id.NEXTVAL, 'RESERVATION', v_operation, USER, v_old_values, v_new_values
    );
END;
/
```

### Business Rules Trigger
```sql
CREATE OR REPLACE TRIGGER trg_business_hours_check
    BEFORE INSERT OR UPDATE OR DELETE ON RESERVATION
    FOR EACH ROW
BEGIN
    -- Check if operations are restricted
    IF is_operation_restricted() THEN
        RAISE_APPLICATION_ERROR(-20020, 'Operations are restricted during weekdays and holidays');
    END IF;
END;
/
```

### Data Validation Trigger
```sql
CREATE OR REPLACE TRIGGER trg_reservation_validation
    BEFORE INSERT OR UPDATE ON RESERVATION
    FOR EACH ROW
BEGIN
    -- Validate dates
    IF :NEW.check_out_date <= :NEW.check_in_date THEN
        RAISE_APPLICATION_ERROR(-20021, 'Check-out date must be after check-in date');
    END IF;
    
    -- Validate future dates
    IF :NEW.check_in_date < TRUNC(SYSDATE) AND INSERTING THEN
        RAISE_APPLICATION_ERROR(-20022, 'Cannot create reservation for past dates');
    END IF;
    
    -- Set reservation date if not provided
    IF :NEW.reservation_date IS NULL THEN
        :NEW.reservation_date := SYSDATE;
    END IF;
END;
/
```

## Sample Data

```sql
-- Insert sample guests
INSERT INTO GUEST (guest_id, first_name, last_name, email, phone) VALUES
(seq_guest_id.NEXTVAL, 'John', 'Smith', 'john.smith@email.com', '+1-555-0101');

INSERT INTO GUEST (guest_id, first_name, last_name, email, phone) VALUES
(seq_guest_id.NEXTVAL, 'Jane', 'Doe', 'jane.doe@email.com', '+1-555-0102');

-- Insert sample rooms
INSERT INTO ROOM (room_id, room_number, room_type, capacity, nightly_rate, floor_number) VALUES
(seq_room_id.NEXTVAL, '101', 'STANDARD', 2, 150.00, 1);

INSERT INTO ROOM (room_id, room_number, room_type, capacity, nightly_rate, floor_number) VALUES
(seq_room_id.NEXTVAL, '201', 'DELUXE', 2, 250.00, 2);

-- Insert sample staff
INSERT INTO STAFF (staff_id, first_name, last_name, email, position, department) VALUES
(seq_staff_id.NEXTVAL, 'Alice', 'Johnson', 'alice.johnson@hotel.com', 'Front Desk Manager', 'Reception');

-- Insert sample services
INSERT INTO SERVICE (service_id, service_name, description, price, category) VALUES
(seq_service_id.NEXTVAL, 'Room Service', 'In-room dining service', 25.00, 'Dining');

INSERT INTO SERVICE (service_id, service_name, description, price, category) VALUES
(seq_service_id.NEXTVAL, 'Laundry', 'Laundry and dry cleaning', 15.00, 'Housekeeping');

-- Insert sample holidays
INSERT INTO HOLIDAYS (holiday_date, holiday_name, description) VALUES
(DATE '2024-12-25', 'Christmas Day', 'Christmas holiday');

INSERT INTO HOLIDAYS (holiday_date, holiday_name, description) VALUES
(DATE '2024-01-01', 'New Year Day', 'New Year holiday');
```

## Performance Tuning

### Query Optimization
```sql
-- Explain plan for complex queries
EXPLAIN PLAN FOR
SELECT r.reservation_id, g.first_name, g.last_name, rm.room_number
FROM RESERVATION r
JOIN GUEST g ON r.guest_id = g.guest_id
JOIN ROOM rm ON r.room_id = rm.room_id
WHERE r.check_in_date BETWEEN SYSDATE AND SYSDATE + 7;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

### Statistics Collection
```sql
-- Gather table statistics
BEGIN
    DBMS_STATS.GATHER_TABLE_STATS(
        ownname => USER,
        tabname => 'RESERVATION',
        estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE
    );
END;
/
```

## Backup and Recovery

### Export Schema
```bash
# Export entire schema
expdp username/password@database SCHEMAS=hotel_schema DIRECTORY=backup_dir DUMPFILE=hotel_backup.dmp

# Import schema
impdp username/password@database SCHEMAS=hotel_schema DIRECTORY=backup_dir DUMPFILE=hotel_backup.dmp
```

### Point-in-Time Recovery
```sql
-- Enable archivelog mode for point-in-time recovery
ALTER DATABASE ARCHIVELOG;

-- Create restore point
CREATE RESTORE POINT before_major_update;
```

## Testing Procedures

### Unit Testing
```sql
-- Test create_reservation procedure
DECLARE
    v_reservation_id NUMBER;
BEGIN
    create_reservation(
        p_guest_id => 1001,
        p_room_id => 101,
        p_check_in => SYSDATE + 1,
        p_check_out => SYSDATE + 3,
        p_reservation_id => v_reservation_id
    );
    
    DBMS_OUTPUT.PUT_LINE('Created reservation: ' || v_reservation_id);
END;
/
```

### Integration Testing
```sql
-- Test complete booking workflow
DECLARE
    v_reservation_id NUMBER;
    v_total_cost NUMBER;
BEGIN
    -- Create reservation
    create_reservation(1001, 101, SYSDATE + 1, SYSDATE + 3, v_reservation_id);
    
    -- Check in guest
    check_in_guest(v_reservation_id);
    
    -- Check out guest
    check_out_guest(v_reservation_id, 'CREDIT_CARD');
    
    -- Verify total cost
    v_total_cost := calculate_total_cost(v_reservation_id);
    DBMS_OUTPUT.PUT_LINE('Total cost: $' || v_total_cost);
END;
/
```

---

*This database guide provides comprehensive documentation for the Oracle PL/SQL implementation of the Smart Hotel Booking Engine database layer.*