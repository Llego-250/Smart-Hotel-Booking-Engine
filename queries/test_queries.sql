-- Smart Hotel Booking Engine - Test Queries and Validation

-- Test 1: Basic data retrieval
SELECT 'GUEST COUNT' AS test_name, COUNT(*) AS result FROM GUEST
UNION ALL
SELECT 'ROOM COUNT', COUNT(*) FROM ROOM
UNION ALL
SELECT 'RESERVATION COUNT', COUNT(*) FROM RESERVATION
UNION ALL
SELECT 'PAYMENT COUNT', COUNT(*) FROM PAYMENT;

-- Test 2: Join operations
SELECT 
    r.reservation_id,
    g.first_name || ' ' || g.last_name AS guest_name,
    rm.room_number,
    rm.room_type,
    r.check_in_date,
    r.check_out_date,
    r.status,
    p.amount AS payment_amount,
    p.payment_method
FROM RESERVATION r
JOIN GUEST g ON r.guest_id = g.guest_id
JOIN ROOM rm ON r.room_id = rm.room_id
LEFT JOIN PAYMENT p ON r.reservation_id = p.reservation_id
ORDER BY r.reservation_date DESC;

-- Test 3: Aggregation queries
SELECT 
    rm.room_type,
    COUNT(r.reservation_id) AS total_bookings,
    AVG(r.total_amount) AS avg_revenue,
    SUM(r.total_amount) AS total_revenue,
    MIN(r.check_in_date) AS first_booking,
    MAX(r.check_out_date) AS last_checkout
FROM ROOM rm
LEFT JOIN RESERVATION r ON rm.room_id = r.room_id
GROUP BY rm.room_type
ORDER BY total_revenue DESC;

-- Test 4: Subquery operations
SELECT 
    g.first_name || ' ' || g.last_name AS guest_name,
    g.email,
    (SELECT COUNT(*) FROM RESERVATION WHERE guest_id = g.guest_id) AS booking_count,
    (SELECT SUM(total_amount) FROM RESERVATION WHERE guest_id = g.guest_id) AS total_spent
FROM GUEST g
WHERE g.guest_id IN (
    SELECT DISTINCT guest_id 
    FROM RESERVATION 
    WHERE status = 'CHECKED_OUT'
);

-- Test 5: Function testing
SELECT 
    reservation_id,
    calculate_total_cost(reservation_id) AS calculated_cost,
    total_amount AS stored_amount,
    CASE 
        WHEN ABS(calculate_total_cost(reservation_id) - NVL(total_amount, 0)) < 0.01 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END AS cost_validation
FROM RESERVATION
WHERE total_amount IS NOT NULL;

-- Test 6: Constraint validation
-- This should fail due to check constraint
-- INSERT INTO ROOM VALUES (999, 'TEST', 'SINGLE', 1, -100, 'AVAILABLE', 1, 'Test');

-- Test 7: Trigger testing (weekend vs weekday)
SELECT 
    TO_CHAR(SYSDATE, 'DAY') AS current_day,
    TO_NUMBER(TO_CHAR(SYSDATE, 'D')) AS day_number,
    CASE 
        WHEN TO_NUMBER(TO_CHAR(SYSDATE, 'D')) BETWEEN 2 AND 6 
        THEN 'WEEKDAY - RESTRICTED' 
        ELSE 'WEEKEND - ALLOWED' 
    END AS operation_status;

-- Test 8: Audit log verification
SELECT 
    audit_id,
    table_name,
    operation,
    user_name,
    operation_date,
    status
FROM AUDIT_LOG
ORDER BY operation_date DESC;

-- Test 9: Available rooms function test
DECLARE
    v_cursor SYS_REFCURSOR;
    v_room_id NUMBER;
    v_room_number VARCHAR2(10);
    v_room_type VARCHAR2(20);
    v_rate NUMBER;
    v_amenities VARCHAR2(500);
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== AVAILABLE ROOMS TEST ===');
    v_cursor := get_available_rooms(DATE '2024-03-01', DATE '2024-03-05');
    
    LOOP
        FETCH v_cursor INTO v_room_id, v_room_number, v_room_type, v_rate, v_amenities;
        EXIT WHEN v_cursor%NOTFOUND;
        
        DBMS_OUTPUT.PUT_LINE('Room: ' || v_room_number || ' | Type: ' || v_room_type || ' | Rate: $' || v_rate);
    END LOOP;
    
    CLOSE v_cursor;
END;
/

-- Test 10: Data integrity checks
SELECT 
    'Orphan Reservations' AS check_name,
    COUNT(*) AS count
FROM RESERVATION r
WHERE NOT EXISTS (SELECT 1 FROM GUEST g WHERE g.guest_id = r.guest_id)
   OR NOT EXISTS (SELECT 1 FROM ROOM rm WHERE rm.room_id = r.room_id)

UNION ALL

SELECT 
    'Orphan Payments',
    COUNT(*)
FROM PAYMENT p
WHERE NOT EXISTS (SELECT 1 FROM RESERVATION r WHERE r.reservation_id = p.reservation_id)

UNION ALL

SELECT 
    'Invalid Room Status',
    COUNT(*)
FROM ROOM
WHERE status NOT IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE');