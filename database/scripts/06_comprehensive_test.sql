-- Smart Hotel Booking Engine - Comprehensive System Test

SET SERVEROUTPUT ON;

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== SMART HOTEL BOOKING ENGINE - SYSTEM TEST ===');
    DBMS_OUTPUT.PUT_LINE('Test Date: ' || TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI:SS'));
    DBMS_OUTPUT.PUT_LINE('');
END;
/

-- Test 1: Create new reservation (should work on weekend)
DECLARE
    v_reservation_id NUMBER;
    v_guest_id NUMBER := 1001;
    v_room_id NUMBER := 102;
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 1: Creating new reservation...');
    
    create_reservation(
        p_guest_id => v_guest_id,
        p_room_id => v_room_id,
        p_check_in => DATE '2024-03-15',
        p_check_out => DATE '2024-03-18',
        p_staff_id => 202,
        p_special_requests => 'Late checkout requested',
        p_reservation_id => v_reservation_id
    );
    
    DBMS_OUTPUT.PUT_LINE('✓ Reservation created successfully: ID = ' || v_reservation_id);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Reservation creation failed: ' || SQLERRM);
END;
/

-- Test 2: Check-in process
DECLARE
    v_reservation_id NUMBER := 305; -- Use the newly created reservation
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 2: Processing check-in...');
    
    check_in_guest(
        p_reservation_id => v_reservation_id,
        p_staff_id => 203
    );
    
    DBMS_OUTPUT.PUT_LINE('✓ Check-in completed successfully');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Check-in failed: ' || SQLERRM);
END;
/

-- Test 3: Add services to reservation
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 3: Adding services to reservation...');
    
    INSERT INTO RESERVATION_SERVICE VALUES (305, 401, 1, SYSDATE, 25.00);
    INSERT INTO RESERVATION_SERVICE VALUES (305, 403, 1, SYSDATE, 80.00);
    
    DBMS_OUTPUT.PUT_LINE('✓ Services added successfully');
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Service addition failed: ' || SQLERRM);
        ROLLBACK;
END;
/

-- Test 4: Calculate total cost
DECLARE
    v_total_cost NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 4: Calculating total cost...');
    
    v_total_cost := calculate_total_cost(305);
    
    DBMS_OUTPUT.PUT_LINE('✓ Total cost calculated: $' || TO_CHAR(v_total_cost, '999.99'));
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Cost calculation failed: ' || SQLERRM);
END;
/

-- Test 5: Check-out process
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 5: Processing check-out...');
    
    check_out_guest(
        p_reservation_id => 305,
        p_payment_method => 'CREDIT_CARD'
    );
    
    DBMS_OUTPUT.PUT_LINE('✓ Check-out completed successfully');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Check-out failed: ' || SQLERRM);
END;
/

-- Test 6: Available rooms query
DECLARE
    v_cursor SYS_REFCURSOR;
    v_room_id NUMBER;
    v_room_number VARCHAR2(10);
    v_room_type VARCHAR2(20);
    v_rate NUMBER;
    v_amenities VARCHAR2(500);
    v_count NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 6: Querying available rooms...');
    
    v_cursor := get_available_rooms(DATE '2024-04-01', DATE '2024-04-05');
    
    LOOP
        FETCH v_cursor INTO v_room_id, v_room_number, v_room_type, v_rate, v_amenities;
        EXIT WHEN v_cursor%NOTFOUND;
        v_count := v_count + 1;
    END LOOP;
    
    CLOSE v_cursor;
    DBMS_OUTPUT.PUT_LINE('✓ Found ' || v_count || ' available rooms');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Room query failed: ' || SQLERRM);
END;
/

-- Test 7: Trigger restriction test (simulate weekday)
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 7: Testing business rule restrictions...');
    
    -- This will show current day status
    IF is_operation_restricted THEN
        DBMS_OUTPUT.PUT_LINE('⚠ Operations currently restricted (weekday/holiday)');
    ELSE
        DBMS_OUTPUT.PUT_LINE('✓ Operations allowed (weekend)');
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Restriction test failed: ' || SQLERRM);
END;
/

-- Test 8: Double booking prevention
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 8: Testing double booking prevention...');
    
    -- Try to book the same room for overlapping dates
    INSERT INTO RESERVATION (
        reservation_id, guest_id, room_id, check_in_date, check_out_date, status
    ) VALUES (
        seq_reservation_id.NEXTVAL, 1002, 102, DATE '2024-03-16', DATE '2024-03-19', 'CONFIRMED'
    );
    
    DBMS_OUTPUT.PUT_LINE('✗ Double booking prevention failed - booking allowed');
    ROLLBACK;
    
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -20200 THEN
            DBMS_OUTPUT.PUT_LINE('✓ Double booking prevented successfully');
        ELSE
            DBMS_OUTPUT.PUT_LINE('✗ Unexpected error: ' || SQLERRM);
        END IF;
        ROLLBACK;
END;
/

-- Test 9: Generate occupancy report
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 9: Generating occupancy report...');
    daily_occupancy_report(SYSDATE);
    DBMS_OUTPUT.PUT_LINE('✓ Occupancy report generated');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Report generation failed: ' || SQLERRM);
END;
/

-- Test 10: Audit log verification
DECLARE
    v_audit_count NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('TEST 10: Verifying audit logs...');
    
    SELECT COUNT(*) INTO v_audit_count
    FROM AUDIT_LOG
    WHERE operation_date >= TRUNC(SYSDATE);
    
    DBMS_OUTPUT.PUT_LINE('✓ Found ' || v_audit_count || ' audit entries for today');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('✗ Audit verification failed: ' || SQLERRM);
END;
/

-- Final system status
BEGIN
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== SYSTEM STATUS SUMMARY ===');
    
    FOR rec IN (
        SELECT 'Total Guests' AS metric, COUNT(*) AS value FROM GUEST
        UNION ALL
        SELECT 'Total Rooms', COUNT(*) FROM ROOM
        UNION ALL
        SELECT 'Active Reservations', COUNT(*) FROM RESERVATION WHERE status IN ('CONFIRMED', 'CHECKED_IN')
        UNION ALL
        SELECT 'Completed Payments', COUNT(*) FROM PAYMENT WHERE status = 'COMPLETED'
        UNION ALL
        SELECT 'Available Rooms', COUNT(*) FROM ROOM WHERE status = 'AVAILABLE'
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(RPAD(rec.metric, 20) || ': ' || rec.value);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('✓ Smart Hotel Booking Engine - All Tests Completed');
END;
/