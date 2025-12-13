-- Smart Hotel Booking Engine - Deployment Script for SHBE_db
-- Connect as pdb_admin to SHBE_db

-- Drop existing objects if they exist (for clean deployment)
BEGIN
    FOR c IN (SELECT table_name FROM user_tables WHERE table_name IN ('AUDIT_LOG','HOLIDAYS','PAYMENT','RESERVATION_SERVICE','RESERVATION','SERVICE','ROOM','STAFF','GUEST')) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || c.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- Create tables
CREATE TABLE GUEST (
    guest_id NUMBER(10) PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    phone VARCHAR2(20),
    address VARCHAR2(200),
    date_of_birth DATE,
    created_date DATE DEFAULT SYSDATE,
    CONSTRAINT chk_email_format CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
);

CREATE TABLE ROOM (
    room_id NUMBER(10) PRIMARY KEY,
    room_number VARCHAR2(10) UNIQUE NOT NULL,
    room_type VARCHAR2(20) NOT NULL,
    capacity NUMBER(2) NOT NULL,
    nightly_rate NUMBER(8,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'AVAILABLE',
    floor_number NUMBER(2),
    amenities VARCHAR2(500),
    CONSTRAINT chk_room_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    CONSTRAINT chk_positive_rate CHECK (nightly_rate > 0),
    CONSTRAINT chk_positive_capacity CHECK (capacity > 0)
);

CREATE TABLE STAFF (
    staff_id NUMBER(10) PRIMARY KEY,
    first_name VARCHAR2(50) NOT NULL,
    last_name VARCHAR2(50) NOT NULL,
    role VARCHAR2(30) NOT NULL,
    email VARCHAR2(100) UNIQUE,
    hire_date DATE DEFAULT SYSDATE,
    salary NUMBER(10,2),
    CONSTRAINT chk_staff_role CHECK (role IN ('CLERK', 'CASHIER', 'MANAGER', 'HOUSEKEEPING'))
);

CREATE TABLE RESERVATION (
    reservation_id NUMBER(10) PRIMARY KEY,
    guest_id NUMBER(10) NOT NULL,
    room_id NUMBER(10) NOT NULL,
    staff_id NUMBER(10),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    reservation_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'CONFIRMED',
    total_amount NUMBER(10,2),
    special_requests VARCHAR2(500),
    CONSTRAINT fk_res_guest FOREIGN KEY (guest_id) REFERENCES GUEST(guest_id),
    CONSTRAINT fk_res_room FOREIGN KEY (room_id) REFERENCES ROOM(room_id),
    CONSTRAINT fk_res_staff FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id),
    CONSTRAINT chk_res_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT chk_res_status CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'))
);

CREATE TABLE SERVICE (
    service_id NUMBER(10) PRIMARY KEY,
    service_name VARCHAR2(100) NOT NULL,
    service_type VARCHAR2(50) NOT NULL,
    price NUMBER(8,2) NOT NULL,
    description VARCHAR2(300),
    CONSTRAINT chk_positive_price CHECK (price >= 0)
);

CREATE TABLE RESERVATION_SERVICE (
    reservation_id NUMBER(10),
    service_id NUMBER(10),
    quantity NUMBER(3) DEFAULT 1,
    service_date DATE DEFAULT SYSDATE,
    total_cost NUMBER(8,2),
    PRIMARY KEY (reservation_id, service_id),
    CONSTRAINT fk_rs_reservation FOREIGN KEY (reservation_id) REFERENCES RESERVATION(reservation_id),
    CONSTRAINT fk_rs_service FOREIGN KEY (service_id) REFERENCES SERVICE(service_id),
    CONSTRAINT chk_positive_quantity CHECK (quantity > 0)
);

CREATE TABLE PAYMENT (
    payment_id NUMBER(10) PRIMARY KEY,
    reservation_id NUMBER(10) NOT NULL,
    amount NUMBER(10,2) NOT NULL,
    payment_method VARCHAR2(20) NOT NULL,
    payment_date DATE DEFAULT SYSDATE,
    transaction_id VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'PENDING',
    CONSTRAINT fk_pay_reservation FOREIGN KEY (reservation_id) REFERENCES RESERVATION(reservation_id),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')),
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_positive_amount CHECK (amount > 0)
);

CREATE TABLE AUDIT_LOG (
    audit_id NUMBER(10) PRIMARY KEY,
    table_name VARCHAR2(50) NOT NULL,
    operation VARCHAR2(10) NOT NULL,
    user_name VARCHAR2(50) NOT NULL,
    operation_date DATE DEFAULT SYSDATE,
    old_values CLOB,
    new_values CLOB,
    ip_address VARCHAR2(50),
    status VARCHAR2(20) DEFAULT 'SUCCESS'
);

CREATE TABLE HOLIDAYS (
    holiday_date DATE PRIMARY KEY,
    holiday_name VARCHAR2(100) NOT NULL,
    is_active CHAR(1) DEFAULT 'Y'
);

SELECT 'Database setup complete!' AS status FROM dual;