-- Smart Hotel Booking Engine - System Test Script

SET SERVEROUTPUT ON;

-- Test 1: Create reservation
DECLARE
    v_reservation_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== TESTING HOTEL BOOKING SYSTEM ===');
    DBMS_OUTPUT.PUT_LINE('Test 1: Creating reservation...');
    
    create_reservation(
        p_guest_id => 1001,
        p_room_id => 101,
        p_check_in => DATE '2024-12-20',
        p_check_out => DATE '2024-12-23',
        p_reservation_id => v_reservation_id
    );
    
    DBMS_OUTPUT.PUT_LINE('✓ Reservation created: ID = ' || v_reservation_id);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Failed: ' || SQLERRM);
END;
/

-- Test 2: Add services
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 2: Adding services...');
    
    INSERT INTO RESERVATION_SERVICE VALUES (301, 401, 2, SYSDATE, 50.00);
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('✓ Services added');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Failed: ' || SQLERRM);
END;
/

-- Test 3: Check-in
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 3: Processing check-in...');
    
    check_in_guest(301);
    
    DBMS_OUTPUT.PUT_LINE('✓ Check-in completed');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Failed: ' || SQLERRM);
END;
/

-- Test 4: Calculate cost
DECLARE
    v_cost NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 4: Calculating total cost...');
    
    v_cost := calculate_total_cost(301);
    
    DBMS_OUTPUT.PUT_LINE('✓ Total cost: $' || v_cost);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Failed: ' || SQLERRM);
END;
/

-- Test 5: Check-out
BEGIN
    DBMS_OUTPUT.PUT_LINE('Test 5: Processing check-out...');
    
    check_out_guest(301, 'CREDIT_CARD');
    
    DBMS_OUTPUT.PUT_LINE('✓ Check-out completed');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Failed: ' || SQLERRM);
END;
/

-- Test 6: View results
BEGIN
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== SYSTEM STATUS ===');
    
    FOR rec IN (
        SELECT 'Guests' AS item, COUNT(*) AS count FROM GUEST
        UNION ALL
        SELECT 'Rooms', COUNT(*) FROM ROOM
        UNION ALL
        SELECT 'Reservations', COUNT(*) FROM RESERVATION
        UNION ALL
        SELECT 'Payments', COUNT(*) FROM PAYMENT
        UNION ALL
        SELECT 'Audit Logs', COUNT(*) FROM AUDIT_LOG
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(rec.item || ': ' || rec.count);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('✓ Hotel Booking System Ready!');
END;
/