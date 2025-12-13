-- Smart Hotel Booking Engine - Analytics and Window Functions

-- 1. Revenue analysis with window functions
SELECT 
    r.reservation_id,
    g.first_name || ' ' || g.last_name AS guest_name,
    rm.room_type,
    r.total_amount,
    ROW_NUMBER() OVER (ORDER BY r.total_amount DESC) AS revenue_rank,
    RANK() OVER (PARTITION BY rm.room_type ORDER BY r.total_amount DESC) AS type_rank,
    DENSE_RANK() OVER (ORDER BY r.total_amount DESC) AS dense_rank,
    LAG(r.total_amount) OVER (ORDER BY r.reservation_date) AS prev_booking_amount,
    LEAD(r.total_amount) OVER (ORDER BY r.reservation_date) AS next_booking_amount,
    AVG(r.total_amount) OVER (PARTITION BY rm.room_type) AS avg_type_revenue,
    SUM(r.total_amount) OVER (ORDER BY r.reservation_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM RESERVATION r
JOIN GUEST g ON r.guest_id = g.guest_id
JOIN ROOM rm ON r.room_id = rm.room_id
WHERE r.status = 'CHECKED_OUT'
ORDER BY r.total_amount DESC;

-- 2. Daily occupancy report with cursor
CREATE OR REPLACE PROCEDURE daily_occupancy_report(p_report_date DATE DEFAULT SYSDATE)
IS
    CURSOR c_occupancy IS
        SELECT 
            rm.room_type,
            COUNT(*) as occupied_rooms,
            AVG(rm.nightly_rate) as avg_rate,
            SUM(rm.nightly_rate) as total_revenue
        FROM ROOM rm
        JOIN RESERVATION r ON rm.room_id = r.room_id
        WHERE r.status = 'CHECKED_IN'
        AND p_report_date BETWEEN r.check_in_date AND r.check_out_date
        GROUP BY rm.room_type
        ORDER BY total_revenue DESC;
    
    v_total_occupied NUMBER := 0;
    v_total_revenue NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== DAILY OCCUPANCY REPORT FOR ' || TO_CHAR(p_report_date, 'DD-MON-YYYY') || ' ===');
    DBMS_OUTPUT.PUT_LINE('Room Type    | Occupied | Avg Rate | Revenue');
    DBMS_OUTPUT.PUT_LINE('-------------|----------|----------|----------');
    
    FOR rec IN c_occupancy LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(rec.room_type, 12) || '| ' ||
            LPAD(rec.occupied_rooms, 8) || ' | ' ||
            LPAD(TO_CHAR(rec.avg_rate, '999.99'), 8) || ' | ' ||
            LPAD(TO_CHAR(rec.total_revenue, '9999.99'), 8)
        );
        v_total_occupied := v_total_occupied + rec.occupied_rooms;
        v_total_revenue := v_total_revenue + rec.total_revenue;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('-------------|----------|----------|----------');
    DBMS_OUTPUT.PUT_LINE('TOTAL        | ' || LPAD(v_total_occupied, 8) || ' |          | ' || LPAD(TO_CHAR(v_total_revenue, '9999.99'), 8));
END;
/

-- 3. Guest loyalty analysis
SELECT 
    g.guest_id,
    g.first_name || ' ' || g.last_name AS guest_name,
    COUNT(r.reservation_id) AS total_bookings,
    SUM(r.total_amount) AS total_spent,
    AVG(r.total_amount) AS avg_booking_value,
    MIN(r.reservation_date) AS first_booking,
    MAX(r.reservation_date) AS last_booking,
    CASE 
        WHEN COUNT(r.reservation_id) >= 5 THEN 'VIP'
        WHEN COUNT(r.reservation_id) >= 3 THEN 'GOLD'
        WHEN COUNT(r.reservation_id) >= 1 THEN 'SILVER'
        ELSE 'NEW'
    END AS loyalty_tier,
    PERCENT_RANK() OVER (ORDER BY SUM(r.total_amount)) AS spending_percentile
FROM GUEST g
LEFT JOIN RESERVATION r ON g.guest_id = r.guest_id
GROUP BY g.guest_id, g.first_name, g.last_name
ORDER BY total_spent DESC NULLS LAST;

-- 4. Room utilization analysis
WITH room_stats AS (
    SELECT 
        rm.room_id,
        rm.room_number,
        rm.room_type,
        rm.nightly_rate,
        COUNT(r.reservation_id) AS booking_count,
        SUM(r.check_out_date - r.check_in_date) AS total_nights_booked,
        AVG(r.total_amount) AS avg_revenue_per_booking,
        FIRST_VALUE(r.reservation_date) OVER (
            PARTITION BY rm.room_id 
            ORDER BY r.reservation_date DESC
        ) AS last_booking_date
    FROM ROOM rm
    LEFT JOIN RESERVATION r ON rm.room_id = r.room_id
    WHERE r.status IN ('CHECKED_OUT', 'CHECKED_IN')
    GROUP BY rm.room_id, rm.room_number, rm.room_type, rm.nightly_rate
)
SELECT 
    room_number,
    room_type,
    nightly_rate,
    booking_count,
    total_nights_booked,
    ROUND(total_nights_booked / NULLIF(booking_count, 0), 2) AS avg_stay_length,
    avg_revenue_per_booking,
    last_booking_date,
    CASE 
        WHEN booking_count = 0 THEN 'NEVER_BOOKED'
        WHEN booking_count < 2 THEN 'LOW_UTILIZATION'
        WHEN booking_count < 5 THEN 'MEDIUM_UTILIZATION'
        ELSE 'HIGH_UTILIZATION'
    END AS utilization_category
FROM room_stats
ORDER BY booking_count DESC, total_nights_booked DESC;

-- 5. Payment method analysis
SELECT 
    p.payment_method,
    COUNT(*) AS transaction_count,
    SUM(p.amount) AS total_amount,
    AVG(p.amount) AS avg_transaction,
    MIN(p.amount) AS min_transaction,
    MAX(p.amount) AS max_transaction,
    STDDEV(p.amount) AS amount_stddev,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () AS percentage_of_transactions
FROM PAYMENT p
WHERE p.status = 'COMPLETED'
GROUP BY p.payment_method
ORDER BY total_amount DESC;

-- 6. Service popularity analysis
SELECT 
    s.service_name,
    s.service_type,
    s.price,
    COUNT(rs.reservation_id) AS times_ordered,
    SUM(rs.quantity) AS total_quantity,
    SUM(rs.total_cost) AS total_revenue,
    AVG(rs.quantity) AS avg_quantity_per_order,
    RANK() OVER (ORDER BY COUNT(rs.reservation_id) DESC) AS popularity_rank,
    RANK() OVER (ORDER BY SUM(rs.total_cost) DESC) AS revenue_rank
FROM SERVICE s
LEFT JOIN RESERVATION_SERVICE rs ON s.service_id = rs.service_id
GROUP BY s.service_id, s.service_name, s.service_type, s.price
ORDER BY times_ordered DESC;