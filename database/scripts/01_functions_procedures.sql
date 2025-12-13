-- Smart Hotel Booking Engine - Core Functions and Procedures

-- Function: Calculate total reservation cost
CREATE OR REPLACE FUNCTION calculate_total_cost(p_reservation_id NUMBER)
RETURN NUMBER
IS
    v_room_cost NUMBER := 0;
    v_service_cost NUMBER := 0;
BEGIN
    SELECT (r.check_out_date - r.check_in_date) * rm.nightly_rate
    INTO v_room_cost
    FROM RESERVATION r
    JOIN ROOM rm ON r.room_id = rm.room_id
    WHERE r.reservation_id = p_reservation_id;
    
    SELECT NVL(SUM(rs.total_cost), 0)
    INTO v_service_cost
    FROM RESERVATION_SERVICE rs
    WHERE rs.reservation_id = p_reservation_id;
    
    RETURN v_room_cost + v_service_cost;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 0;
    WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20001, 'Error: ' || SQLERRM);
END;
/

-- Function: Check if operation is restricted
CREATE OR REPLACE FUNCTION is_operation_restricted
RETURN BOOLEAN
IS
    v_day_of_week NUMBER;
    v_holiday_count NUMBER;
BEGIN
    v_day_of_week := TO_NUMBER(TO_CHAR(SYSDATE, 'D'));
    
    IF v_day_of_week BETWEEN 2 AND 6 THEN
        RETURN TRUE;
    END IF;
    
    SELECT COUNT(*) INTO v_holiday_count
    FROM HOLIDAYS
    WHERE holiday_date = TRUNC(SYSDATE) AND is_active = 'Y';
    
    RETURN v_holiday_count > 0;
END;
/

-- Procedure: Create new reservation
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
    SELECT status INTO v_room_status FROM ROOM WHERE room_id = p_room_id;
    
    IF v_room_status != 'AVAILABLE' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Room not available');
    END IF;
    
    INSERT INTO RESERVATION (reservation_id, guest_id, room_id, check_in_date, check_out_date, status)
    VALUES (seq_reservation_id.NEXTVAL, p_guest_id, p_room_id, p_check_in, p_check_out, 'CONFIRMED')
    RETURNING reservation_id INTO p_reservation_id;
    
    UPDATE ROOM SET status = 'RESERVED' WHERE room_id = p_room_id;
    COMMIT;
END;
/

-- Procedure: Check-in guest
CREATE OR REPLACE PROCEDURE check_in_guest(p_reservation_id IN NUMBER)
IS
    v_room_id NUMBER;
BEGIN
    UPDATE RESERVATION SET status = 'CHECKED_IN'
    WHERE reservation_id = p_reservation_id
    RETURNING room_id INTO v_room_id;
    
    UPDATE ROOM SET status = 'OCCUPIED' WHERE room_id = v_room_id;
    COMMIT;
END;
/

-- Procedure: Check-out guest
CREATE OR REPLACE PROCEDURE check_out_guest(
    p_reservation_id IN NUMBER,
    p_payment_method IN VARCHAR2
)
IS
    v_room_id NUMBER;
    v_total_amount NUMBER;
    v_count NUMBER;
BEGIN
    IF p_reservation_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20003, 'Reservation ID cannot be null');
    END IF;
    
    SELECT COUNT(*) INTO v_count FROM RESERVATION WHERE reservation_id = p_reservation_id;
    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20004, 'Reservation not found');
    END IF;
    
    v_total_amount := calculate_total_cost(p_reservation_id);
    
    UPDATE RESERVATION SET status = 'CHECKED_OUT', total_amount = v_total_amount
    WHERE reservation_id = p_reservation_id
    RETURNING room_id INTO v_room_id;
    
    INSERT INTO PAYMENT (payment_id, reservation_id, amount, payment_method, status)
    VALUES (seq_payment_id.NEXTVAL, p_reservation_id, v_total_amount, p_payment_method, 'COMPLETED');
    
    UPDATE ROOM SET status = 'AVAILABLE' WHERE room_id = v_room_id;
    COMMIT;
END;
/

-- Function: Get available rooms
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
        );
    RETURN v_cursor;
END;
/

-- Procedure: Daily occupancy report
CREATE OR REPLACE PROCEDURE daily_occupancy_report(p_date DATE)
IS
    v_total_rooms NUMBER;
    v_occupied_rooms NUMBER;
    v_occupancy_rate NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total_rooms FROM ROOM WHERE status != 'MAINTENANCE';
    
    SELECT COUNT(*) INTO v_occupied_rooms
    FROM RESERVATION r
    WHERE r.status IN ('CHECKED_IN', 'CONFIRMED')
    AND p_date BETWEEN r.check_in_date AND r.check_out_date - 1;
    
    v_occupancy_rate := ROUND((v_occupied_rooms / v_total_rooms) * 100, 2);
    
    DBMS_OUTPUT.PUT_LINE('=== OCCUPANCY REPORT FOR ' || TO_CHAR(p_date, 'DD-MON-YYYY') || ' ===');
    DBMS_OUTPUT.PUT_LINE('Total Rooms: ' || v_total_rooms);
    DBMS_OUTPUT.PUT_LINE('Occupied Rooms: ' || v_occupied_rooms);
    DBMS_OUTPUT.PUT_LINE('Occupancy Rate: ' || v_occupancy_rate || '%');
END;
/