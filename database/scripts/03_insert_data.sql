-- Smart Hotel Booking Engine - Test Data Insertion

-- Insert STAFF data
INSERT INTO STAFF (staff_id, first_name, last_name, role, email, hire_date, salary)
SELECT 200 + ROWNUM, first_name, last_name, role, email, hire_date, salary FROM (
    SELECT 'Jean' first_name, 'Uwimana' last_name, 'MANAGER' role, 'jean.uwimana@hotel.rw' email, DATE '2020-01-15' hire_date, 2500000 salary FROM dual UNION ALL
    SELECT 'Marie', 'Mukamana', 'CLERK', 'marie.mukamana@hotel.rw', DATE '2021-03-10', 1200000 FROM dual UNION ALL
    SELECT 'Paul', 'Nkurunziza', 'CASHIER', 'paul.nkurunziza@hotel.rw', DATE '2021-06-20', 1100000 FROM dual UNION ALL
    SELECT 'Grace', 'Uwamahoro', 'CLERK', 'grace.uwamahoro@hotel.rw', DATE '2022-01-05', 1150000 FROM dual
);

-- Insert ROOM data
INSERT INTO ROOM (room_id, room_number, room_type, capacity, nightly_rate, status, floor_number, amenities)
SELECT 100 + ROWNUM, room_number, room_type, capacity, nightly_rate, status, floor_number, amenities FROM (
    SELECT '101' room_number, 'SINGLE' room_type, 1 capacity, 45000.00 nightly_rate, 'AVAILABLE' status, 1 floor_number, 'WiFi, TV, AC' amenities FROM dual UNION ALL
    SELECT '102', 'DOUBLE', 2, 65000.00, 'AVAILABLE', 1, 'WiFi, TV, AC, Mini-bar' FROM dual UNION ALL
    SELECT '201', 'SUITE', 4, 120000.00, 'AVAILABLE', 2, 'WiFi, TV, AC, Jacuzzi, Balcony' FROM dual UNION ALL
    SELECT '202', 'DOUBLE', 2, 65000.00, 'MAINTENANCE', 2, 'WiFi, TV, AC' FROM dual UNION ALL
    SELECT '301', 'SINGLE', 1, 45000.00, 'OCCUPIED', 3, 'WiFi, TV, AC' FROM dual
);

-- Insert GUEST data
INSERT INTO GUEST (guest_id, first_name, last_name, email, phone, address, date_of_birth, created_date)
SELECT 1000 + ROWNUM, first_name, last_name, email, phone, address, date_of_birth, created_date FROM (
    SELECT 'Aline' first_name, 'Uwimana' last_name, 'aline.uwimana@gmail.com' email, '+250-788-123456' phone, 'KG 15 Ave, Kigali' address, DATE '1985-05-15' date_of_birth, SYSDATE-30 created_date FROM dual UNION ALL
    SELECT 'Eric', 'Nshimiyimana', 'eric.nshimiyimana@yahoo.com', '+250-788-234567', 'KN 3 Rd, Nyamirambo', DATE '1990-08-22', SYSDATE-25 FROM dual UNION ALL
    SELECT 'Claudine', 'Mukamana', 'claudine.mukamana@hotmail.com', '+250-788-345678', 'KG 7 Ave, Remera', DATE '1988-12-03', SYSDATE-20 FROM dual UNION ALL
    SELECT 'David', 'Habimana', 'david.habimana@gmail.com', '+250-788-456789', 'KG 11 St, Kimisagara', DATE '1992-03-18', SYSDATE-15 FROM dual
);

-- Insert SERVICE data
INSERT INTO SERVICE (service_id, service_name, service_type, price, description)
SELECT 400 + ROWNUM, service_name, service_type, price, description FROM (
    SELECT 'Room Service' service_name, 'FOOD' service_type, 8500.00 price, 'In-room dining service' description FROM dual UNION ALL
    SELECT 'Laundry', 'CLEANING', 5000.00, 'Laundry and dry cleaning' FROM dual UNION ALL
    SELECT 'Spa Treatment', 'WELLNESS', 25000.00, 'Relaxing spa services' FROM dual UNION ALL
    SELECT 'Airport Shuttle', 'TRANSPORT', 12000.00, 'Transportation to/from Kigali Airport' FROM dual
);

-- Insert RESERVATION data
INSERT INTO RESERVATION (reservation_id, guest_id, room_id, staff_id, check_in_date, check_out_date, reservation_date, status, total_amount, special_requests)
SELECT 300 + ROWNUM, guest_id, room_id, staff_id, check_in_date, check_out_date, reservation_date, status, total_amount, special_requests FROM (
    SELECT 1001 guest_id, 101 room_id, 202 staff_id, DATE '2024-01-15' check_in_date, DATE '2024-01-18' check_out_date, SYSDATE-10 reservation_date, 'CHECKED_OUT' status, 135000.00 total_amount, 'Late checkout requested' special_requests FROM dual UNION ALL
    SELECT 1002, 102, 203, DATE '2024-01-20', DATE '2024-01-23', SYSDATE-8, 'CHECKED_OUT', 195000.00, NULL FROM dual UNION ALL
    SELECT 1003, 103, 202, DATE '2024-02-01', DATE '2024-02-05', SYSDATE-5, 'CONFIRMED', 480000.00, 'Anniversary celebration' FROM dual UNION ALL
    SELECT 1004, 105, 204, DATE '2024-02-10', DATE '2024-02-12', SYSDATE-2, 'CHECKED_IN', 90000.00, NULL FROM dual
);

-- Insert RESERVATION_SERVICE data
INSERT INTO RESERVATION_SERVICE VALUES (301, 401, 2, DATE '2024-01-16', 17000.00);
INSERT INTO RESERVATION_SERVICE VALUES (302, 402, 1, DATE '2024-01-21', 5000.00);
INSERT INTO RESERVATION_SERVICE VALUES (303, 403, 1, DATE '2024-02-02', 25000.00);
INSERT INTO RESERVATION_SERVICE VALUES (304, 404, 1, DATE '2024-02-11', 12000.00);

-- Insert PAYMENT data
INSERT INTO PAYMENT (payment_id, reservation_id, amount, payment_method, payment_date, transaction_id, status)
SELECT 500 + ROWNUM, reservation_id, amount, payment_method, payment_date, transaction_id, status FROM (
    SELECT 301 reservation_id, 152000.00 amount, 'CREDIT_CARD' payment_method, DATE '2024-01-18' payment_date, 'TXN001' transaction_id, 'COMPLETED' status FROM dual UNION ALL
    SELECT 302, 200000.00, 'DEBIT_CARD', DATE '2024-01-23', 'TXN002', 'COMPLETED' FROM dual UNION ALL
    SELECT 303, 505000.00, 'CREDIT_CARD', DATE '2024-02-01', 'TXN003', 'COMPLETED' FROM dual UNION ALL
    SELECT 304, 102000.00, 'CASH', DATE '2024-02-10', 'TXN004', 'PENDING' FROM dual
);

COMMIT;